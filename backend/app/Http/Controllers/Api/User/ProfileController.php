<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $user = DB::table('pengguna')
            ->leftJoin('cabang', 'pengguna.id_cabang', '=', 'cabang.id_cabang')
            ->leftJoin('role', 'pengguna.id_role', '=', 'role.id_role')
            ->leftJoin('data_peserta_pkl', 'pengguna.id_pengguna', '=', 'data_peserta_pkl.id_pengguna')
            ->where('pengguna.id_pengguna', $id_pengguna)
            ->select(
                'pengguna.id_pengguna',
                'pengguna.nama',
                'pengguna.username',
                'pengguna.email',
                'pengguna.nomor_hp',
                'pengguna.status',
                'cabang.nama_cabang',
                'role.nama_role',
                'data_peserta_pkl.nisn',
                'data_peserta_pkl.asal_sekolah',
                'data_peserta_pkl.jurusan',
                'data_peserta_pkl.tempat_lahir',
                'data_peserta_pkl.tanggal_lahir',
                'data_peserta_pkl.periode_mulai',
                'data_peserta_pkl.periode_selesai'
            )
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json(['data' => $user]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'nama'             => 'sometimes|string|max:100',
            'nomor_hp'         => 'sometimes|nullable|string|max:20',
            'current_password' => 'required_with:password|string',
            'password'         => 'sometimes|string|min:8',
        ]);

        $id_pengguna = $request->user()->id_pengguna;
        $updateData  = [];

        if ($request->filled('nama'))     $updateData['nama']     = $request->nama;
        if ($request->has('nomor_hp'))    $updateData['nomor_hp'] = $request->nomor_hp;

        if ($request->filled('password')) {
            $user = DB::table('pengguna')->where('id_pengguna', $id_pengguna)->first();
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Password lama tidak sesuai.'], 422);
            }
            $updateData['password'] = Hash::make($request->password);
        }

        if (!empty($updateData)) {
            DB::table('pengguna')
                ->where('id_pengguna', $id_pengguna)
                ->update($updateData);
        }

        // Update tabel data_peserta_pkl
        $updatePeserta = [];
        if ($request->has('nisn'))           $updatePeserta['nisn']           = $request->nisn;
        if ($request->has('asal_sekolah'))   $updatePeserta['asal_sekolah']   = $request->asal_sekolah;
        if ($request->has('jurusan'))        $updatePeserta['jurusan']        = $request->jurusan;
        if ($request->has('tempat_lahir'))   $updatePeserta['tempat_lahir']   = $request->tempat_lahir;
        if ($request->has('tanggal_lahir'))  $updatePeserta['tanggal_lahir']  = $request->tanggal_lahir;
        if ($request->has('periode_mulai'))  $updatePeserta['periode_mulai']  = $request->periode_mulai;
        if ($request->has('periode_selesai')) $updatePeserta['periode_selesai'] = $request->periode_selesai;

        if (!empty($updatePeserta)) {
            $exists = DB::table('data_peserta_pkl')
                ->where('id_pengguna', $id_pengguna)
                ->exists();

            if ($exists) {
                DB::table('data_peserta_pkl')
                    ->where('id_pengguna', $id_pengguna)
                    ->update($updatePeserta);
            } else {
                DB::table('data_peserta_pkl')
                    ->insert(array_merge($updatePeserta, ['id_pengguna' => $id_pengguna]));
            }
        }

        if (empty($updateData) && empty($updatePeserta)) {
            return response()->json(['message' => 'Tidak ada data yang diupdate'], 400);
        }

        return response()->json(['message' => 'Profil berhasil diupdate']);
    }
}
