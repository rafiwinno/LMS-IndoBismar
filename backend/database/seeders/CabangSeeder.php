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
            ],
            [
                'nama_cabang' => 'Cabang Surabaya',
                'kota'        => 'Surabaya',
                'alamat'      => 'Jl. Pemuda No. 10',
            ],
            [
                'nama_cabang' => 'Cabang Bandung',
                'kota'        => 'Bandung',
                'alamat'      => 'Jl. Asia Afrika No. 5',
            ],
        ]);
    }
}
