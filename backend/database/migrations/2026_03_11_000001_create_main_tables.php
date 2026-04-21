<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // role
        Schema::create('role', function (Blueprint $table) {
            $table->id('id_role');
            $table->string('nama_role');
        });

        // kursus
        Schema::create('kursus', function (Blueprint $table) {
            $table->id('id_kursus');
            $table->unsignedBigInteger('id_trainer')->nullable();
            $table->unsignedBigInteger('id_cabang')->nullable();
            $table->string('judul_kursus');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'nonaktif', 'draft'])->default('draft');
            $table->timestamp('dibuat_pada')->useCurrent();
        });

        // peserta_kursus
        Schema::create('peserta_kursus', function (Blueprint $table) {
            $table->id('id_peserta_kursus');
            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_kursus');
            $table->string('status')->default('aktif');
            $table->timestamp('tanggal_daftar')->nullable();
        });

        // materi
        Schema::create('materi', function (Blueprint $table) {
            $table->id('id_materi');
            $table->unsignedBigInteger('id_kursus');
            $table->string('judul_materi');
            $table->string('sub_bab')->nullable();
            $table->string('tipe_materi')->nullable(); // video, pdf, text, dll
            $table->string('file_materi')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamp('dibuat_pada')->useCurrent();
        });

        // progress_materi
        Schema::create('progress_materi', function (Blueprint $table) {
            $table->id('id_progress');
            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_materi');
            $table->string('status')->default('belum');
            $table->timestamp('waktu_update')->nullable();
        });

        // tugas
        Schema::create('tugas', function (Blueprint $table) {
            $table->id('id_tugas');
            $table->unsignedBigInteger('id_kursus');
            $table->string('judul_tugas');
            $table->text('deskripsi')->nullable();
            $table->timestamp('deadline')->nullable();
        });

        // pengumpulan_tugas
        Schema::create('pengumpulan_tugas', function (Blueprint $table) {
            $table->id('id_pengumpulan');
            $table->unsignedBigInteger('id_tugas');
            $table->unsignedBigInteger('id_pengguna');
            $table->string('file_tugas')->nullable();
            $table->timestamp('tanggal_kumpul')->nullable();
            $table->decimal('nilai', 5, 2)->nullable();
            $table->text('feedback')->nullable();
        });

        // kuis
        Schema::create('kuis', function (Blueprint $table) {
            $table->id('id_kuis');
            $table->unsignedBigInteger('id_kursus');
            $table->string('judul_kuis');
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();
        });

        // pertanyaan
        Schema::create('pertanyaan', function (Blueprint $table) {
            $table->id('id_pertanyaan');
            $table->unsignedBigInteger('id_kuis');
            $table->text('pertanyaan');
            $table->string('tipe')->default('pilihan_ganda'); // pilihan_ganda, essay
            $table->decimal('bobot_nilai', 5, 2)->default(1);
        });

        // pilihan_jawaban
        Schema::create('pilihan_jawaban', function (Blueprint $table) {
            $table->id('id_pilihan');
            $table->unsignedBigInteger('id_pertanyaan');
            $table->text('teks_jawaban');
            $table->boolean('benar')->default(false);
        });

        // attempt_kuis
        Schema::create('attempt_kuis', function (Blueprint $table) {
            $table->id('id_attempt');
            $table->unsignedBigInteger('id_kuis');
            $table->unsignedBigInteger('id_pengguna');
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->decimal('skor', 5, 2)->nullable();
            $table->string('status')->default('berlangsung');
        });

        // jawaban_kuis
        Schema::create('jawaban_kuis', function (Blueprint $table) {
            $table->id('id_jawaban');
            $table->unsignedBigInteger('id_attempt');
            $table->unsignedBigInteger('id_pertanyaan');
            $table->unsignedBigInteger('id_pilihan')->nullable();
            $table->text('jawaban_text')->nullable();
            $table->decimal('skor', 5, 2)->nullable();
        });

        // data_peserta_pkl
        Schema::create('data_peserta_pkl', function (Blueprint $table) {
            $table->id('id_data');
            $table->unsignedBigInteger('id_pengguna');
            $table->string('asal_sekolah')->nullable();
            $table->string('jurusan')->nullable();
            $table->date('periode_mulai')->nullable();
            $table->date('periode_selesai')->nullable();
        });

        // penilaian_pkl
        Schema::create('penilaian_pkl', function (Blueprint $table) {
            $table->id('id_penilaian');
            $table->unsignedBigInteger('id_pengguna');
            $table->decimal('nilai_teknis', 5, 2)->nullable();
            $table->decimal('nilai_non_teknis', 5, 2)->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('dinilai_oleh')->nullable();
            $table->date('tanggal_penilaian')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penilaian_pkl');
        Schema::dropIfExists('data_peserta_pkl');
        Schema::dropIfExists('jawaban_kuis');
        Schema::dropIfExists('attempt_kuis');
        Schema::dropIfExists('pilihan_jawaban');
        Schema::dropIfExists('pertanyaan');
        Schema::dropIfExists('kuis');
        Schema::dropIfExists('pengumpulan_tugas');
        Schema::dropIfExists('tugas');
        Schema::dropIfExists('progress_materi');
        Schema::dropIfExists('materi');
        Schema::dropIfExists('peserta_kursus');
        Schema::dropIfExists('kursus');
        Schema::dropIfExists('role');
    }
};
