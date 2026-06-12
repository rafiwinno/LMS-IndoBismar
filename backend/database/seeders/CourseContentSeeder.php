<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CourseContentSeeder extends Seeder
{
    public function run(): void
    {
        // Peserta Test = id_pengguna 4, Trainer Satu = id_pengguna 3
        $trainerId = 3;
        $pesertaId = 4;
        $cabangId  = 1;
        $now       = now();

        // ─── Insert Kursus ────────────────────────────────────────────────────────
        $kursus1Id = DB::table('kursus')->insertGetId([
            'id_trainer'   => $trainerId,
            'id_cabang'    => $cabangId,
            'judul_kursus' => 'Web Development Dasar',
            'deskripsi'    => 'Pelajari dasar-dasar web development mulai dari HTML, CSS, hingga JavaScript.',
            'status'       => 'aktif',
            'dibuat_pada'  => $now,
        ]);

        $kursus2Id = DB::table('kursus')->insertGetId([
            'id_trainer'   => $trainerId,
            'id_cabang'    => $cabangId,
            'judul_kursus' => 'Laravel untuk Pemula',
            'deskripsi'    => 'Belajar framework PHP Laravel dari instalasi hingga membuat REST API.',
            'status'       => 'aktif',
            'dibuat_pada'  => $now,
        ]);

        // ─── Pendaftaran Peserta Test ─────────────────────────────────────────────
        DB::table('peserta_kursus')->insert([
            ['id_pengguna' => $pesertaId, 'id_kursus' => $kursus1Id, 'status' => 'aktif', 'tanggal_daftar' => $now],
            ['id_pengguna' => $pesertaId, 'id_kursus' => $kursus2Id, 'status' => 'aktif', 'tanggal_daftar' => $now],
        ]);

        // ─── Materi ───────────────────────────────────────────────────────────────
        $materi = [
            [$kursus1Id, 1, 'Apa itu HTML dan Cara Kerjanya?',   'video', 'https://www.youtube.com/watch?v=qz0aGYrrlhU'],
            [$kursus1Id, 2, 'Struktur Dasar HTML',               'pdf',   'https://www.w3.org/TR/html52/introduction.html'],
            [$kursus1Id, 3, 'Pengenalan CSS',                    'video', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'],
            [$kursus1Id, 4, 'Box Model & Flexbox',               'pdf',   'https://css-tricks.com/guides/flexbox/'],
            [$kursus1Id, 5, 'Variabel, Tipe Data & Fungsi',      'video', 'https://www.youtube.com/watch?v=W6NZfCO5SIk'],
            [$kursus1Id, 6, 'DOM Manipulation & Event',          'pdf',   'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'],

            [$kursus2Id, 1, 'Instalasi Laravel & Konfigurasi Awal',  'video', 'https://www.youtube.com/watch?v=MFh0Fd7BsjE'],
            [$kursus2Id, 2, 'Struktur Folder & Artisan CLI',         'pdf',   'https://laravel.com/docs/structure'],
            [$kursus2Id, 3, 'Routing, Controller & View',            'video', 'https://www.youtube.com/watch?v=ImtZ5yENzgE'],
            [$kursus2Id, 4, 'Eloquent ORM & Database',               'pdf',   'https://laravel.com/docs/eloquent'],
            [$kursus2Id, 5, 'Membuat REST API dengan Laravel',       'video', 'https://www.youtube.com/watch?v=MT-GJQIY3EU'],
            [$kursus2Id, 6, 'Laravel Sanctum Token Auth',            'pdf',   'https://laravel.com/docs/sanctum'],
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

        // ─── Tugas ────────────────────────────────────────────────────────────────
        // Kursus 1 — Web Development Dasar
        DB::table('tugas')->insert([
            [
                'id_kursus'     => $kursus1Id,
                'judul_tugas'   => 'Buat Halaman Profil dengan HTML & CSS',
                'deskripsi'     => 'Buatlah halaman profil pribadi menggunakan HTML5 dan CSS3. Halaman harus memuat foto profil, nama, bio singkat, dan daftar skill. Gunakan Flexbox untuk layout. Kumpulkan dalam format file ZIP berisi index.html dan style.css.',
                'deadline'      => Carbon::now()->addDays(14),
                'file_soal'     => null,
                'nilai_maksimal' => 100,
            ],
            [
                'id_kursus'     => $kursus1Id,
                'judul_tugas'   => 'Implementasi JavaScript DOM Manipulation',
                'deskripsi'     => 'Buat aplikasi to-do list sederhana menggunakan vanilla JavaScript. Fitur yang wajib ada: tambah item, tandai selesai, hapus item, dan filter (semua/aktif/selesai). Tidak boleh menggunakan library/framework apapun.',
                'deadline'      => Carbon::now()->addDays(21),
                'file_soal'     => null,
                'nilai_maksimal' => 100,
            ],
        ]);

        // Kursus 2 — Laravel untuk Pemula
        DB::table('tugas')->insert([
            [
                'id_kursus'     => $kursus2Id,
                'judul_tugas'   => 'Buat CRUD Produk dengan Laravel',
                'deskripsi'     => 'Buat aplikasi manajemen produk menggunakan Laravel dengan fitur CRUD lengkap (Create, Read, Update, Delete). Gunakan Eloquent ORM untuk interaksi database dan blade template untuk tampilan. Sertakan validasi form di setiap input.',
                'deadline'      => Carbon::now()->addDays(14),
                'file_soal'     => null,
                'nilai_maksimal' => 100,
            ],
            [
                'id_kursus'     => $kursus2Id,
                'judul_tugas'   => 'REST API Authentication dengan Sanctum',
                'deskripsi'     => 'Buat REST API untuk sistem autentikasi menggunakan Laravel Sanctum. Endpoint yang wajib ada: register, login, logout, dan get profile (protected). Gunakan Postman untuk mengujicoba dan kumpulkan file koleksi Postman bersama source code.',
                'deadline'      => Carbon::now()->addDays(21),
                'file_soal'     => null,
                'nilai_maksimal' => 100,
            ],
        ]);

        // ─── Kuis ─────────────────────────────────────────────────────────────────
        // Kursus 1 — Kuis HTML & CSS Dasar
        $kuis1Id = DB::table('kuis')->insertGetId([
            'id_kursus'     => $kursus1Id,
            'judul_kuis'    => 'Kuis HTML & CSS Dasar',
            'waktu_mulai'   => Carbon::now()->subDays(1),
            'waktu_selesai' => Carbon::now()->addDays(13),
            'durasi_menit'  => 60,
            'dibuat_pada'   => $now,
        ]);

        $soalKuis1 = [
            [
                'pertanyaan' => 'Tag HTML yang digunakan untuk membuat heading terbesar adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => '<h6>', 'benar' => false],
                    ['teks' => '<h1>', 'benar' => true],
                    ['teks' => '<header>', 'benar' => false],
                    ['teks' => '<title>', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Property CSS yang digunakan untuk mengatur jarak di dalam elemen (antara konten dan border) adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'margin', 'benar' => false],
                    ['teks' => 'border', 'benar' => false],
                    ['teks' => 'padding', 'benar' => true],
                    ['teks' => 'spacing', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Manakah cara penulisan CSS yang memiliki prioritas (specificity) tertinggi?',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'Class selector (.nama)', 'benar' => false],
                    ['teks' => 'Element selector (p)', 'benar' => false],
                    ['teks' => 'Inline style (style="...")', 'benar' => true],
                    ['teks' => 'ID selector (#id)', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Atribut HTML yang digunakan untuk mendefinisikan tujuan link adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'src', 'benar' => false],
                    ['teks' => 'href', 'benar' => true],
                    ['teks' => 'link', 'benar' => false],
                    ['teks' => 'url', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Nilai property CSS `display` yang membuat elemen ditampilkan sebagai flex container adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'display: block', 'benar' => false],
                    ['teks' => 'display: grid', 'benar' => false],
                    ['teks' => 'display: inline', 'benar' => false],
                    ['teks' => 'display: flex', 'benar' => true],
                ],
            ],
        ];

        foreach ($soalKuis1 as $soal) {
            $pId = DB::table('pertanyaan')->insertGetId([
                'id_kuis'     => $kuis1Id,
                'pertanyaan'  => $soal['pertanyaan'],
                'tipe'        => $soal['tipe'],
                'bobot_nilai' => $soal['bobot'],
            ]);
            foreach ($soal['pilihan'] as $p) {
                DB::table('pilihan_jawaban')->insert([
                    'id_pertanyaan' => $pId,
                    'teks_jawaban'  => $p['teks'],
                    'benar'         => $p['benar'],
                ]);
            }
        }

        // Kursus 1 — Kuis JavaScript
        $kuis2Id = DB::table('kuis')->insertGetId([
            'id_kursus'     => $kursus1Id,
            'judul_kuis'    => 'Kuis JavaScript Dasar',
            'waktu_mulai'   => Carbon::now()->subDays(1),
            'waktu_selesai' => Carbon::now()->addDays(20),
            'durasi_menit'  => 60,
            'dibuat_pada'   => $now,
        ]);

        $soalKuis2 = [
            [
                'pertanyaan' => 'Fungsi JavaScript yang digunakan untuk memilih elemen HTML berdasarkan ID adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => 'document.querySelector()', 'benar' => false],
                    ['teks' => 'document.getElement()', 'benar' => false],
                    ['teks' => 'document.getElementById()', 'benar' => true],
                    ['teks' => 'document.findById()', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Keyword JavaScript untuk mendeklarasikan variabel yang nilainya tidak bisa diubah adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => 'var', 'benar' => false],
                    ['teks' => 'let', 'benar' => false],
                    ['teks' => 'const', 'benar' => true],
                    ['teks' => 'static', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Method yang digunakan untuk menambahkan event listener pada elemen adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => 'element.on()', 'benar' => false],
                    ['teks' => 'element.addEventListener()', 'benar' => true],
                    ['teks' => 'element.listen()', 'benar' => false],
                    ['teks' => 'element.bind()', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Jelaskan perbedaan antara `var`, `let`, dan `const` dalam JavaScript!',
                'tipe'       => 'essay',
                'bobot'      => 25,
                'pilihan'    => [],
            ],
        ];

        foreach ($soalKuis2 as $soal) {
            $pId = DB::table('pertanyaan')->insertGetId([
                'id_kuis'     => $kuis2Id,
                'pertanyaan'  => $soal['pertanyaan'],
                'tipe'        => $soal['tipe'],
                'bobot_nilai' => $soal['bobot'],
            ]);
            foreach ($soal['pilihan'] as $p) {
                DB::table('pilihan_jawaban')->insert([
                    'id_pertanyaan' => $pId,
                    'teks_jawaban'  => $p['teks'],
                    'benar'         => $p['benar'],
                ]);
            }
        }

        // Kursus 2 — Kuis Laravel Dasar
        $kuis3Id = DB::table('kuis')->insertGetId([
            'id_kursus'     => $kursus2Id,
            'judul_kuis'    => 'Kuis Laravel Dasar',
            'waktu_mulai'   => Carbon::now()->subDays(1),
            'waktu_selesai' => Carbon::now()->addDays(13),
            'durasi_menit'  => 60,
            'dibuat_pada'   => $now,
        ]);

        $soalKuis3 = [
            [
                'pertanyaan' => 'Perintah Artisan untuk membuat controller baru di Laravel adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'php artisan new:controller NamaController', 'benar' => false],
                    ['teks' => 'php artisan make:controller NamaController', 'benar' => true],
                    ['teks' => 'php artisan create:controller NamaController', 'benar' => false],
                    ['teks' => 'php artisan generate:controller NamaController', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'File konfigurasi database di Laravel terletak di...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'config/app.php', 'benar' => false],
                    ['teks' => '.env saja', 'benar' => false],
                    ['teks' => 'config/database.php', 'benar' => true],
                    ['teks' => 'app/database.php', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Method Eloquent yang digunakan untuk mengambil semua record dari tabel adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'Model::get()', 'benar' => false],
                    ['teks' => 'Model::fetchAll()', 'benar' => false],
                    ['teks' => 'Model::all()', 'benar' => true],
                    ['teks' => 'Model::select()', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Di Laravel, middleware digunakan untuk...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 20,
                'pilihan'    => [
                    ['teks' => 'Mengatur tampilan blade template', 'benar' => false],
                    ['teks' => 'Memfilter HTTP request yang masuk ke aplikasi', 'benar' => true],
                    ['teks' => 'Mengelola koneksi database', 'benar' => false],
                    ['teks' => 'Membuat migrasi database', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Jelaskan apa itu Eloquent ORM dan keuntungan menggunakannya dibandingkan query SQL biasa!',
                'tipe'       => 'essay',
                'bobot'      => 20,
                'pilihan'    => [],
            ],
        ];

        foreach ($soalKuis3 as $soal) {
            $pId = DB::table('pertanyaan')->insertGetId([
                'id_kuis'     => $kuis3Id,
                'pertanyaan'  => $soal['pertanyaan'],
                'tipe'        => $soal['tipe'],
                'bobot_nilai' => $soal['bobot'],
            ]);
            foreach ($soal['pilihan'] as $p) {
                DB::table('pilihan_jawaban')->insert([
                    'id_pertanyaan' => $pId,
                    'teks_jawaban'  => $p['teks'],
                    'benar'         => $p['benar'],
                ]);
            }
        }

        // Kursus 2 — Kuis REST API & Sanctum
        $kuis4Id = DB::table('kuis')->insertGetId([
            'id_kursus'     => $kursus2Id,
            'judul_kuis'    => 'Kuis REST API & Sanctum',
            'waktu_mulai'   => Carbon::now()->subDays(1),
            'waktu_selesai' => Carbon::now()->addDays(20),
            'durasi_menit'  => 60,
            'dibuat_pada'   => $now,
        ]);

        $soalKuis4 = [
            [
                'pertanyaan' => 'HTTP method yang digunakan untuk membuat resource baru (create) dalam REST API adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => 'GET', 'benar' => false],
                    ['teks' => 'POST', 'benar' => true],
                    ['teks' => 'PUT', 'benar' => false],
                    ['teks' => 'DELETE', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'HTTP status code yang dikembalikan ketika resource berhasil dibuat adalah...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => '200 OK', 'benar' => false],
                    ['teks' => '204 No Content', 'benar' => false],
                    ['teks' => '201 Created', 'benar' => true],
                    ['teks' => '202 Accepted', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Sanctum menyimpan token autentikasi API di tabel...',
                'tipe'       => 'pilihan_ganda',
                'bobot'      => 25,
                'pilihan'    => [
                    ['teks' => 'tokens', 'benar' => false],
                    ['teks' => 'api_tokens', 'benar' => false],
                    ['teks' => 'personal_access_tokens', 'benar' => true],
                    ['teks' => 'sanctum_tokens', 'benar' => false],
                ],
            ],
            [
                'pertanyaan' => 'Jelaskan perbedaan antara autentikasi berbasis session dan token (seperti Sanctum) dalam konteks REST API!',
                'tipe'       => 'essay',
                'bobot'      => 25,
                'pilihan'    => [],
            ],
        ];

        foreach ($soalKuis4 as $soal) {
            $pId = DB::table('pertanyaan')->insertGetId([
                'id_kuis'     => $kuis4Id,
                'pertanyaan'  => $soal['pertanyaan'],
                'tipe'        => $soal['tipe'],
                'bobot_nilai' => $soal['bobot'],
            ]);
            foreach ($soal['pilihan'] as $p) {
                DB::table('pilihan_jawaban')->insert([
                    'id_pertanyaan' => $pId,
                    'teks_jawaban'  => $p['teks'],
                    'benar'         => $p['benar'],
                ]);
            }
        }
    }
}
