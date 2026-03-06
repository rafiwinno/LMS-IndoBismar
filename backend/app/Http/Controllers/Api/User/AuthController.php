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
            'nama' => 'required',
            'username' => 'required|unique:pengguna',
            'email' => 'required|email|unique:pengguna',
            'password' => 'required|min:6',
            'nomor_hp' => 'required'
        ]);

        $user = User::create([
            'nama' => $request->nama,
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password,
            'nomor_hp' => $request->nomor_hp,
            'id_role' => 4 // peserta
        ]);

        return response()->json([
            'message' => 'Register berhasil',
            'data' => $user
        ]);
    }


    // LOGIN PESERTA (EMAIL)
    // LOGIN PESERTA (EMAIL)
    public function loginPeserta(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user
        ]);
    }


    // LOGIN ADMIN / TRAINER (USERNAME)
    public function loginStaff(Request $request)
{
    $user = User::where('username',$request->username)
                ->whereIn('id_role',[1,2,3])
                ->first();

    if(!$user || !Hash::check($request->password,$user->password)){
        return response()->json([
            'message' => 'Username atau password salah'
        ],401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login berhasil',
        'token' => $token,
        'user' => $user
    ]);
}

}
