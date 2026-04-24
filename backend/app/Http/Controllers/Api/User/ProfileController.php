<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // Ambil profil peserta
    public function show(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $user = DB::table('pengguna')
            ->leftJoin('cabang', 'pengguna.id_cabang', '=', 'cabang.id_cabang')
            ->leftJoin('role', 'pengguna.id_role', '=', 'role.id_role')
            ->where('pengguna.id_pengguna', $id_pengguna)
            ->select(
                'pengguna.id_pengguna',
                'pengguna.nama',
                'pengguna.username',
                'pengguna.email',
                'pengguna.nomor_hp',
                'pengguna.status',
                'cabang.nama_cabang',
                'role.nama_role'
            )
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json(['data' => $user]);
    }

    // Update profil peserta
    public function update(Request $request)
    {
        // ✅ FIX: gunakan user dari Sanctum token, bukan dari request body
        $id_pengguna = $request->user()->id_pengguna;

        $updateData = [];

        if ($request->nama)     $updateData['nama']     = $request->nama;
        if ($request->nomor_hp) $updateData['nomor_hp'] = $request->nomor_hp;

        // Ganti password jika dikirim
        if ($request->password) {
            if (strlen($request->password) < 8) {
                return response()->json(['message' => 'Password baru minimal 8 karakter'], 422);
            }
            $user = DB::table('pengguna')->where('id_pengguna', $id_pengguna)->first();
            if (!$request->current_password || !Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Password lama tidak sesuai'], 422);
            }
            $updateData['password'] = Hash::make($request->password);
        }

        if (empty($updateData)) {
            return response()->json(['message' => 'Tidak ada data yang diupdate'], 400);
        }

        DB::table('pengguna')
            ->where('id_pengguna', $id_pengguna)
            ->update($updateData);

        return response()->json(['message' => 'Profil berhasil diupdate']);
    }
}