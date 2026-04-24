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
        $admin     = $request->user();
        $adminId   = $admin?->id_pengguna;
        $idCabang  = $admin?->id_cabang;

        // ── Stat Cards ───────────────────────────────────────────────────────
        $totalPeserta = Pengguna::where('id_role', 4)
            ->where('status', 'aktif')
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->count();

        $totalKursus = Kursus::where('status', 'publish')
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->count();

        $totalMateri = Materi::when($idCabang, fn($q) =>
            $q->whereHas('kursus', fn($kq) => $kq->where('id_cabang', $idCabang))
        )->count();

        $totalTugas = Tugas::when($idCabang, fn($q) =>
            $q->whereHas('kursus', fn($kq) => $kq->where('id_cabang', $idCabang))
        )->count();

        $avgScore = AttemptKuis::where('status', 'selesai')
            ->when($idCabang, fn($q) =>
                $q->whereHas('kuis.kursus', fn($kq) => $kq->where('id_cabang', $idCabang))
            )
            ->avg('skor') ?? 0;

        // ── Kuis selesai per minggu ──────────────────────────────────────────
        $weekStart = now()->subWeeks(5)->startOfWeek();

        $weekQuery = DB::table('attempt_kuis as ak')
            ->where('ak.status', 'selesai')
            ->where('ak.waktu_selesai', '>=', $weekStart);

        if ($idCabang) {
            $weekQuery->join('kuis as k', 'k.id_kuis', '=', 'ak.id_kuis')
                      ->join('kursus as kr', 'kr.id_kursus', '=', 'k.id_kursus')
                      ->where('kr.id_cabang', $idCabang);
        }

        $weeklyCounts = $weekQuery
            ->selectRaw('YEARWEEK(ak.waktu_selesai, 1) as yw, COUNT(*) as total')
            ->groupBy('yw')
            ->pluck('total', 'yw');

        $progressData = collect(range(5, 0))->map(function ($weekBack) use ($weeklyCounts) {
            $yw = now()->subWeeks($weekBack)->startOfWeek()->format('oW');
            return [
                'name'     => 'Week ' . (6 - $weekBack),
                'progress' => (int) ($weeklyCounts->get((int) $yw, 0)),
            ];
        });

        // ── Completion rate per kursus ───────────────────────────────────────
        $courseData = Kursus::withCount([
                'pesertaKursus',
                'pesertaKursus as selesai_count' => fn($q) => $q->where('status', 'selesai'),
            ])
            ->where('status', 'publish')
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->take(5)
            ->get()
            ->map(fn($k) => [
                'name'       => $k->judul_kursus,
                'completion' => $k->peserta_kursus_count > 0
                    ? round(($k->selesai_count / $k->peserta_kursus_count) * 100)
                    : 0,
            ]);

        // ── Materi dibuka per hari ───────────────────────────────────────────
        $days     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        $dayStart = now()->subDays(6)->startOfDay();

        $dayQuery = DB::table('progress_materi as pm')
            ->where('pm.waktu_update', '>=', $dayStart);

        if ($idCabang) {
            $dayQuery->join('materi as m', 'm.id_materi', '=', 'pm.id_materi')
                     ->join('kursus as kr', 'kr.id_kursus', '=', 'm.id_kursus')
                     ->where('kr.id_cabang', $idCabang);
        }

        $dailyCounts = $dayQuery
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

        // ── Recent Activity ──────────────────────────────────────────────────
        $subQuery = DB::table('pengumpulan_tugas as pt')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'pt.id_pengguna')
            ->join('tugas as t', 't.id_tugas', '=', 'pt.id_tugas');

        if ($idCabang) {
            $subQuery->join('kursus as ks', 'ks.id_kursus', '=', 't.id_kursus')
                     ->where('ks.id_cabang', $idCabang);
        }

        $submissions = $subQuery
            ->select('p.nama as user', DB::raw("'mengumpulkan tugas' as action"), 't.judul_tugas as target', 'pt.tanggal_kumpul as time')
            ->orderBy('pt.tanggal_kumpul', 'desc')
            ->limit(5)
            ->get();

        $attQuery = DB::table('attempt_kuis as ak')
            ->join('pengguna as p', 'p.id_pengguna', '=', 'ak.id_pengguna')
            ->join('kuis as k', 'k.id_kuis', '=', 'ak.id_kuis');

        if ($idCabang) {
            $attQuery->join('kursus as ks', 'ks.id_kursus', '=', 'k.id_kursus')
                     ->where('ks.id_cabang', $idCabang);
        }

        $attempts = $attQuery
            ->select('p.nama as user', DB::raw("'completed exam' as action"), 'k.judul_kuis as target', 'ak.waktu_selesai as time')
            ->where('ak.status', 'selesai')
            ->orderBy('ak.waktu_selesai', 'desc')
            ->limit(5)
            ->get();

        $dokumenUploads = $adminId
            ? DB::table('notifikasi as n')
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
                ->get()
            : collect();

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
