<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// ============================================================
// FILE: database/migrations/xxxx_xx_xx_create_feedback_table.php
// LOKASI: backend/database/migrations/
// ============================================================
// FIX: tabel feedback belum ada di database sama sekali.
// Jalankan: php artisan migrate
// ============================================================

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id('id_feedback');
            $table->unsignedInteger('id_trainer');   // trainer yang memberi feedback
            $table->unsignedInteger('id_peserta');   // peserta yang menerima feedback
            $table->unsignedInteger('id_kursus')->nullable(); // course terkait (opsional)
            $table->text('pesan');
            $table->enum('tipe', ['positif', 'negatif', 'netral'])->default('netral');
            $table->timestamp('dibuat_pada')->useCurrent();

            $table->foreign('id_trainer')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_peserta')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_kursus')->references('id_kursus')->on('kursus')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
