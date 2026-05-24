<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    // GET /api/user/feedback — semua feedback yang diterima peserta
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        // Hanya tampilkan feedback dari kursus yang peserta terdaftar
        $enrolledKursusIds = \Illuminate\Support\Facades\DB::table('peserta_kursus')
            ->where('id_pengguna', $id_pengguna)
            ->pluck('id_kursus');

        $feedbacks = Feedback::where('id_peserta', $id_pengguna)
            ->whereIn('id_kursus', $enrolledKursusIds)
            ->with([
                'trainer:id_pengguna,nama',
                'kursus:id_kursus,judul_kursus',
            ])
            ->orderByDesc('dibuat_pada')
            ->get()
            ->map(fn($f) => [
                'id'          => $f->id_feedback,
                'pesan'       => $f->pesan,
                'tipe'        => $f->tipe,
                'dibuat_pada' => $f->dibuat_pada,
                'trainer'     => $f->trainer->nama ?? null,
                'kursus'      => $f->kursus->judul_kursus ?? null,
            ]);

        return response()->json(['data' => $feedbacks]);
    }
}
