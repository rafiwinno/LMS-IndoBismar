<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        if ($request->asal_sekolah || $request->jurusan) {
            $pengguna->dataPkl()->create([
                'asal_sekolah' => $request->asal_sekolah,
                'jurusan'      => $request->jurusan,
            ]);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Tunggu verifikasi dari administrator.',
            'user'    => [
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
            'cabang'   => $user->id_cabang,
            'status'   => $user->status,
        ];
    }
}