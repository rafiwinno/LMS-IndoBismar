<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Cabang;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DashboardController extends Controller
{
    // GET /superadmin/dashboard
    public function index()
    {
        $totalUsers    = Pengguna::count();
        $totalBranches = Cabang::where('status', 'aktif')->count();

        // Weekly chart 7 hari terakhir (default)
        $weeklyChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date  = now('Asia/Jakarta')->subDays($i);
            $count = LoginLog::whereDate('logged_in_at', $date->toDateString())->count();
            $weeklyChart[] = [
                'day'          => $date->format('D'),
                'date'         => $date->format('d/m'),
                'active_users' => $count,
            ];
        }

        return response()->json([
            'stats' => [
                'total_active_users' => $totalUsers,
                'total_branches'     => $totalBranches,
            ],
            'weekly_chart' => $weeklyChart,
        ]);
    }

    // GET /superadmin/dashboard/login-recap
    // Query params: start, end, cabang_id (optional)
    public function loginRecap(Request $request)
    {
        $request->validate([
            'start'     => 'required|date',
            'end'       => 'required|date|after_or_equal:start',
            'cabang_id' => 'nullable|integer|exists:cabang,id_cabang',
        ]);

        $start    = Carbon::parse($request->start, 'Asia/Jakarta')->startOfDay();
        $end      = Carbon::parse($request->end, 'Asia/Jakarta')->endOfDay();
        $cabangId = $request->cabang_id;

        // ── Per hari dalam periode — 1 query batch, bukan N query ──────────
        $dailyStats = LoginLog::join('pengguna', 'login_logs.user_id', '=', 'pengguna.id_pengguna')
            ->whereBetween('login_logs.logged_in_at', [$start, $end])
            ->when($cabangId, fn($q) => $q->where('pengguna.id_cabang', $cabangId))
            ->selectRaw("DATE(CONVERT_TZ(login_logs.logged_in_at, '+00:00', '+07:00')) as login_date, COUNT(*) as total")
            ->groupBy('login_date')
            ->pluck('total', 'login_date');

        $period = CarbonPeriod::create($start, $end);
        $daily  = [];
        foreach ($period as $date) {
            $key     = $date->format('Y-m-d');
            $daily[] = [
                'date'         => $date->format('d/m/Y'),
                'day'          => $date->format('D'),
                'active_users' => (int) ($dailyStats[$key] ?? 0),
            ];
        }

        // ── Total periode — 1 query ────────────────────────────────────────
        $summaryStats = LoginLog::join('pengguna', 'login_logs.user_id', '=', 'pengguna.id_pengguna')
            ->whereBetween('login_logs.logged_in_at', [$start, $end])
            ->when($cabangId, fn($q) => $q->where('pengguna.id_cabang', $cabangId))
            ->selectRaw('COUNT(*) as total_logins, COUNT(DISTINCT login_logs.user_id) as unique_users')
            ->first();

        $totalLogins = (int) $summaryStats->total_logins;
        $uniqueUsers = (int) $summaryStats->unique_users;

        // ── Breakdown per cabang — 1 JOIN query agregat ────────────────────
        $branchStats = LoginLog::join('pengguna', 'login_logs.user_id', '=', 'pengguna.id_pengguna')
            ->whereBetween('login_logs.logged_in_at', [$start, $end])
            ->when($cabangId, fn($q) => $q->where('pengguna.id_cabang', $cabangId))
            ->selectRaw('pengguna.id_cabang, COUNT(*) as total_logins, COUNT(DISTINCT login_logs.user_id) as unique_users')
            ->groupBy('pengguna.id_cabang')
            ->get()
            ->keyBy('id_cabang');

        $branches = Cabang::where('status', 'aktif')
            ->when($cabangId, fn($q) => $q->where('id_cabang', $cabangId))
            ->get();

        $branchBreakdown = $branches->map(function ($cabang) use ($branchStats) {
            $stat = $branchStats[$cabang->id_cabang] ?? null;
            return [
                'id'           => $cabang->id_cabang,
                'nama_cabang'  => $cabang->nama_cabang,
                'kota'         => $cabang->kota,
                'total_logins' => (int) ($stat->total_logins ?? 0),
                'unique_users' => (int) ($stat->unique_users ?? 0),
            ];
        })->sortByDesc('total_logins')->values();

        return response()->json([
            'period' => [
                'start' => $start->format('d/m/Y'),
                'end'   => $end->format('d/m/Y'),
                'days'  => (int) round($start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay())) + 1,
            ],
            'summary' => [
                'total_logins'  => $totalLogins,
                'unique_users'  => $uniqueUsers,
            ],
            'daily_chart'      => $daily,
            'branch_breakdown' => $branchBreakdown,
        ]);
    }
}
