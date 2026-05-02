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
            'nama'     => 'required',
            'username' => 'required|unique:pengguna',
            'email'    => 'required|email|unique:pengguna',
            'password' => 'required|min:8',
            'nomor_hp' => 'required',
            'asal_sekolah' => 'nullable|string',
            'jurusan'=> 'nullable|string'
        ]);

        $user = User::create([
            'nama'     => $request->nama,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => $request->password,
            'nomor_hp' => $request->nomor_hp,
            'id_role'  => 4,
            'status'   => 'pending',
        ]);

        DB::table('data_peserta_pkl')->insert([
            'id_pengguna' => $user->id_pengguna,
            'asal_sekolah' => $request->asal_sekolah ?? null,
            'jurusan' => $request->jurusan ?? null,
            'periode_mulai' => null,
            'periode_selesai' => null,
        ]);

        return response()->json([
            'message' => 'Register berhasil. Silahkan Login',
        ], 201);
    }

    // LOGIN PESERTA (EMAIL)
    public function loginPeserta(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)
                    ->where('id_role', 4)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda belum diverifikasi oleh admin. Silakan upload dokumen persyaratan.'
            ], 403);
        }

        if ($user->status === 'nonaktif') {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.'
            ], 403);
        }

        $ingat = $request->boolean('remember');
        $expiredAt = now()->addDays($ingat ? 30 : 7);
        $token = $user->createToken('auth_token', ['*'], $expiredAt)->plainTextToken;
        $menit = $ingat ? 60 * 24 * 30 : 60 * 24 * 7;

        return response()->json([
            'message' => 'Login berhasil',
            'user'    => $user,
            'token'   => $token,
        ])->cookie('lms_token', $token, $menit, '/', null, false, true);
    }

    // LOGIN ADMIN / TRAINER (USERNAME)
    public function loginStaff(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
                    ->whereIn('id_role', [1, 2, 3])
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user'    => $user,
            'token'   => $token,
        ])->cookie('lms_token', $token, 60 * 24 * 7, '/', null, false, true);
    }

    // CEK SESSION AKTIF (untuk restore session di tab baru)
    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    // LOGOUT (perangkat saat ini)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ])->withoutCookie('lms_token');
    }

    // LOGOUT SEMUA PERANGKAT
    public function logoutSemua(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Berhasil keluar dari semua perangkat'
        ])->withoutCookie('lms_token');
    }
}