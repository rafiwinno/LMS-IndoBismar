<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $pengguna = Pengguna::with('role')
            ->where('email', $request->email)
            ->first();

        if (! $pengguna || ! Hash::check($request->password, $pengguna->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($pengguna->status !== 'aktif') {
            return response()->json([
                'message' => 'Akun belum diaktifkan. Hubungi administrator.',
            ], 403);
        }

        $token = $pengguna->createToken('lms-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($pengguna),
        ]);
    }

    public function loginAdmin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $pengguna = Pengguna::with('role')
            ->where('username', $request->username)
            ->first();

        if (! $pengguna || ! Hash::check($request->password, $pengguna->password)) {
            return response()->json(['message' => 'Username atau password salah.'], 401);
        }

        // Cek pakai id_role langsung, bukan nama role
        // id_role: 1=superadmin, 2=admin, 3=trainer, 4=peserta
        $allowedRoleIds = [1, 2, 3];

        if (! in_array($pengguna->id_role, $allowedRoleIds)) {
            return response()->json([
                'message' => 'Akun ini tidak memiliki akses admin. Gunakan login peserta.',
            ], 403);
        }

        if ($pengguna->status !== 'aktif') {
            return response()->json([
                'message' => 'Akun belum diaktifkan. Hubungi administrator.',
            ], 403);
        }

        $token = $pengguna->createToken('lms-admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Login admin berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($pengguna),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama'         => 'required|string|max:100',
            'username'     => 'required|string|max:100|unique:pengguna,username',
            'email'        => 'required|email|unique:pengguna,email',
            'password'     => 'required|string|min:8',
            'nomor_hp'     => 'nullable|string|max:20',
            'id_cabang'    => 'required|exists:cabang,id_cabang',
            'asal_sekolah' => 'nullable|string|max:150',
            'jurusan'      => 'nullable|string|max:100',
            'surat_siswa'  => 'nullable|file|mimes:pdf|max:5120',
            'surat_ortu'   => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $pengguna = Pengguna::create([
            'id_role'   => 4,
            'id_cabang' => $request->id_cabang,
            'nama'      => $request->nama,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'nomor_hp'  => $request->nomor_hp,
            'status'    => 'pending',
        ]);

        $suratSiswaPath = null;
        $suratOrtuPath  = null;

        if ($request->hasFile('surat_siswa')) {
            $suratSiswaPath = $request->file('surat_siswa')
                ->store("surat/{$pengguna->id_pengguna}", 'public');
        }
        if ($request->hasFile('surat_ortu')) {
            $suratOrtuPath = $request->file('surat_ortu')
                ->store("surat/{$pengguna->id_pengguna}", 'public');
        }

        $statusDokumen = ($suratSiswaPath && $suratOrtuPath) ? 'menunggu' : 'belum_upload';

        $pengguna->dataPkl()->create([
            'asal_sekolah'  => $request->asal_sekolah,
            'jurusan'       => $request->jurusan,
            'surat_siswa'   => $suratSiswaPath,
            'surat_ortu'    => $suratOrtuPath,
            'status_dokumen' => $statusDokumen,
        ]);

        // Kirim notifikasi ke semua admin cabang yang sama
        $adminCabang = Pengguna::where('id_cabang', $request->id_cabang)
            ->whereIn('id_role', [1, 2])
            ->where('status', 'aktif')
            ->get();

        foreach ($adminCabang as $admin) {
            Notifikasi::create([
                'id_penerima'  => $admin->id_pengguna,
                'judul'        => 'Pendaftar Baru',
                'pesan'        => "Peserta baru \"{$pengguna->nama}\" mendaftar dan menunggu verifikasi dokumen.",
                'tipe'         => 'registrasi_baru',
                'id_referensi' => $pengguna->id_pengguna,
            ]);
        }

        return response()->json([
            'message'        => 'Registrasi berhasil. Tunggu verifikasi dari administrator.',
            'status_dokumen' => $statusDokumen,
            'user'           => [
                'id'     => $pengguna->id_pengguna,
                'nama'   => $pengguna->nama,
                'email'  => $pengguna->email,
                'status' => $pengguna->status,
            ],
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role', 'cabang');
        return response()->json($this->formatUser($user));
    }

    private function formatUser($user): array
    {
        return [
            'id'       => $user->id_pengguna,
            'nama'     => $user->nama,
            'email'    => $user->email,
            'username' => $user->username,
            'role'     => $user->role->nama_role ?? null,
            'id_role'  => $user->id_role,
            'cabang'   => $user->id_cabang,
            'status'   => $user->status,
        ];
    }
}