<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CabangSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('cabang')->insert([
            [
                'nama_cabang' => 'Cabang Pusat',
                'kota'        => 'Jakarta',
                'alamat'      => 'Jl. Sudirman No. 1',
                'telepon'     => '021-1234567',
                'status'      => 'aktif',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nama_cabang' => 'Cabang Surabaya',
                'kota'        => 'Surabaya',
                'alamat'      => 'Jl. Pemuda No. 10',
                'telepon'     => '031-7654321',
                'status'      => 'aktif',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nama_cabang' => 'Cabang Bandung',
                'kota'        => 'Bandung',
                'alamat'      => 'Jl. Asia Afrika No. 5',
                'telepon'     => '022-9876543',
                'status'      => 'aktif',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
