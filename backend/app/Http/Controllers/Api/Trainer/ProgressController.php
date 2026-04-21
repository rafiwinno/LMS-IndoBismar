<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProgressController extends Controller
{
    public function index(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;

        $data = Cache::remember("trainer_progress_v2_{$trainerId}", 120, function () use ($trainerId) {
            return DB::select("
                SELECT
                    p.id_pengguna   AS id,
                    p.nama,
                    k.id_kursus,
                    k.judul_kursus  AS course,
                    COUNT(DISTINCT pm.id_progress) AS materi_selesai,
                    COUNT(DISTINCT m.id_materi)    AS total_materi,
                    CASE
                        WHEN COUNT(DISTINCT m.id_materi) = 0 THEN 0
                        ELSE ROUND(
                            COUNT(DISTINCT pm.id_progress) * 100.0 /
                            COUNT(DISTINCT m.id_materi)
                        )
                    END AS progress
                FROM peserta_kursus pk
                JOIN pengguna p   ON p.id_pengguna = pk.id_pengguna
                JOIN kursus k     ON k.id_kursus   = pk.id_kursus
                LEFT JOIN materi m ON m.id_kursus  = k.id_kursus
                LEFT JOIN progress_materi pm
                    ON pm.id_pengguna = pk.id_pengguna
                    AND pm.id_materi  = m.id_materi
                    AND pm.status     = 'selesai'
                WHERE k.id_trainer = ?
                GROUP BY p.id_pengguna, p.nama, k.id_kursus, k.judul_kursus
            ", [$trainerId]);
        });

        return response()->json(['data' => $data]);
    }

    public function allPesertaCabang(Request $request)
    {
        $cabangId = $request->user()->id_cabang;

        $peserta = Pengguna::where('id_role', 4)
            ->where('id_cabang', $cabangId)
            ->where('status', 'aktif')
            ->select('id_pengguna', 'nama', 'email')
            ->orderBy('nama')
            ->get();

        return response()->json(['data' => $peserta]);
    }
}
