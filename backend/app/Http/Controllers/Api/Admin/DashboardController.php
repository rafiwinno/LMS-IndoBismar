<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Kursus;
use App\Models\Materi;
use App\Models\Tugas;
use App\Models\AttemptKuis;
use App\Models\PesertaKursus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $admin    = $request->user();
        $adminId  = $admin->id_pengguna;
        $cabangId = $admin->id_cabang;

        // Kursus IDs milik cabang ini — dipakai untuk scope semua query
        $kursusIds = Kursus::where('id_cabang', $cabangId)->pluck('id_kursus');

        // ── Stat Cards — scoped by cabang ────────────────────────────────────
        $totalPeserta = Pengguna::where('id_role', 4)->where('id_cabang', $cabangId)->where('status', 'aktif')->count();
        $totalKursus  = Kursus::where('id_cabang', $cabangId)->where('status', 'publish')->count();
        $totalMateri  = Materi::whereIn('id_kursus', $kursusIds)->count();
        $totalTugas   = Tugas::whereIn('id_kursus', $kursusIds)->count();
        $avgScore     = AttemptKuis::whereHas('kuis', fn($q) => $q->whereIn('id_kursus', $kursusIds))
            ->where('status', 'selesai')->avg('skor') ?? 0;

        // ── Kuis selesai per minggu (cabang ini) ─────────────────────────────
        $weekStart    = now()->subWeeks(5)->startOfWeek();
        $weeklyCounts = DB::table('attempt_kuis as ak')
            ->join('kuis as k', 'k.id_kuis', '=', 'ak.id_kuis')
            ->whereIn('k.id_kursus', $kursusIds)
            ->where('ak.status', 'selesai')
            ->where('ak.waktu_selesai', '>=', $weekStart)
            ->selectRaw('YEARWEEK(ak.waktu_selesai, 1) as yw, COUNT(*) as total')
            ->groupBy('yw')
            ->pluck('total', 'yw');

        $progressData = collect(range(5, 0))->map(function ($weekBack) use ($weeklyCounts) {
            $yw = now()->subWeeks($weekBack)->startOfWeek()->format('oW'); // ISO year+week
            return [
                'name'     => 'Week ' . (6 - $weekBack),
                'progress' => (int) ($weeklyCounts->get((int) $yw, 0)),
            ];
        });

        // ── Completion rate per kursus (cabang ini) ───────────────────────────
        $courseData = Kursus::withCount([
                'pesertaKursus',
                'pesertaKursus as selesai_count' => fn($q) => $q->where('status', 'selesai'),
            ])
            ->where('id_cabang', $cabangId)
            ->where('status', 'publish')
            ->take(5)
            ->get()
            ->map(fn($k) => [
                'name'       => $k->judul_kursus,
                'completion' => $k->peserta_kursus_count > 0
                    ? round(($k->selesai_count / $k->peserta_kursus_count) * 100)
                    : 0,
            ]);

        // ── Materi dibuka per hari (cabang ini) ───────────────────────────────
        $days     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        $dayStart = now()->subDays(6)->startOfDay();
        $dailyCounts = DB::table('progress_materi as pm')
            ->join('materi as m', 'm.id_materi', '=', 'pm.id_materi')
            ->whereIn('m.id_kursus', $kursusIds)
            ->where('pm.waktu_update', '>=', $dayStart)
            ->selectRaw('DATE(pm.waktu_update) as tgl, COUNT(*) as total')
            ->groupBy('tgl')
            ->pluck('total', 'tgl');

        $submissionData = collect(range(6, 0))->map(function ($dayBack) use ($days, $dailyCounts) {
            $date = now()->subDays($dayBack)->toDateString();
            return [
                'name' => $days[now()->subDays($dayBack)->dayOfWeek],
                'rate' => (int) ($dailyCounts->get($date, 0)),
            ];
        });

        // ── Recent Activity (cabang ini) ──────────────────────────────────────
        $submissions = DB::table('pengumpulan_tugas as pt')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'pt.id_pengguna')
            ->join('tugas as t', 't.id_tugas', '=', 'pt.id_tugas')
            ->whereIn('t.id_kursus', $kursusIds)
            ->select('p.nama as user', DB::raw("'mengumpulkan tugas' as action"), 't.judul_tugas as target', 'pt.tanggal_kumpul as time')
            ->orderBy('pt.tanggal_kumpul', 'desc')
            ->limit(5)
            ->get();

        $attempts = DB::table('attempt_kuis as ak')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'ak.id_pengguna')
            ->join('kuis as k', 'k.id_kuis', '=', 'ak.id_kuis')
            ->whereIn('k.id_kursus', $kursusIds)
            ->select('p.nama as user', DB::raw("'completed exam' as action"), 'k.judul_kuis as target', 'ak.waktu_selesai as time')
            ->where('ak.status', 'selesai')
            ->orderBy('ak.waktu_selesai', 'desc')
            ->limit(5)
            ->get();

        $dokumenUploads = DB::table('notifikasi as n')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'n.id_referensi')
            ->where('n.tipe', 'dokumen_menunggu')
            ->where('n.id_penerima', $adminId)
            ->select(
                'p.nama as user',
                DB::raw("'mengupload dokumen' as action"),
                DB::raw("'menunggu verifikasi' as target"),
                DB::raw('MAX(n.dibuat_pada) as time')
            )
            ->groupBy('n.id_referensi', 'p.nama')
            ->orderByDesc('time')
            ->limit(5)
            ->get();

        $recentActivity = collect()
            ->concat($submissions)
            ->concat($attempts)
            ->concat($dokumenUploads)
            ->sortByDesc('time')
            ->take(8)
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
