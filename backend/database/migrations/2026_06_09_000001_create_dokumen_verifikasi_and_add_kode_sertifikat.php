<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('dokumen_verifikasi')) {
            Schema::create('dokumen_verifikasi', function (Blueprint $table) {
                $table->id('id_dokumen');
                $table->unsignedBigInteger('id_pengguna')->unique();
                $table->string('surat_siswa')->nullable();
                $table->string('surat_orang_tua')->nullable();
                $table->enum('status', ['pending', 'terverifikasi', 'ditolak'])->default('pending');
                $table->timestamp('tanggal_verifikasi')->nullable();
            });
        }

        if (!Schema::hasColumn('penilaian_pkl', 'kode_sertifikat')) {
            Schema::table('penilaian_pkl', function (Blueprint $table) {
                $table->string('kode_sertifikat', 50)->nullable()->after('nilai_akhir');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen_verifikasi');

        if (Schema::hasColumn('penilaian_pkl', 'kode_sertifikat')) {
            Schema::table('penilaian_pkl', function (Blueprint $table) {
                $table->dropColumn('kode_sertifikat');
            });
        }
    }
};
