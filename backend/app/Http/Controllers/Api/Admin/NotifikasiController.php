<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * GET /api/notifikasi
     * Ambil semua notifikasi milik user yang login
     */
    public function index(Request $request)
    {
        $notifikasi = Notifikasi::where('id_penerima', $request->user()->id_pengguna)
            ->orderByDesc('dibuat_pada')
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id'           => $n->id_notif,
                'judul'        => $n->judul,
                'pesan'        => $n->pesan,
                'tipe'         => $n->tipe,
                'id_referensi' => $n->id_referensi,
                'dibaca'       => $n->dibaca,
                'dibuat_pada'  => $n->dibuat_pada,
            ]);

        $unread = Notifikasi::where('id_penerima', $request->user()->id_pengguna)
            ->where('dibaca', false)
            ->count();

        return response()->json([
            'data'   => $notifikasi,
            'unread' => $unread,
        ]);
    }

    /**
     * PATCH /api/notifikasi/{id}/baca
     */
    public function markRead(Request $request, $id)
    {
        Notifikasi::where('id_notif', $id)
            ->where('id_penerima', $request->user()->id_pengguna)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Notifikasi ditandai dibaca.']);
    }

    /**
     * PATCH /api/notifikasi/baca-semua
     */
    public function markAllRead(Request $request)
    {
        Notifikasi::where('id_penerima', $request->user()->id_pengguna)
            ->where('dibaca', false)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }
}
