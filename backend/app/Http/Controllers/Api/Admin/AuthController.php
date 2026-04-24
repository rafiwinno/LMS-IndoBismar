<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Notifikasi;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
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

        $pengguna = Pengguna::with(['role', 'dataPkl'])
            ->where('email', $request->email)
            ->first();

        if (! $pengguna || ! Hash::check($request->password, $pengguna->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($pengguna->status === 'ditolak') {
            return response()->json([
                'message' => 'Akun Anda telah ditolak. Hubungi administrator.',
            ], 403);
        }

        $token = $pengguna->createToken('lms-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($pengguna),
        ])->withCookie($this->makeAuthCookie($token));
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

        LoginLog::create([
            'user_id'      => $pengguna->id_pengguna,
            'ip_address'   => $request->ip(),
            'logged_in_at' => now(),
        ]);

        return response()->json([
            'message' => 'Login admin berhasil.',
            'token'   => $token,
            'user'    => $this->formatUser($pengguna),
        ])->withCookie($this->makeAuthCookie($token));
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

        $pengguna->dataPkl()->create([
            'asal_sekolah'   => $request->asal_sekolah,
            'jurusan'        => $request->jurusan,
            'status_dokumen' => 'belum_upload',
        ]);

        // Notifikasi 1: Peserta baru mendaftar
        $adminCabang = Pengguna::where('id_cabang', $request->id_cabang)
            ->whereIn('id_role', [1, 2])
            ->where('status', 'aktif')
            ->get();

        foreach ($adminCabang as $admin) {
            Notifikasi::create([
                'id_penerima'  => $admin->id_pengguna,
                'judul'        => 'Peserta Baru Mendaftar',
                'pesan'        => "Peserta baru \"{$pengguna->nama}\" telah mendaftar. Menunggu upload dokumen dari peserta.",
                'tipe'         => 'registrasi_baru',
                'id_referensi' => $pengguna->id_pengguna,
            ]);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan login dan upload dokumen Anda.',
            'user'    => [
                'id'     => $pengguna->id_pengguna,
                'nama'   => $pengguna->nama,
                'email'  => $pengguna->email,
                'status' => $pengguna->status,
            ],
        ], 201);
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('lms-admin-token')->plainTextToken;
        return response()->json(['token' => $token])
            ->withCookie($this->makeAuthCookie($token));
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        LoginLog::where('user_id', $user->id_pengguna)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first()?->update(['logged_out_at' => now()]);

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.'])
            ->withCookie(Cookie::forget('auth_token'));
    }

    // Hapus SEMUA token aktif milik user ini (paksa logout semua sesi/perangkat)
    public function logoutAll(Request $request)
    {
        $user = $request->user();

        LoginLog::where('user_id', $user->id_pengguna)
            ->whereNull('logged_out_at')
            ->update(['logged_out_at' => now()]);

        $user->tokens()->delete();

        return response()->json(['message' => 'Semua sesi berhasil diakhiri.'])
            ->withCookie(Cookie::forget('auth_token'));
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role', 'cabang', 'dataPkl');
        return response()->json($this->formatUser($user));
    }

    private function makeAuthCookie(string $token): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie(
            name    : 'auth_token',
            value   : $token,
            minutes : 480,
            path    : '/',
            domain  : null,
            secure  : app()->isProduction(),
            httpOnly: true,
            raw     : false,
            sameSite: 'Lax',
        );
    }

    private function formatUser($user): array
    {
        return [
            'id'               => $user->id_pengguna,
            'nama'             => $user->nama,
            'email'            => $user->email,
            'username'         => $user->username,
            'role'             => $user->role->nama_role ?? null,
            'id_role'          => $user->id_role,
            'cabang'           => $user->id_cabang,
            'status'           => $user->status,
            'status_dokumen'   => $user->dataPkl->status_dokumen   ?? null,
            'catatan_dokumen'  => $user->dataPkl->catatan_dokumen  ?? null,
        ];
    }
}