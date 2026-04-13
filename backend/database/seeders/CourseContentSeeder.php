<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseContentSeeder extends Seeder
{
    public function run(): void
    {
        // Insert materi kursus 7 - Web Development Dasar
        $materi = [
            // Kursus 7
            [7, 1, 'Apa itu HTML dan Cara Kerjanya?', 'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU'],
            [7, 2, 'Struktur Dasar HTML', 'pdf', 'https://www.w3.org/TR/html52/introduction.html'],
            [7, 3, 'Pengenalan CSS', 'video', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'],
            [7, 4, 'Box Model & Flexbox', 'pdf', 'https://css-tricks.com/guides/flexbox/'],
            [7, 5, 'Variabel, Tipe Data & Fungsi', 'video', 'https://www.youtube.com/watch?v=W6NZfCO5SIk'],
            [7, 6, 'DOM Manipulation & Event', 'pdf', 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'],

            // Kursus 8
            [8, 1, 'Instalasi Laravel & Konfigurasi Awal', 'video', 'https://www.youtube.com/watch?v=MFh0Fd7BsjE'],
            [8, 2, 'Struktur Folder & Artisan CLI', 'pdf', 'https://laravel.com/docs/structure'],
            [8, 3, 'Routing, Controller & View', 'video', 'https://www.youtube.com/watch?v=ImtZ5yENzgE'],
            [8, 4, 'Eloquent ORM & Database', 'pdf', 'https://laravel.com/docs/eloquent'],
            [8, 5, 'Membuat REST API dengan Laravel', 'video', 'https://www.youtube.com/watch?v=MT-GJQIY3EU'],
            [8, 6, 'Laravel Sanctum Token Auth', 'pdf', 'https://laravel.com/docs/sanctum'],

        ];

        foreach ($materi as $m) {
            DB::table('materi')->insert([
                'id_kursus'    => $m[0],
                'urutan'       => $m[1],
                'judul_materi' => $m[2],
                'tipe_materi'  => $m[3],
                'file_materi'  => $m[4],
            ]);
        }
    }
}