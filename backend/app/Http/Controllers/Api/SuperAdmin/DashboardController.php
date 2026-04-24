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
        $now = Carbon::now('Asia/Jakarta');

        $totalUsers    = Pengguna::whereIn('id_role', [2, 3, 4])->count();
        $totalBranches = Cabang::where('status', 'aktif')->count();
        $activeCities  = Cabang::where('status', 'aktif')->distinct()->count('kota');

        $newUsersMonth = Pengguna::whereIn('id_role', [2, 3, 4])
            ->whereYear('created_at',  $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        // Weekly chart — batch query dengan timezone conversion agar hitungan per hari tepat WIB
        $start7 = $now->copy()->subDays(6)->startOfDay()->utc();
        $end7   = $now->copy()->endOfDay()->utc();

        $dailyCounts = LoginLog::whereBetween('logged_in_at', [$start7, $end7])
            ->selectRaw("DATE(CONVERT_TZ(logged_in_at, '+00:00', '+07:00')) as login_date, COUNT(*) as total")
            ->groupBy('login_date')
            ->pluck('total', 'login_date');

        $weeklyChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $weeklyChart[] = [
                'day'          => $date->format('D'),
                'date'         => $date->format('d/m'),
                'active_users' => (int) ($dailyCounts[$date->format('Y-m-d')] ?? 0),
            ];
        }

        return response()->json([
            'stats' => [
                'total_users'      => $totalUsers,
                'total_branches'   => $totalBranches,
                'new_users_month'  => $newUsersMonth,
                'active_cities'    => $activeCities,
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

        $start = Carbon::parse($request->start, 'Asia/Jakarta')->startOfDay();
        $end   = Carbon::parse($request->end,   'Asia/Jakarta')->endOfDay();

        if ($start->diffInDays($end) > 366) {
            return response()->json(['message' => 'Rentang tanggal maksimal 1 tahun (366 hari).'], 422);
        }
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
