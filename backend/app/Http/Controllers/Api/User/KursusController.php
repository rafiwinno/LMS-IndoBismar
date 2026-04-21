<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KursusController extends Controller
{
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $kursus = DB::table('kursus')
            ->join('peserta_kursus', function ($join) use ($id_pengguna) {
                $join->on('peserta_kursus.id_kursus', '=', 'kursus.id_kursus')
                     ->where('peserta_kursus.id_pengguna', '=', $id_pengguna);
            })
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('kursus.status', 'publish')
            ->select('kursus.id_kursus', 'kursus.judul_kursus', 'kursus.deskripsi',
                     'kursus.status', 'trainer.nama as nama_trainer',
                     'peserta_kursus.status as status_progress')
            ->get();

        return response()->json(['data' => $kursus]);
    }

    public function show(Request $request, $id_kursus)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $enrolled = DB::table('peserta_kursus')
            ->where('id_pengguna', $id_pengguna)
            ->where('id_kursus', $id_kursus)
            ->exists();

        if (!$enrolled) {
            return response()->json(['message' => 'Kamu tidak terdaftar di kursus ini.'], 403);
        }

        $kursus = DB::table('kursus')
            ->leftJoin('pengguna as trainer', 'kursus.id_trainer', '=', 'trainer.id_pengguna')
            ->where('kursus.id_kursus', $id_kursus)
            ->select('kursus.id_kursus', 'kursus.judul_kursus', 'kursus.deskripsi',
                     'kursus.status', 'kursus.id_trainer', 'trainer.nama as nama_trainer')
            ->first();

        if (!$kursus) {
            return response()->json(['message' => 'Kursus tidak ditemukan'], 404);
        }

        $materi = DB::table('materi')
            ->where('id_kursus', $id_kursus)
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
        // Gunakan subquery untuk hindari duplikat saat user punya banyak attempt
        $attemptSubQuery = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->groupBy('id_kuis')
            ->select('id_kuis', DB::raw('MAX(skor) as skor'));

        $kuis = DB::table('kuis')
            ->where('kuis.id_kursus', $id_kursus)
            ->leftJoinSub($attemptSubQuery, 'ak', 'ak.id_kuis', '=', 'kuis.id_kuis')
            ->select(
                'kuis.id_kuis',
                'kuis.judul_kuis',
                'kuis.waktu_mulai',
                'kuis.waktu_selesai',
                'ak.skor',
                DB::raw('CASE WHEN ak.id_kuis IS NOT NULL THEN "sudah" ELSE "belum" END as status_attempt')
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