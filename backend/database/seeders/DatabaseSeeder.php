<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ─────────────────────────────────────────────────────────────
        DB::table('role')->insertOrIgnore([
            ['id_role' => 1, 'nama_role' => 'superadmin'],
            ['id_role' => 2, 'nama_role' => 'admin'],
            ['id_role' => 3, 'nama_role' => 'trainer'],
            ['id_role' => 4, 'nama_role' => 'peserta'],
        ]);

        // ── Cabang default ─────────────────────────────────────────────────────
        $cabangId = DB::table('cabang')->insertGetId([
            'nama_cabang' => 'Surabaya Central',
            'alamat'      => 'Jl. Raya Darmo No. 1',
            'kota'        => 'Surabaya',
            'dibuat_pada' => now(),
        ]);

        // ── Admin default ──────────────────────────────────────────────────────
        DB::table('pengguna')->insertOrIgnore([
            'id_role'    => 2,
            'id_cabang'  => $cabangId,
            'nama'       => 'Administrator',
            'username'   => 'admin',
            'email'      => 'admin@indobismar.com',
            'password'   => Hash::make('password'),
            'nomor_hp'   => null,
            'status'     => 'aktif',
            'dibuat_pada'=> now(),
        ]);
    }
}
