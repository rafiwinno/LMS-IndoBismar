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

        $enrolledKursusIds = DB::table('peserta_kursus')
            ->where('id_pengguna', $id_pengguna)
            ->pluck('id_kursus');

        $kuis = DB::table('kuis')
            ->join('kursus', 'kuis.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoin('attempt_kuis', function ($join) use ($id_pengguna) {
                $join->on('attempt_kuis.id_kuis', '=', 'kuis.id_kuis')
                     ->where('attempt_kuis.id_pengguna', '=', $id_pengguna);
            })
            ->whereIn('kuis.id_kursus', $enrolledKursusIds)
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
        $id_pengguna = $request->user()->id_pengguna;

        $kuis = DB::table('kuis')->where('id_kuis', $id_kuis)->first();
        if (!$kuis) {
            return response()->json(['message' => 'Kuis tidak ditemukan'], 404);
        }

        $sudahKerjakan = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->where('id_kuis', $id_kuis)
            ->exists();

        if ($sudahKerjakan) {
            return response()->json(['message' => 'Kamu sudah mengerjakan kuis ini'], 409);
        }

        $jawaban       = $request->jawaban ?? [];
        $pertanyaanMap = DB::table('pertanyaan')
            ->where('id_kuis', $id_kuis)
            ->get()
            ->keyBy('id_pertanyaan');

        $totalPertanyaan = $pertanyaanMap->count();
        $adaEssay        = false;
        $benar           = 0;
        $totalSkor       = 0;

        // Gunakan bobot_nilai jika semua soal MC memiliki bobot
        $totalBobot = $pertanyaanMap->where('tipe', 'pilihan_ganda')->sum('bobot_nilai');
        $useBobot   = $totalBobot > 0;

        foreach ($jawaban as $item) {
            $p = $pertanyaanMap->get($item['id_pertanyaan'] ?? null);
            if (!$p) continue;

            if ($p->tipe === 'essay') {
                $adaEssay = true;
                continue;
            }

            if (!empty($item['id_pilihan'])) {
                $isBenar = DB::table('pilihan_jawaban')
                    ->where('id_pilihan', $item['id_pilihan'])
                    ->where('id_pertanyaan', $item['id_pertanyaan'])
                    ->where('benar', 1)
                    ->exists();

                if ($isBenar) {
                    $benar++;
                    $totalSkor += $useBobot ? ($p->bobot_nilai ?? 0) : 1;
                }
            }
        }

        $totalMC = $pertanyaanMap->where('tipe', 'pilihan_ganda')->count();
        if ($useBobot) {
            $nilai = $totalBobot > 0 ? round(($totalSkor / $totalBobot) * 100, 2) : 0;
        } else {
            $nilai = $totalMC > 0 ? round(($benar / $totalMC) * 100, 2) : 0;
        }

        $id_attempt = DB::table('attempt_kuis')->insertGetId([
            'id_pengguna'  => $id_pengguna,
            'id_kuis'      => $id_kuis,
            'skor'         => $nilai,
            'waktu_mulai'  => now(),
            'status'       => 'selesai',
        ]);

        foreach ($jawaban as $item) {
            $p = $pertanyaanMap->get($item['id_pertanyaan'] ?? null);
            if (!$p) continue;

            $skorItem = 0;
            if ($p->tipe === 'pilihan_ganda' && !empty($item['id_pilihan'])) {
                $pilihanBenar = DB::table('pilihan_jawaban')
                    ->where('id_pilihan', $item['id_pilihan'])
                    ->where('benar', 1)
                    ->exists();
                if ($pilihanBenar) {
                    $skorItem = $useBobot ? ($p->bobot_nilai ?? 0) : 1;
                }
            }

            DB::table('jawaban_kuis')->insert([
                'id_attempt'    => $id_attempt,
                'id_pertanyaan' => $item['id_pertanyaan'],
                'id_pilihan'    => $p->tipe === 'pilihan_ganda' ? ($item['id_pilihan'] ?? null) : null,
                'jawaban_text'  => $p->tipe === 'essay' ? ($item['jawaban_text'] ?? null) : null,
                'skor'          => $skorItem,
            ]);
        }

        return response()->json([
            'message'   => 'Kuis berhasil dikerjakan',
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