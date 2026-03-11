<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Kursus;
use App\Models\Materi;
use App\Models\Tugas;
use App\Models\AttemptKuis;
use App\Models\PesertaKursus;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // ── Stat Cards ───────────────────────────────────────────────────────
        $totalPeserta  = Pengguna::whereHas('role', fn($q) => $q->where('nama_role', 'peserta'))
            ->where('status', 'aktif')->count();

        $totalKursus   = Kursus::where('status', 'publish')->count();
        $totalMateri   = Materi::count();
        $totalTugas    = Tugas::count();

        $avgScore = AttemptKuis::where('status', 'selesai')->avg('skor') ?? 0;

        // ── Kuis selesai per minggu (6 minggu terakhir) ──────────────────────
        $progressData = collect(range(5, 0))->map(function ($weekBack) {
            $start = now()->subWeeks($weekBack)->startOfWeek();
            $end   = now()->subWeeks($weekBack)->endOfWeek();

            $selesai = AttemptKuis::where('status', 'selesai')
                ->whereBetween('waktu_selesai', [$start, $end])
                ->count();

            return [
                'name'     => 'Week ' . (6 - $weekBack),
                'progress' => $selesai,
            ];
        });

        // ── Completion rate per kursus ───────────────────────────────────────
        $courseData = Kursus::with('pesertaKursus')
            ->where('status', 'publish')
            ->take(5)
            ->get()
            ->map(function ($k) {
                $total   = $k->pesertaKursus->count();
                $selesai = $k->pesertaKursus->where('status', 'selesai')->count();
                return [
                    'name'       => $k->judul_kursus,
                    'completion' => $total > 0 ? round(($selesai / $total) * 100) : 0,
                ];
            });

        // ── Materi dibuka per hari (7 hari terakhir) ─────────────────────────
        $days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        $submissionData = collect(range(6, 0))->map(function ($dayBack) use ($days) {
            $date = now()->subDays($dayBack)->toDateString();
            $count = DB::table('progress_materi')
                ->whereDate('waktu_update', $date)->count();
            return [
                'name' => $days[now()->subDays($dayBack)->dayOfWeek],
                'rate' => $count,
            ];
        });

        // ── Recent Activity ──────────────────────────────────────────────────
        $recentActivity = collect();

        // Tugas dikumpulkan
        $submissions = DB::table('pengumpulan_tugas as pt')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'pt.id_pengguna')
            ->join('tugas as t', 't.id_tugas', '=', 'pt.id_tugas')
            ->select('p.nama as user', DB::raw("'submitted assignment' as action"), 't.judul_tugas as target', 'pt.tanggal_kumpul as time')
            ->orderBy('pt.tanggal_kumpul', 'desc')
            ->limit(3)
            ->get();

        // Kuis selesai
        $attempts = DB::table('attempt_kuis as ak')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'ak.id_pengguna')
            ->join('kuis as k', 'k.id_kuis', '=', 'ak.id_kuis')
            ->select('p.nama as user', DB::raw("'completed exam' as action"), 'k.judul_kuis as target', 'ak.waktu_selesai as time')
            ->where('ak.status', 'selesai')
            ->orderBy('ak.waktu_selesai', 'desc')
            ->limit(3)
            ->get();

        $recentActivity = $recentActivity
            ->concat($submissions)
            ->concat($attempts)
            ->sortByDesc('time')
            ->take(5)
            ->values()
            ->map(fn($a) => [
                'user'   => $a->user,
                'action' => $a->action,
                'target' => $a->target,
                'time'   => $a->time,
            ]);

        return response()->json([
            'stats' => [
                'total_peserta'   => $totalPeserta,
                'total_kursus'    => $totalKursus,
                'total_materi'    => $totalMateri,
                'total_tugas'     => $totalTugas,
                'average_score'   => round($avgScore, 1),
            ],
            'progress_data'    => $progressData,
            'course_data'      => $courseData,
            'submission_data'  => $submissionData,
            'recent_activity'  => $recentActivity,
        ]);
    }
}
