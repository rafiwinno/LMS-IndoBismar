<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tambah kolom surat ke data_peserta_pkl
        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            $table->string('surat_siswa')->nullable()->after('periode_selesai');
            $table->string('surat_ortu')->nullable()->after('surat_siswa');
            $table->enum('status_dokumen', ['belum_upload', 'menunggu', 'disetujui', 'ditolak'])
                  ->default('belum_upload')->after('surat_ortu');
            $table->text('catatan_dokumen')->nullable()->after('status_dokumen');
            $table->unsignedBigInteger('diperiksa_oleh')->nullable()->after('catatan_dokumen');
            $table->timestamp('diperiksa_pada')->nullable()->after('diperiksa_oleh');
        });

        // Buat tabel notifikasi
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id('id_notif');
            $table->integer('id_penerima');
            $table->string('judul');
            $table->text('pesan');
            $table->string('tipe')->default('info'); // registrasi_baru, dokumen_disetujui, dokumen_ditolak
            $table->integer('id_referensi')->nullable(); // id_pengguna terkait
            $table->boolean('dibaca')->default(false);
            $table->timestamp('dibuat_pada')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');

        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            $table->dropColumn(['surat_siswa', 'surat_ortu', 'status_dokumen', 'catatan_dokumen', 'diperiksa_oleh', 'diperiksa_pada']);
        });
    }
};
