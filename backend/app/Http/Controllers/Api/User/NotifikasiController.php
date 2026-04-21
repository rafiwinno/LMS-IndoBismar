<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotifikasiController extends Controller
{
    // GET /api/user/notifikasi
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $notifikasi = DB::table('notifikasi')
            ->where('id_penerima', $id_pengguna)
            ->orderByDesc('dibuat_pada')
            ->limit(30)
            ->get();

        $belumDibaca = $notifikasi->where('dibaca', 0)->count();

        return response()->json([
            'data'         => $notifikasi,
            'belum_dibaca' => $belumDibaca,
        ]);
    }

    // PATCH /api/user/notifikasi/{id}/baca
    public function baca(Request $request, $id)
    {
        $id_pengguna = $request->user()->id_pengguna;

        DB::table('notifikasi')
            ->where('id_notifikasi', $id)
            ->where('id_penerima', $id_pengguna)
            ->update(['dibaca' => 1]);

        return response()->json(['message' => 'Notifikasi ditandai dibaca']);
    }

    // PATCH /api/user/notifikasi/baca-semua
    public function bacaSemua(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        DB::table('notifikasi')
            ->where('id_penerima', $id_pengguna)
            ->where('dibaca', 0)
            ->update(['dibaca' => 1]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca']);
    }
}