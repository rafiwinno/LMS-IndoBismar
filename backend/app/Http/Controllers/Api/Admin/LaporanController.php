<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Kursus;
use App\Models\PesertaKursus;
use App\Models\PengumpulanTugas;
use App\Models\AttemptKuis;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    /**
     * GET /api/laporan/dashboard
     * Data chart untuk halaman Reports
     */
    public function dashboard()
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $year   = now()->year;

        $data = collect(range(1, 12))->map(function ($month) use ($months, $year) {
            $peserta = Pengguna::whereHas('role', fn($q) => $q->where('nama_role', 'peserta'))
                ->whereYear('dibuat_pada', $year)
                ->whereMonth('dibuat_pada', $month)
                ->count();

            $completions = PesertaKursus::where('status', 'selesai')
                ->whereYear('tanggal_daftar', $year)
                ->whereMonth('tanggal_daftar', $month)
                ->count();

            return [
                'name'         => $months[$month - 1],
                'participants' => $peserta,
                'completions'  => $completions,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/peserta
     */
    public function peserta()
    {
        $data = Pengguna::with(['cabang', 'dataPkl', 'pesertaKursus'])
            ->whereHas('role', fn($q) => $q->where('nama_role', 'peserta'))
            ->get()
            ->map(function ($p) {
                $kursus  = $p->pesertaKursus->count();
                $selesai = $p->pesertaKursus->where('status', 'selesai')->count();
                return [
                    'nama'             => $p->nama,
                    'email'            => $p->email,
                    'asal_sekolah'     => $p->dataPkl->asal_sekolah ?? '-',
                    'cabang'           => $p->cabang->nama_cabang ?? '-',
                    'enrolled_courses' => $kursus,
                    'completed'        => $selesai,
                    'progress'         => $kursus > 0 ? round(($selesai / $kursus) * 100) : 0,
                    'status'           => $p->status,
                ];
            });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/kursus
     */
    public function kursus()
    {
        $data = Kursus::with(['trainer', 'pesertaKursus'])->get()->map(function ($k) {
            $total   = $k->pesertaKursus->count();
            $selesai = $k->pesertaKursus->where('status', 'selesai')->count();
            return [
                'judul'       => $k->judul_kursus,
                'trainer'     => $k->trainer->nama ?? '-',
                'status'      => $k->status,
                'total'       => $total,
                'completed'   => $selesai,
                'completion_rate' => $total > 0 ? round(($selesai / $total) * 100) : 0,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/tugas
     */
    public function tugas()
    {
        $data = DB::table('tugas as t')
            ->leftJoin('kursus as k', 'k.id_kursus', '=', 't.id_kursus')
            ->leftJoin('pengumpulan_tugas as pt', 'pt.id_tugas', '=', 't.id_tugas')
            ->leftJoin('peserta_kursus as pk', 'pk.id_kursus', '=', 't.id_kursus')
            ->select(
                't.judul_tugas',
                'k.judul_kursus',
                't.deadline',
                DB::raw('COUNT(DISTINCT pt.id_pengumpulan) as submissions'),
                DB::raw('COUNT(DISTINCT pk.id_peserta_kursus) as total_peserta'),
                DB::raw('AVG(pt.nilai) as avg_nilai')
            )
            ->groupBy('t.id_tugas', 't.judul_tugas', 'k.judul_kursus', 't.deadline')
            ->get()
            ->map(fn($r) => [
                'judul'        => $r->judul_tugas,
                'kursus'       => $r->judul_kursus,
                'deadline'     => $r->deadline,
                'submissions'  => $r->submissions,
                'total'        => $r->total_peserta,
                'avg_nilai'    => $r->avg_nilai ? round($r->avg_nilai, 1) : null,
            ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/trainer
     */
    public function trainer()
    {
        $data = Pengguna::with(['kursus.pesertaKursus'])
            ->whereHas('role', fn($q) => $q->where('nama_role', 'trainer'))
            ->get()
            ->map(function ($t) {
                $kursus = $t->kursus;
                $totalPeserta = $kursus->sum(fn($k) => $k->pesertaKursus->count());
                return [
                    'nama'          => $t->nama,
                    'email'         => $t->email,
                    'total_kursus'  => $kursus->count(),
                    'total_peserta' => $totalPeserta,
                    'status'        => $t->status,
                ];
            });

        return response()->json(['data' => $data]);
    }
}
