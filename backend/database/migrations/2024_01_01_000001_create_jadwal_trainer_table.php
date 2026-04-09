<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_trainer', function (Blueprint $table) {
            $table->integer('id_jadwal')->autoIncrement();
            $table->integer('id_trainer')->unsigned()->nullable();
            $table->integer('id_kursus')->unsigned()->nullable();
            $table->date('tanggal');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->string('ruangan', 100)->nullable();
            $table->enum('tipe', ['Online', 'Offline'])->default('Online');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_trainer');
    }
};