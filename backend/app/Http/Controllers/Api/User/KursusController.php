<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KursusController extends Controller
{
    // Semua kursus yang diikuti peserta
    public function index(Request $request)
    {
        $id_pengguna = $request->id_pengguna;

        $kursus = DB::table('peserta_kursus')
            ->join('kursus', 'peserta_kursus.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('peserta_kursus.id_pengguna', $id_pengguna)
            ->select(
                'kursus.id_kursus',
                'kursus.judul_kursus',
                'kursus.deskripsi',
                'trainer.nama as nama_trainer',
                'peserta_kursus.status',
                'peserta_kursus.tanggal_daftar'
            )
            ->get();

        return response()->json(['data' => $kursus]);
    }

    // Detail satu kursus beserta materinya
    public function show(Request $request, $id_kursus)
    {
        $id_pengguna = $request->id_pengguna;

        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('kursus.id_kursus', $id_kursus)
            ->select(
                'kursus.*',
                'trainer.nama as nama_trainer'
            )
            ->first();

        if (!$kursus) {
            return response()->json(['message' => 'Kursus tidak ditemukan'], 404);
        }

        // Ambil materi kursus
        $materi = DB::table('materi')
            ->where('id_kursus', $id_kursus)
            ->get();

        // Ambil progress materi peserta
        $progress = DB::table('progress_materi')
            ->where('id_pengguna', $id_pengguna)
            ->whereIn('id_materi', $materi->pluck('id_materi'))
            ->get()
            ->keyBy('id_materi');

        // Gabungkan materi dengan progress
        $materiDenganProgress = $materi->map(function ($item) use ($progress) {
            $item->status_progress = isset($progress[$item->id_materi])
                ? $progress[$item->id_materi]->status
                : 'belum';
            return $item;
        });

        return response()->json([
            'kursus' => $kursus,
            'materi' => $materiDenganProgress,
        ]);
    }
}