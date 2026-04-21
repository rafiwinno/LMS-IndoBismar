<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NilaiController extends Controller
{
    // Nilai dan progress peserta
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        // Nilai PKL (teknis & non teknis)
        $nilaiPkl = DB::table('penilaian_pkl')
            ->leftJoin('pengguna as penilai', 'penilaian_pkl.dinilai_oleh', '=', 'penilai.id_pengguna')
            ->where('penilaian_pkl.id_pengguna', $id_pengguna)
            ->select(
                'penilaian_pkl.*',
                'penilai.nama as nama_penilai'
            )
            ->first();

        // Nilai non teknis
        $nilaiNonTeknis = DB::table('nilai_non_teknis')
            ->where('id_pengguna', $id_pengguna)
            ->get();

        // Riwayat kuis peserta
        $riwayatKuis = DB::table('attempt_kuis')
            ->join('kuis', 'attempt_kuis.id_kuis', '=', 'kuis.id_kuis')
            ->join('kursus', 'kuis.id_kursus', '=', 'kursus.id_kursus')
            ->where('attempt_kuis.id_pengguna', $id_pengguna)
            ->select(
                'kuis.judul_kuis',
                'kursus.judul_kursus',
                'attempt_kuis.skor',
                'attempt_kuis.waktu_mulai',
                'attempt_kuis.status'
            )
            ->get();

        // Nilai tugas peserta (hanya yang sudah dinilai)
        $nilaiTugas = DB::table('pengumpulan_tugas')
            ->join('tugas', 'pengumpulan_tugas.id_tugas', '=', 'tugas.id_tugas')
            ->join('kursus', 'tugas.id_kursus', '=', 'kursus.id_kursus')
            ->where('pengumpulan_tugas.id_pengguna', $id_pengguna)
            ->whereNotNull('pengumpulan_tugas.nilai')
            ->select(
                'tugas.judul_tugas',
                'kursus.judul_kursus',
                'pengumpulan_tugas.nilai',
                'tugas.nilai_maksimal',
                'pengumpulan_tugas.tanggal_kumpul',
                'pengumpulan_tugas.feedback'
            )
            ->get();

        return response()->json([
            'nilai_pkl'        => $nilaiPkl,
            'nilai_non_teknis' => $nilaiNonTeknis,
            'riwayat_kuis'     => $riwayatKuis,
            'nilai_tugas'      => $nilaiTugas,
        ]);
    }
}