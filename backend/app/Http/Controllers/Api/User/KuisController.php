<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KuisController extends Controller
{
    // Semua kuis yang tersedia
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $kuis = DB::table('kuis')
            ->join('kursus', 'kuis.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoin('attempt_kuis', function ($join) use ($id_pengguna) {
                $join->on('attempt_kuis.id_kuis', '=', 'kuis.id_kuis')
                     ->where('attempt_kuis.id_pengguna', '=', $id_pengguna);
            })
            ->select(
                'kuis.id_kuis',
                'kuis.judul_kuis',
                'kuis.waktu_mulai',
                'kuis.waktu_selesai',
                'kursus.judul_kursus',
                'attempt_kuis.skor',
                DB::raw('CASE WHEN attempt_kuis.id_attempt IS NOT NULL THEN "sudah" ELSE "belum" END as status_attempt')
            )
            ->get();

        return response()->json(['data' => $kuis]);
    }

    // Peserta kerjakan kuis & simpan jawaban
    public function kerjakan(Request $request, $id_kuis)
    {
        $id_pengguna = $request->id_pengguna;

        // Cek apakah kuis ada
        $kuis = DB::table('kuis')->where('id_kuis', $id_kuis)->first();
        if (!$kuis) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        // Cek apakah sudah pernah mengerjakan
        $sudahKerjakan = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->where('id_kuis', $id_kuis)
            ->exists();

        if ($sudahKerjakan) {
            return response()->json(['message' => 'Kamu sudah mengerjakan kuis ini'], 409);
        }

        // Hitung nilai otomatis dari jawaban
        // $request->jawaban = [['id_pertanyaan' => 1, 'id_pilihan' => 3], ...]
        $jawaban = $request->jawaban ?? [];
        $totalPertanyaan = DB::table('pertanyaan')->where('id_kuis', $id_kuis)->count();
        $benar = 0;

        foreach ($jawaban as $item) {
            $isBenar = DB::table('pilihan_jawaban')
                ->where('id_pilihan', $item['id_pilihan'])
                ->where('id_pertanyaan', $item['id_pertanyaan'])
                ->where('benar', 1)
                ->exists();

            if ($isBenar) $benar++;
        }

        $nilai = $totalPertanyaan > 0 ? round(($benar / $totalPertanyaan) * 100, 2) : 0;

        // Simpan attempt
        $id_attempt = DB::table('attempt_kuis')->insertGetId([
            'id_pengguna'   => $id_pengguna,
            'id_kuis'       => $id_kuis,
            'skor'          => $nilai,
            'waktu_mulai'   => now(),
            'status'        => 'selesai',
        ]);

        // Simpan detail jawaban
        foreach ($jawaban as $item) {
            DB::table('jawaban_kuis')->insert([
                'id_attempt'     => $id_attempt,
                'id_pertanyaan'  => $item['id_pertanyaan'],
                'id_pilihan'     => $item['id_pilihan'],
            ]);
        }

        return response()->json([
            'message'   => 'Kuis berhasil dikerjakan',
            'nilai'     => $nilai,
            'benar'     => $benar,
            'total'     => $totalPertanyaan,
        ], 201);
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
                ->select('id_pilihan', 'teks_jawaban') // tidak kirim benar ke frontend
                ->get();
            return $item;
        });

        return response()->json([
            'kuis'       => $kuis,
            'pertanyaan' => $pertanyaanDenganPilihan,
        ]);
    }
}