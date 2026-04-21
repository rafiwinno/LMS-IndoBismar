<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    // GET /api/user/dokumen — ambil dokumen milik user
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $dokumen = DB::table('dokumen_verifikasi')
            ->where('id_pengguna', $id_pengguna)
            ->select('surat_siswa', 'surat_orang_tua', 'status', 'tanggal_verifikasi')
            ->first();

        return response()->json(['data' => $dokumen]);
    }

    // POST /api/user/dokumen/{jenis} — upload dokumen (surat_siswa atau surat_orang_tua)
    public function upload(Request $request, string $jenis)
    {
        $allowedJenis = ['surat_siswa', 'surat_orang_tua'];

        if (!in_array($jenis, $allowedJenis)) {
            return response()->json(['message' => 'Jenis dokumen tidak valid.'], 400);
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $id_pengguna = $request->user()->id_pengguna;

        // Simpan file ke storage/app/public/dokumen/{id_pengguna}
        $file     = $request->file('file');
        $namaFile = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs("dokumen/{$id_pengguna}", $namaFile, 'public');

        // Cek apakah row sudah ada untuk user ini
        $existing = DB::table('dokumen_verifikasi')
            ->where('id_pengguna', $id_pengguna)
            ->first();

        if ($existing) {
            // Update kolom yang sesuai
            DB::table('dokumen_verifikasi')
                ->where('id_pengguna', $id_pengguna)
                ->update([$jenis => $path, 'status' => 'pending']);
        } else {
            // Insert row baru
            DB::table('dokumen_verifikasi')->insert([
                'id_pengguna'   => $id_pengguna,
                $jenis          => $path,
                'status'        => 'pending',
            ]);
        }

        // Kirim notifikasi ke semua admin cabang yang sama
        $pengguna    = $request->user();
        $labelJenis  = $jenis === 'surat_siswa' ? 'Surat Pernyataan Magang' : 'Surat Pernyataan Orang Tua';

        $adminCabang = DB::table('pengguna')
            ->where('id_cabang', $pengguna->id_cabang)
            ->whereIn('id_role', [1, 2])
            ->where('status', 'aktif')
            ->pluck('id_pengguna');

        foreach ($adminCabang as $adminId) {
            Notifikasi::create([
                'id_penerima'  => $adminId,
                'judul'        => 'Dokumen Menunggu Verifikasi',
                'pesan'        => "Peserta \"{$pengguna->nama}\" mengupload {$labelJenis} dan menunggu verifikasi.",
                'tipe'         => 'dokumen_menunggu',
                'id_referensi' => $id_pengguna,
            ]);
        }

        return response()->json(['message' => 'Dokumen berhasil diupload.']);
    }
}