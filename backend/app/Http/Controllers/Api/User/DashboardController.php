<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $id_pengguna = $request->id_pengguna;

        // Total kursus yang diikuti peserta
        $totalKursus = DB::table('peserta_kursus')
            ->where('id_pengguna', $id_pengguna)
            ->count();

        // Kursus yang sudah selesai
        $kursusSelesai = DB::table('peserta_kursus')
            ->where('id_pengguna', $id_pengguna)
            ->where('status', 'selesai')
            ->count();

        // Tugas pending (belum dikumpulkan)
        $tugasPending = DB::table('tugas')
            ->join('peserta_kursus', 'tugas.id_kursus', '=', 'peserta_kursus.id_kursus')
            ->leftJoin('pengumpulan_tugas', function ($join) use ($id_pengguna) {
                $join->on('pengumpulan_tugas.id_tugas', '=', 'tugas.id_tugas')
                     ->where('pengumpulan_tugas.id_pengguna', '=', $id_pengguna);
            })
            ->where('peserta_kursus.id_pengguna', $id_pengguna)
            ->whereNull('pengumpulan_tugas.id_tugas')
            ->count();

        // Nilai rata-rata
        $nilaiRata = DB::table('penilaian_pkl')
            ->where('id_pengguna', $id_pengguna)
            ->avg('nilai_akhir');

        return response()->json([
            'total_kursus'   => $totalKursus,
            'kursus_selesai' => $kursusSelesai,
            'tugas_pending'  => $tugasPending,
            'nilai_rata_rata' => $nilaiRata ? round($nilaiRata, 2) : 0,
        ]);
    }
}