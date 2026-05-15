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
        $courseId  = $request->query('course_id') ? (int) $request->query('course_id') : null;
        $perPage   = min(max((int) $request->query('per_page', 50), 1), 200);
        $page      = max((int) $request->query('page', 1), 1);
        $offset    = ($page - 1) * $perPage;

        $cacheKey = "trainer_progress_v6_{$trainerId}_c{$courseId}_p{$page}_pp{$perPage}";

        $result = Cache::remember($cacheKey, 120, function () use ($trainerId, $courseId, $perPage, $offset) {
            if ($courseId) {
                $courseClause  = 'AND k.id_kursus = ?';
                $rowBindings   = [$trainerId, $courseId, $perPage, $offset];
                $countBindings = [$trainerId, $courseId];
            } else {
                $courseClause  = '';
                $rowBindings   = [$trainerId, $perPage, $offset];
                $countBindings = [$trainerId];
            }

            $rows = DB::select("
                SELECT
                    p.id_pengguna   AS id,
                    p.nama,
                    k.id_kursus,
                    k.judul_kursus  AS course,
                    COUNT(DISTINCT pm.id_progress)  AS materi_selesai,
                    COUNT(DISTINCT m.id_materi)      AS total_materi,
                    COUNT(DISTINCT pt.id_tugas)      AS tugas_selesai,
                    COUNT(DISTINCT t.id_tugas)       AS total_tugas,
                    COUNT(DISTINCT ak.id_kuis)       AS kuis_selesai,
                    COUNT(DISTINCT kuis.id_kuis)     AS total_kuis,
                    CASE
                        WHEN (COUNT(DISTINCT m.id_materi) + COUNT(DISTINCT t.id_tugas) + COUNT(DISTINCT kuis.id_kuis)) = 0 THEN 0
                        ELSE ROUND(
                            (COUNT(DISTINCT pm.id_progress) + COUNT(DISTINCT pt.id_tugas) + COUNT(DISTINCT ak.id_kuis)) * 100.0 /
                            (COUNT(DISTINCT m.id_materi) + COUNT(DISTINCT t.id_tugas) + COUNT(DISTINCT kuis.id_kuis))
                        )
                    END AS progress
                FROM peserta_kursus pk
                JOIN pengguna p    ON p.id_pengguna  = pk.id_pengguna
                JOIN kursus k      ON k.id_kursus    = pk.id_kursus
                LEFT JOIN materi m ON m.id_kursus    = k.id_kursus
                LEFT JOIN progress_materi pm
                    ON pm.id_pengguna = pk.id_pengguna
                    AND pm.id_materi  = m.id_materi
                    AND pm.status     = 'selesai'
                LEFT JOIN tugas t  ON t.id_kursus    = k.id_kursus
                LEFT JOIN pengumpulan_tugas pt
                    ON pt.id_tugas    = t.id_tugas
                    AND pt.id_pengguna = pk.id_pengguna
                LEFT JOIN kuis     ON kuis.id_kursus = k.id_kursus
                LEFT JOIN attempt_kuis ak
                    ON ak.id_kuis     = kuis.id_kuis
                    AND ak.id_pengguna = pk.id_pengguna
                    AND ak.status      = 'selesai'
                WHERE k.id_trainer = ? {$courseClause}
                GROUP BY p.id_pengguna, p.nama, k.id_kursus, k.judul_kursus
                LIMIT ? OFFSET ?
            ", $rowBindings);

            $total = DB::selectOne("
                SELECT COUNT(*) AS total FROM (
                    SELECT 1
                    FROM peserta_kursus pk
                    JOIN kursus k ON k.id_kursus = pk.id_kursus
                    WHERE k.id_trainer = ? {$courseClause}
                    GROUP BY pk.id_pengguna, pk.id_kursus
                ) AS sub
            ", $countBindings)->total;

            return ['rows' => $rows, 'total' => (int) $total];
        });

        return response()->json([
            'data' => $result['rows'],
            'meta' => [
                'total'        => $result['total'],
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => (int) ceil($result['total'] / $perPage) ?: 1,
            ],
        ]);
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
