<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KursusController extends Controller
{
    // Semua kursus yang tersedia
    public function index(Request $request)
    {
        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->select(
                'kursus.id_kursus',
                'kursus.judul_kursus',
                'kursus.deskripsi',
                'trainer.nama as nama_trainer'
            )
            ->get();

        return response()->json(['data' => $kursus]);
    }

    // Detail satu kursus beserta materinya
    public function show(Request $request, $id_kursus)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('kursus.id_kursus', $id_kursus)
            ->select(
                'kursus.id_kursus',
                'kursus.judul_kursus',
                'kursus.deskripsi',
                'kursus.id_trainer',
                'trainer.nama as nama_trainer'
            )
            ->first();

        if (!$kursus) {
            return response()->json(['message' => 'Kursus tidak ditemukan'], 404);
        }

        $materi = DB::table('materi')
            ->where('id_kursus', $id_kursus)
            ->get();

        $progress = DB::table('progress_materi')
            ->where('id_pengguna', $id_pengguna)
            ->whereIn('id_materi', $materi->pluck('id_materi'))
            ->get()
            ->keyBy('id_materi');

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