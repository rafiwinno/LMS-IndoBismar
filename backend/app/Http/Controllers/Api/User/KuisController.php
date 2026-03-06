<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KuisController extends Controller
{
    // Semua kuis dari kursus yang diikuti peserta
    public function index(Request $request)
    {
        $id_pengguna = $request->id_pengguna;

        $kuis = DB::table('kuis')
            ->join('peserta_kursus', 'kuis.id_kursus', '=', 'peserta_kursus.id_kursus')
            ->join('kursus', 'kuis.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoin('attempt_kuis', function ($join) use ($id_pengguna) {
                $join->on('attempt_kuis.id_kuis', '=', 'kuis.id_kuis')
                     ->where('attempt_kuis.id_pengguna', '=', $id_pengguna);
            })
            ->where('peserta_kursus.id_pengguna', $id_pengguna)
            ->select(
                'kuis.id_kuis',
                'kuis.judul_kuis',
                'kuis.waktu_mulai',
                'kuis.waktu_selesai',
                'kursus.judul_kursus',
                'attempt_kuis.nilai',
                DB::raw('CASE WHEN attempt_kuis.id_attempt IS NOT NULL THEN "sudah" ELSE "belum" END as status_attempt')
            )
            ->get();

        return response()->json(['data' => $kuis]);
    }

    // Detail kuis beserta pertanyaan dan pilihan jawaban
    public function show($id_kuis)
    {
        $kuis = DB::table('kuis')
            ->where('id_kuis', $id_kuis)
            ->first();

        if (!$kuis) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        $pertanyaan = DB::table('pertanyaan')
            ->where('id_kuis', $id_kuis)
            ->get();

        $pertanyaanDenganPilihan = $pertanyaan->map(function ($item) {
            $item->pilihan = DB::table('pilihan_jawaban')
                ->where('id_pertanyaan', $item->id_pertanyaan)
                ->select('id_pilihan', 'teks_pilihan') // tidak kirim is_correct ke frontend
                ->get();
            return $item;
        });

        return response()->json([
            'kuis'       => $kuis,
            'pertanyaan' => $pertanyaanDenganPilihan,
        ]);
    }
}