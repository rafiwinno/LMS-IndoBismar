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

        // ── Per hari dalam periode ─────────────────────────────────────────
        $period = CarbonPeriod::create($start, $end);
        $daily  = [];

        foreach ($period as $date) {
            $query = LoginLog::whereDate('logged_in_at', $date->toDateString());

            if ($cabangId) {
                $query->whereHas('pengguna', fn($q) => $q->where('id_cabang', $cabangId));
            }

            $daily[] = [
                'date'         => $date->format('d/m/Y'),
                'day'          => $date->format('D'),
                'active_users' => $query->count(),
            ];
        }

        // ── Total periode ──────────────────────────────────────────────────
        $totalQuery = LoginLog::whereBetween('logged_in_at', [$start, $end]);
        if ($cabangId) {
            $totalQuery->whereHas('pengguna', fn($q) => $q->where('id_cabang', $cabangId));
        }
        $totalLogins = $totalQuery->count();

        // Unique users (bukan jumlah login, tapi jumlah user unik yang login)
        $uniqueQuery = LoginLog::whereBetween('logged_in_at', [$start, $end]);
        if ($cabangId) {
            $uniqueQuery->whereHas('pengguna', fn($q) => $q->where('id_cabang', $cabangId));
        }
        $uniqueUsers = $uniqueQuery->distinct('user_id')->count('user_id');

        // ── Breakdown per cabang ───────────────────────────────────────────
        $branches = Cabang::where('status', 'aktif')
            ->when($cabangId, fn($q) => $q->where('id_cabang', $cabangId))
            ->get();

        $branchBreakdown = $branches->map(function ($cabang) use ($start, $end) {
            $logins = LoginLog::whereBetween('logged_in_at', [$start, $end])
                ->whereHas('pengguna', fn($q) => $q->where('id_cabang', $cabang->id))
                ->count();
            $unique = LoginLog::whereBetween('logged_in_at', [$start, $end])
                ->whereHas('pengguna', fn($q) => $q->where('id_cabang', $cabang->id))
                ->distinct('user_id')
                ->count('user_id');
            return [
                'id'           => $cabang->id_cabang,
                'nama_cabang'  => $cabang->nama_cabang,
                'kota'         => $cabang->kota,
                'total_logins' => $logins,
                'unique_users' => $unique,
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
