<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Kursus;
use App\Models\PesertaKursus;
use App\Models\PengumpulanTugas;
use App\Models\AttemptKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    /**
     * GET /api/laporan/dashboard
     */
    public function dashboard(Request $request)
    {
        $idCabang  = $request->user()?->id_cabang;
        $startDate = now()->subMonths(11)->startOfMonth();

        $pesertaByMonth = Pengguna::where('id_role', 4)
            ->where('dibuat_pada', '>=', $startDate)
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->selectRaw('YEAR(dibuat_pada) as yr, MONTH(dibuat_pada) as mo, COUNT(*) as total')
            ->groupBy('yr', 'mo')
            ->get()
            ->keyBy(fn($r) => $r->yr . '-' . $r->mo);

        $completionsQuery = PesertaKursus::where('status', 'selesai')
            ->where('tanggal_daftar', '>=', $startDate);

        if ($idCabang) {
            $completionsQuery->whereHas('kursus', fn($q) => $q->where('id_cabang', $idCabang));
        }

        $completionsByMonth = $completionsQuery
            ->selectRaw('YEAR(tanggal_daftar) as yr, MONTH(tanggal_daftar) as mo, COUNT(*) as total')
            ->groupBy('yr', 'mo')
            ->get()
            ->keyBy(fn($r) => $r->yr . '-' . $r->mo);

        $data = collect(range(11, 0))->map(function ($monthsAgo) use ($pesertaByMonth, $completionsByMonth) {
            $date = now()->subMonths($monthsAgo);
            $key  = $date->year . '-' . $date->month;
            return [
                'name'         => $date->format('M y'),
                'participants' => (int) ($pesertaByMonth->get($key)?->total ?? 0),
                'completions'  => (int) ($completionsByMonth->get($key)?->total ?? 0),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/peserta
     */
    public function peserta(Request $request)
    {
        $idCabang = $request->user()?->id_cabang;

        $data = Pengguna::with(['cabang', 'dataPkl', 'pesertaKursus'])
            ->where('id_role', 4)
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->limit(500)
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
    public function kursus(Request $request)
    {
        $idCabang = $request->user()?->id_cabang;

        $data = Kursus::with(['trainer', 'pesertaKursus'])
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
            ->limit(500)
            ->get()
            ->map(function ($k) {
                $total   = $k->pesertaKursus->count();
                $selesai = $k->pesertaKursus->where('status', 'selesai')->count();
                return [
                    'judul'           => $k->judul_kursus,
                    'trainer'         => $k->trainer->nama ?? '-',
                    'status'          => $k->status,
                    'total'           => $total,
                    'completed'       => $selesai,
                    'completion_rate' => $total > 0 ? round(($selesai / $total) * 100) : 0,
                ];
            });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/kuis
     */
    public function kuis(Request $request)
    {
        $idCabang = $request->user()?->id_cabang;

        $query = DB::table('kuis as k')
            ->leftJoin('kursus as kr', 'kr.id_kursus', '=', 'k.id_kursus')
            ->leftJoin('attempt_kuis as ak', 'ak.id_kuis', '=', 'k.id_kuis');

        if ($idCabang) {
            $query->where('kr.id_cabang', $idCabang);
        }

        $data = $query
            ->select(
                'k.id_kuis',
                'k.judul_kuis',
                'kr.judul_kursus',
                DB::raw('COUNT(DISTINCT ak.id_attempt) as total_attempts'),
                DB::raw("COUNT(DISTINCT CASE WHEN ak.status = 'selesai' THEN ak.id_attempt END) as selesai"),
                DB::raw("AVG(CASE WHEN ak.status = 'selesai' THEN ak.skor END) as avg_skor")
            )
            ->groupBy('k.id_kuis', 'k.judul_kuis', 'kr.judul_kursus')
            ->get()
            ->map(fn($r) => [
                'judul'          => $r->judul_kuis,
                'kursus'         => $r->judul_kursus ?? '-',
                'total_attempts' => (int) $r->total_attempts,
                'selesai'        => (int) $r->selesai,
                'avg_skor'       => $r->avg_skor ? round($r->avg_skor, 1) : null,
            ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/laporan/trainer
     */
    public function trainer(Request $request)
    {
        $idCabang = $request->user()?->id_cabang;

        $data = Pengguna::with(['kursus.pesertaKursus'])
            ->whereHas('role', fn($q) => $q->where('nama_role', 'trainer'))
            ->when($idCabang, fn($q) => $q->where('id_cabang', $idCabang))
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
