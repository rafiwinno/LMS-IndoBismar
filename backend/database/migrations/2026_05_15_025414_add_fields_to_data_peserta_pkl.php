<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            $table->string('nisn', 20)->nullable()->after('id_pengguna');
            $table->string('tempat_lahir', 100)->nullable()->after('nisn');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
        });
    }

    public function down(): void
    {
        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            $table->dropColumn(['nisn', 'tempat_lahir', 'tanggal_lahir']);
        });
    }
};
