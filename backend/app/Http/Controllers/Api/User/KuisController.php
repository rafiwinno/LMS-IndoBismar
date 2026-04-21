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

        $attemptSubQuery = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->groupBy('id_kuis')
            ->select('id_kuis', DB::raw('MAX(skor) as skor'));

        $kuis = DB::table('kuis')
            ->join('kursus', 'kuis.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoinSub($attemptSubQuery, 'ak', 'ak.id_kuis', '=', 'kuis.id_kuis')
            ->select(
                'kuis.id_kuis',
                'kuis.judul_kuis',
                'kuis.waktu_mulai',
                'kuis.waktu_selesai',
                'kursus.judul_kursus',
                'ak.skor',
                DB::raw('CASE WHEN ak.id_kuis IS NOT NULL THEN "sudah" ELSE "belum" END as status_attempt')
            )
            ->get();

        return response()->json(['data' => $kuis]);
    }

    // Peserta kerjakan kuis & simpan jawaban
    public function kerjakan(Request $request, $id_kuis)
    {
        $id_pengguna = $request->user()->id_pengguna;

        // Cek apakah kuis ada
        $kuis = DB::table('kuis')->where('id_kuis', $id_kuis)->first();
        if (!$kuis) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        // Cek waktu
        if ($kuis->waktu_mulai && now()->lt($kuis->waktu_mulai)) {
            return response()->json(['message' => 'Kuis belum dimulai'], 403);
        }

        if ($kuis->waktu_selesai && now()->gt($kuis->waktu_selesai)) {
            return response()->json(['message' => 'Waktu kuis sudah berakhir'], 403);
        }

        // Cek apakah sudah pernah mengerjakan
        $sudahKerjakan = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->where('id_kuis', $id_kuis)
            ->exists();

        if ($sudahKerjakan) {
            return response()->json(['message' => 'Kamu sudah mengerjakan kuis ini'], 409);
        }

        $jawaban = $request->jawaban ?? [];
        $totalPertanyaan = DB::table('pertanyaan')->where('id_kuis', $id_kuis)->count();
        $totalPilihanGanda = DB::table('pertanyaan')
            ->where('id_kuis', $id_kuis)
            ->where('tipe', 'pilihan_ganda')
            ->count();
        $benar = 0;
        $adaEssay = false;

        // Hitung nilai otomatis hanya untuk pilihan ganda
        foreach ($jawaban as $item) {
            if (!empty($item['id_pilihan'])) {
                $isBenar = DB::table('pilihan_jawaban')
                    ->where('id_pilihan', $item['id_pilihan'])
                    ->where('id_pertanyaan', $item['id_pertanyaan'])
                    ->where('benar', 1)
                    ->exists();
                if ($isBenar) $benar++;
            } elseif (!empty($item['jawaban_text'])) {
                $adaEssay = true;
            }
        }

        // Jika ada essay: nilai sementara dari MC saja, status 'menunggu_penilaian'
        // Jika pure MC: nilai final, status 'selesai'
        $status = $adaEssay ? 'menunggu_penilaian' : 'selesai';
        $nilai  = $totalPertanyaan > 0
            ? round(($benar / $totalPertanyaan) * 100, 2)
            : 0;

        $id_attempt = DB::table('attempt_kuis')->insertGetId([
            'id_pengguna' => $id_pengguna,
            'id_kuis'     => $id_kuis,
            'skor'        => $nilai,
            'waktu_mulai' => now(),
            'status'      => $status,
        ]);

        // Simpan detail jawaban beserta skor per soal
        foreach ($jawaban as $item) {
            $skorItem = 0;
            if (!empty($item['id_pilihan'])) {
                $pilihanBenar = DB::table('pilihan_jawaban')
                    ->where('id_pilihan', $item['id_pilihan'])
                    ->where('id_pertanyaan', $item['id_pertanyaan'])
                    ->where('benar', 1)
                    ->exists();
                if ($pilihanBenar) {
                    $bobot = DB::table('pertanyaan')
                        ->where('id_pertanyaan', $item['id_pertanyaan'])
                        ->value('bobot_nilai');
                    $skorItem = $bobot ?? 0;
                }
            }

            DB::table('jawaban_kuis')->insert([
                'id_attempt'    => $id_attempt,
                'id_pertanyaan' => $item['id_pertanyaan'],
                'id_pilihan'    => $item['id_pilihan'] ?? null,
                'jawaban_text'  => $item['jawaban_text'] ?? null,
                'skor'          => $skorItem,
            ]);
        }

        return response()->json([
            'message'   => 'Kuis berhasil dikumpulkan',
            'nilai'     => $nilai,
            'benar'     => $benar,
            'total'     => $totalPertanyaan,
            'ada_essay' => $adaEssay,
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

        if ($kuis->waktu_mulai && now()->lt($kuis->waktu_mulai)) {
            return response()->json(['message' => 'Kuis belum dimulai'], 403);
        }

        if ($kuis->waktu_selesai && now()->gt($kuis->waktu_selesai)) {
            return response()->json(['message' => 'Waktu kuis sudah berakhir'], 403);
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