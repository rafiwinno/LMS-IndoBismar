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
            [7, 'Bab 1: Pengenalan Web', 1, 'Apa itu HTML dan Cara Kerjanya?', 'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU'],
            [7, 'Bab 1: Pengenalan Web', 2, 'Struktur Dasar HTML', 'pdf', 'https://www.w3.org/TR/html52/introduction.html'],
            [7, 'Bab 2: CSS & Styling', 3, 'Pengenalan CSS', 'video', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'],
            [7, 'Bab 2: CSS & Styling', 4, 'Box Model & Flexbox', 'pdf', 'https://css-tricks.com/guides/flexbox/'],
            [7, 'Bab 3: JavaScript Dasar', 5, 'Variabel, Tipe Data & Fungsi', 'video', 'https://www.youtube.com/watch?v=W6NZfCO5SIk'],
            [7, 'Bab 3: JavaScript Dasar', 6, 'DOM Manipulation & Event', 'pdf', 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'],

            // Kursus 8
            [8, 'Bab 1: Setup & Konfigurasi', 1, 'Instalasi Laravel & Konfigurasi Awal', 'video', 'https://www.youtube.com/watch?v=MFh0Fd7BsjE'],
            [8, 'Bab 1: Setup & Konfigurasi', 2, 'Struktur Folder & Artisan CLI', 'pdf', 'https://laravel.com/docs/structure'],
            [8, 'Bab 2: MVC & Routing', 3, 'Routing, Controller & View', 'video', 'https://www.youtube.com/watch?v=ImtZ5yENzgE'],
            [8, 'Bab 2: MVC & Routing', 4, 'Eloquent ORM & Database', 'pdf', 'https://laravel.com/docs/eloquent'],
            [8, 'Bab 3: Authentication & API', 5, 'Membuat REST API dengan Laravel', 'video', 'https://www.youtube.com/watch?v=MT-GJQIY3EU'],
            [8, 'Bab 3: Authentication & API', 6, 'Laravel Sanctum Token Auth', 'pdf', 'https://laravel.com/docs/sanctum'],

            // Kursus 9
            [9, 'Bab 1: Dasar React', 1, 'Pengenalan React & JSX', 'video', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
            [9, 'Bab 1: Dasar React', 2, 'Props & State', 'pdf', 'https://react.dev/learn'],
            [9, 'Bab 2: Hooks', 3, 'useState & useEffect Explained', 'video', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
            [9, 'Bab 2: Hooks', 4, 'Custom Hooks', 'pdf', 'https://react.dev/learn/reusing-logic-with-custom-hooks'],
            [9, 'Bab 3: Ekosistem React', 5, 'React Router v6', 'video', 'https://www.youtube.com/watch?v=Ul3y1LXxzdU'],
            [9, 'Bab 3: Ekosistem React', 6, 'Fetching Data dengan Axios', 'pdf', 'https://axios-http.com/docs/intro'],
        ];

        foreach ($materi as $m) {
            DB::table('materi')->insert([
                'id_kursus'    => $m[0],
                'sub_bab'      => $m[1],
                'urutan'       => $m[2],
                'judul_materi' => $m[3],
                'tipe_materi'  => $m[4],
                'file_materi'  => $m[5],
            ]);
        }
    }
}