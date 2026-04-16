<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KursusController extends Controller
{
    public function index(Request $request)
    {
        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->select('kursus.id_kursus', 'kursus.judul_kursus', 'kursus.deskripsi',
                     'trainer.nama as nama_trainer')
            ->get();

        return response()->json(['data' => $kursus]);
    }

    public function show(Request $request, $id_kursus)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('kursus.id_kursus', $id_kursus)
            ->select('kursus.id_kursus', 'kursus.judul_kursus', 'kursus.deskripsi',
                     'kursus.id_trainer', 'trainer.nama as nama_trainer')
            ->first();

        if (!$kursus) {
            return response()->json(['message' => 'Kursus tidak ditemukan'], 404);
        }

        $materi = DB::table('materi')
            ->where('id_kursus', $id_kursus)
            ->orderBy('sub_bab')
            ->orderBy('urutan')
            ->get();

        $progress = DB::table('progress_materi')
            ->where('id_pengguna', $id_pengguna)
            ->whereIn('id_materi', $materi->pluck('id_materi'))
            ->get()->keyBy('id_materi');

        $materiDenganProgress = $materi->map(function ($item) use ($progress) {
            $item->status_progress = isset($progress[$item->id_materi])
                ? $progress[$item->id_materi]->status : 'belum';
            return $item;
        });

        // Kuis yang terhubung ke kursus ini + status attempt user
        $kuis = DB::table('kuis')
            ->leftJoin('attempt_kuis', function ($join) use ($id_pengguna) {
                $join->on('attempt_kuis.id_kuis', '=', 'kuis.id_kuis')
                     ->where('attempt_kuis.id_pengguna', '=', $id_pengguna);
            })
            ->where('kuis.id_kursus', $id_kursus)
            ->select(
                'kuis.id_kuis',
                'kuis.judul_kuis',
                'kuis.waktu_mulai',
                'kuis.waktu_selesai',
                'attempt_kuis.skor',
                DB::raw('CASE WHEN attempt_kuis.id_attempt IS NOT NULL THEN "sudah" ELSE "belum" END as status_attempt')
            )
            ->get();

        return response()->json([
            'kursus' => $kursus,
            'materi' => $materiDenganProgress,
            'kuis'   => $kuis,
        ]);
    }

    public function markProgress(Request $request, $id_kursus, $id_materi)
    {
        $id_pengguna = $request->user()->id_pengguna;

        DB::table('progress_materi')->updateOrInsert(
            ['id_pengguna' => $id_pengguna, 'id_materi' => $id_materi],
            ['status' => 'selesai', 'waktu_update' => now()]
        );

        return response()->json(['message' => 'Progress disimpan']);
    }
}