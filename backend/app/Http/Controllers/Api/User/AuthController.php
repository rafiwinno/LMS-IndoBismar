<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\Notifikasi;
use App\Models\LoginLog;
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

        $user = Pengguna::create([
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
            $adminCabang = Pengguna::where('id_cabang', $user->id_cabang)
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

        $user = Pengguna::where('email', $request->email)
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

        $user = Pengguna::where('username', $request->username)
                    ->whereIn('id_role', [1, 2, 3])
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addHours(8))->plainTextToken;

        LoginLog::create([
            'user_id'      => $user->id_pengguna,
            'ip_address'   => $request->ip(),
            'logged_in_at' => now(),
        ]);

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
        $user = $request->user();

        // Update logged_out_at pada log login terakhir
        LoginLog::where('user_id', $user->id_pengguna)
            ->whereNull('logged_out_at')
            ->latest('logged_in_at')
            ->first()?->update(['logged_out_at' => now()]);

        $user->currentAccessToken()->delete();

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
