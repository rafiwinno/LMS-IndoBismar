<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pengguna')->insert([

            [
                'nama'       => 'Super Admin',
                'username'   => 'superadmin',
                'email'      => 'superadmin@indobismar.com',   // wajib untuk MFA OTP
                'password'   => Hash::make('Admin@12345'),
                'nomor_hp'   => null,
                'id_role'    => 1,
                'status'     => 'aktif',
                'id_cabang'  => 1,
            ],
            [
                'nama'       => 'Admin Cabang',
                'username'   => 'admincabang',
                'email'      => 'admincabang@indobismar.com',  // wajib untuk MFA OTP
                'password'   => Hash::make('Admin@12345'),
                'nomor_hp'   => null,
                'id_role'    => 2,
                'status'     => 'aktif',
                'id_cabang'  => 1,
            ],
            [
                'nama'       => 'Trainer Satu',
                'username'   => 'trainer1',
                'email'      => 'trainer1@indobismar.com',
                'password'   => Hash::make('Trainer@12345'),
                'nomor_hp'   => null,
                'id_role'    => 3,
                'status'     => 'aktif',
                'id_cabang'  => 1,
            ],
            [
                'nama'       => 'Peserta Test',
                'username'   => 'peserta1',
                'email'      => 'peserta@lms.com',
                'password'   => Hash::make('Peserta@12345'),
                'nomor_hp'   => '08123456789',
                'id_role'    => 4,
                'status'     => 'aktif',
                'id_cabang'  => 1,
            ],

        ]);
    }
}
