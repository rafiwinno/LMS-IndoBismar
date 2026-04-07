<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;

        $notifications = Cache::remember("trainer_notifs_{$trainerId}", 30, function () use ($trainerId) {
            return DB::select("
                SELECT
                    pt.id_pengumpulan   AS id,
                    p.nama              AS dari,
                    t.judul_tugas       AS judul,
                    k.judul_kursus      AS kursus,
                    pt.tanggal_kumpul   AS waktu
                FROM pengumpulan_tugas pt
                JOIN pengguna p  ON p.id_pengguna = pt.id_pengguna
                JOIN tugas t     ON t.id_tugas    = pt.id_tugas
                JOIN kursus k    ON k.id_kursus   = t.id_kursus
                WHERE k.id_trainer = ?
                ORDER BY pt.tanggal_kumpul DESC
                LIMIT 15
            ", [$trainerId]);
        });

        return response()->json(['data' => $notifications]);
    }
}
