<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // REGISTER PESERTA
    public function register(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:100',
            'username' => 'required|string|max:100|unique:pengguna,username',
            'email'    => 'required|email|unique:pengguna,email',
            'password' => 'required|min:6|confirmed', // FIX: tambah confirmed untuk validasi ulang password
            'nomor_hp' => 'required|string|max:20',
        ]);

        $user = User::create([
            'nama'     => $request->nama,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password), // FIX: hash password yang sebelumnya plaintext!
            'nomor_hp' => $request->nomor_hp,
            'id_role'  => 4, // peserta
            'status'   => 'aktif',
        ]);

        // Jangan kembalikan password di response
        $user->makeHidden(['password']);

        return response()->json([
            'message' => 'Register berhasil',
            'data'    => $user,
        ], 201);
    }

    // LOGIN PESERTA (EMAIL)
    public function loginPeserta(Request $request)
    {
        // FIX: validasi input sebelum query
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->where('id_role', 4)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        // FIX: cek status aktif
        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun belum aktif atau ditolak'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user->makeHidden(['password']),
        ]);
    }

    // LOGIN ADMIN / TRAINER (USERNAME)
    public function loginStaff(Request $request)
    {
        // FIX: validasi input sebelum query
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
            ->whereIn('id_role', [1, 2, 3])
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        // FIX: cek status aktif
        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun tidak aktif'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user->makeHidden(['password']),
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }
}
