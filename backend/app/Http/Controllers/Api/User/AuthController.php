<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // REGISTER PESERTA
    public function register(Request $request)
    {
        $request->validate([
            'nama'         => 'required|string|max:100',
            'username'     => 'required|string|max:100|unique:pengguna,username',
            'email'        => 'required|email|unique:pengguna,email',
            'password'     => 'required|string|min:8',
            'nomor_hp'     => 'nullable|string|max:20',
            'asal_sekolah' => 'nullable|string|max:150',
            'jurusan'      => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'nama'      => $request->nama,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => $request->password,
            'nomor_hp'  => $request->nomor_hp,
            'id_role'   => 4,
            'id_cabang' => $request->id_cabang ?? null,
        ]);

        DB::table('data_peserta_pkl')->insert([
            'id_pengguna'  => $user->id_pengguna,
            'asal_sekolah' => $request->asal_sekolah ?? null,
            'jurusan'      => $request->jurusan ?? null,
            'periode_mulai'   => null,
            'periode_selesai' => null,
        ]);

        // Kirim notifikasi ke semua admin cabang yang sama
        if ($user->id_cabang) {
            $adminCabang = User::where('id_cabang', $user->id_cabang)
                ->whereIn('id_role', [1, 2])
                ->where('status', 'aktif')
                ->get();

            foreach ($adminCabang as $admin) {
                Notifikasi::create([
                    'id_penerima'  => $admin->id_pengguna,
                    'judul'        => 'Peserta Baru Mendaftar',
                    'pesan'        => "Peserta baru \"{$user->nama}\" telah mendaftar dan menunggu verifikasi dokumen.",
                    'tipe'         => 'registrasi_baru',
                    'id_referensi' => $user->id_pengguna,
                ]);
            }
        }

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

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user
        ]);
    }

    // LOGIN ADMIN / TRAINER (USERNAME)
    public function loginStaff(Request $request)
    {
        $user = User::where('username', $request->username)
                    ->whereIn('id_role', [1, 2, 3])
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}