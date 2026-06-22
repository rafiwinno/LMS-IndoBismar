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

        // Simpan file ke private storage agar bisa diakses via secure endpoint
        $file     = $request->file('file');
        $namaFile = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs("dokumen/{$id_pengguna}", $namaFile, 'local');

        // Update tabel dokumen_verifikasi (dipakai user-side untuk cek status upload)
        $existing = DB::table('dokumen_verifikasi')
            ->where('id_pengguna', $id_pengguna)
            ->first();

        if ($existing) {
            DB::table('dokumen_verifikasi')
                ->where('id_pengguna', $id_pengguna)
                ->update([$jenis => $path, 'status' => 'pending']);
        } else {
            DB::table('dokumen_verifikasi')->insert([
                'id_pengguna'   => $id_pengguna,
                $jenis          => $path,
                'status'        => 'pending',
            ]);
        }

        // Sync ke data_peserta_pkl agar dokumen terlihat di panel admin
        // kolom surat_orang_tua di dokumen_verifikasi → surat_ortu di data_peserta_pkl
        $kolomPkl = $jenis === 'surat_orang_tua' ? 'surat_ortu' : 'surat_siswa';

        $dataPkl = DB::table('data_peserta_pkl')
            ->where('id_pengguna', $id_pengguna)
            ->first();

        if ($dataPkl) {
            DB::table('data_peserta_pkl')
                ->where('id_pengguna', $id_pengguna)
                ->update([
                    $kolomPkl        => $path,
                    'status_dokumen' => 'menunggu',
                    'catatan_dokumen'=> null,
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