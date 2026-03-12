<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\LoginLog;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private const ROLE_NAMES = [
        1 => 'superadmin',
        2 => 'admin',
        3 => 'trainer',
        4 => 'user',
    ];

    // POST /login — semua role
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Cari user by username ATAU email
        $user = Pengguna::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah.'], 401);
        }

        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun kamu tidak aktif. Hubungi administrator.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Catat login log
        LoginLog::create([
            'user_id'      => $user->id,
            'ip_address'   => $request->ip(),
            'logged_in_at' => now(),
            'logged_out_at'=> null,
        ]);

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => [
                'id'        => $user->id,
                'nama'      => $user->nama,
                'username'  => $user->username,
                'email'     => $user->email,
                'id_role'   => $user->id_role,
                'role'      => self::ROLE_NAMES[$user->id_role] ?? 'user',
                'id_cabang' => $user->id_cabang,
                'status'    => $user->status,
            ],
        ]);
    }

    // POST /login/staff — tetap ada untuk backward compatibility
    public function loginStaff(Request $request)
    {
        return $this->login($request);
    }

    // POST /login/peserta — tetap ada untuk backward compatibility
    public function loginPeserta(Request $request)
    {
        return $this->login($request);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama'     => 'required',
            'username' => 'required|unique:pengguna',
            'email'    => 'required|email|unique:pengguna',
            'password' => 'required|min:6',
            'nomor_hp' => 'nullable|string',
        ]);

        $user = Pengguna::create([
            'nama'      => $request->nama,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'nomor_hp'  => $request->nomor_hp,
            'id_role'   => 4,
            'id_cabang' => 1,
            'status'    => 'aktif',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Register berhasil.',
            'token'   => $token,
            'user'    => [
                'id'        => $user->id,
                'nama'      => $user->nama,
                'username'  => $user->username,
                'email'     => $user->email,
                'id_role'   => $user->id_role,
                'role'      => 'user',
                'id_cabang' => $user->id_cabang,
                'status'    => $user->status,
            ],
        ], 201);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        LoginLog::where('user_id', $user->id)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first()
            ?->update(['logged_out_at' => now()]);

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
