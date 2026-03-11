<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\LoginLog;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function loginStaff(Request $request)
    {
        $user = Pengguna::where('username', $request->username)
                        ->whereIn('id_role', [1, 2, 3])
                        ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun anda tidak aktif.'], 403);
        }

        $roleName = match((int) $user->id_role) {
            1 => 'superadmin',
            2 => 'admin',
            3 => 'trainer',
            default => 'unknown',
        };

        $token = $user->createToken('auth_token')->plainTextToken;

        // Catat login log
        LoginLog::create([
            'user_id'      => $user->id,
            'ip_address'   => $request->ip(),
            'logged_in_at' => now(),
            'logged_out_at'=> null,
        ]);

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => [
                'id'        => $user->id,
                'nama'      => $user->nama,
                'username'  => $user->username,
                'email'     => $user->email,
                'id_role'   => $user->id_role,
                'role'      => $roleName,
                'id_cabang' => $user->id_cabang,
                'status'    => $user->status,
            ]
        ]);
    }

    public function loginPeserta(Request $request)
    {
        $input = $request->email;

        $user = Pengguna::where(function($q) use ($input) {
                        $q->where('email', $input)
                          ->orWhere('username', $input);
                    })
                    ->where('id_role', 4)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if ($user->status !== 'aktif') {
            return response()->json(['message' => 'Akun anda tidak aktif.'], 403);
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
            'message' => 'Login berhasil',
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
            ]
        ]);
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
            'message' => 'Register berhasil',
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
            ]
        ], 201);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        // Tandai logged_out_at pada sesi login terakhir yang belum logout
        LoginLog::where('user_id', $user->id)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first()
            ?->update(['logged_out_at' => now()]);

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}
