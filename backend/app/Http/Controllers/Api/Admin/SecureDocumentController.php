<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SecureDocumentController extends Controller
{
    /**
     * GET /api/dokumen/secure/{path}
     * Serve dokumen PKL (surat siswa/ortu) secara aman setelah cek autentikasi.
     * Hanya admin cabang yang boleh mengakses dokumen peserta di cabangnya.
     */
    public function download(Request $request, string $path)
    {
        $path = urldecode($path);

        // Cegah path traversal
        if (str_contains($path, '..') || str_contains($path, "\0")) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Semua dokumen PKL tersimpan di bawah prefix dokumen/
        if (!str_starts_with($path, 'dokumen/')) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $admin = $request->user();

        // Ekstrak user_id dari path: dokumen/{user_id}/filename
        $parts = explode('/', $path);
        if (count($parts) < 3 || !is_numeric($parts[1])) {
            return response()->json(['message' => 'Path tidak valid.'], 400);
        }

        $userId = (int) $parts[1];

        // Verifikasi: dokumen milik peserta di cabang admin ini
        $peserta = Pengguna::withTrashed()
            ->where('id_pengguna', $userId)
            ->where('id_role', 4)
            ->where('id_cabang', $admin->id_cabang)
            ->first();

        if (!$peserta) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return Storage::disk('local')->download(
            $path,
            basename($path),
            ['Content-Type' => 'application/pdf']
        );
    }
}
