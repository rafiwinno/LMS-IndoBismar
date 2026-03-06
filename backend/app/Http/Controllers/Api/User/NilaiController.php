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
        $id_pengguna = $request->id_pengguna;

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

        // Progress per kursus
        $progressKursus = DB::table('peserta_kursus')
            ->join('kursus', 'peserta_kursus.id_kursus', '=', 'kursus.id_kursus')
            ->where('peserta_kursus.id_pengguna', $id_pengguna)
            ->select(
                'kursus.id_kursus',
                'kursus.judul_kursus',
                'peserta_kursus.status',
                'peserta_kursus.tanggal_daftar'
            )
            ->get();

        // Hitung progress materi per kursus
        $progressKursus = $progressKursus->map(function ($kursus) use ($id_pengguna) {
            $totalMateri = DB::table('materi')
                ->where('id_kursus', $kursus->id_kursus)
                ->count();

            $materiSelesai = DB::table('progress_materi')
                ->join('materi', 'progress_materi.id_materi', '=', 'materi.id_materi')
                ->where('materi.id_kursus', $kursus->id_kursus)
                ->where('progress_materi.id_pengguna', $id_pengguna)
                ->where('progress_materi.status', 'selesai')
                ->count();

            $kursus->total_materi   = $totalMateri;
            $kursus->materi_selesai = $materiSelesai;
            $kursus->persentase     = $totalMateri > 0
                ? round(($materiSelesai / $totalMateri) * 100)
                : 0;

            return $kursus;
        });

        return response()->json([
            'nilai_pkl'       => $nilaiPkl,
            'nilai_non_teknis' => $nilaiNonTeknis,
            'progress_kursus' => $progressKursus,
        ]);
    }
}