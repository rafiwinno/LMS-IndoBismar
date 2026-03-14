<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgressController extends Controller
{
    public function index(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;

        $data = DB::select("
            SELECT
                p.id_pengguna   AS id,
                p.nama,
                k.judul_kursus  AS course,
                COUNT(pm.id_progress) AS tugas_selesai,
                (SELECT COUNT(*) FROM materi WHERE materi.id_kursus = k.id_kursus) AS total_tugas,
                CASE
                    WHEN (SELECT COUNT(*) FROM materi WHERE materi.id_kursus = k.id_kursus) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(pm.id_progress) * 100.0 /
                        (SELECT COUNT(*) FROM materi WHERE materi.id_kursus = k.id_kursus)
                    )
                END AS progress
            FROM peserta_kursus pk
            JOIN pengguna p  ON p.id_pengguna = pk.id_pengguna
            JOIN kursus k    ON k.id_kursus   = pk.id_kursus
            LEFT JOIN progress_materi pm
                ON pm.id_pengguna = pk.id_pengguna
                AND pm.id_materi IN (
                    SELECT id_materi FROM materi WHERE id_kursus = k.id_kursus
                )
                AND pm.status = 'selesai'
            WHERE k.id_trainer = ?
            GROUP BY p.id_pengguna, p.nama, k.id_kursus, k.judul_kursus
        ", [$trainerId]);

        return response()->json(['data' => $data]);
    }
}
