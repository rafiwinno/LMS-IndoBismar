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
                'nama' => 'superadmin',
                'username' => 'superadmin',
                'email' => null,
                'password' => Hash::make('password'),
                'nomor_hp' => null,
                'id_role' => 1,
                'status' => 'aktif'
            ],

            [
                'nama' => 'admincabang',
                'username' => 'admincabang',
                'email' => null,
                'password' => Hash::make('password'),
                'nomor_hp' => null,
                'id_role' => 2,
                'status' => 'aktif'
            ],

            [
                'nama' => 'trainer1',
                'username' => 'trainer1',
                'email' => null,
                'password' => Hash::make('password'),
                'nomor_hp' => null,
                'id_role' => 3,
                'status' => 'aktif'
            ],

            [
                'nama' => 'Peserta Test',
                'username' => 'peserta1',
                'email' => 'peserta@lms.com',
                'password' => Hash::make('password'),
                'nomor_hp' => '08123456789',
                'id_role' => 4,
                'status' => 'aktif'
            ]

        ]);
    }
}
