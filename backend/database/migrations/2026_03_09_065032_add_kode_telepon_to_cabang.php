<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cabang', function (Blueprint $table) {
            if (!Schema::hasColumn('cabang', 'kode')) {
                $table->string('kode', 20)->nullable()->unique()->after('nama_cabang');
            }
            if (!Schema::hasColumn('cabang', 'telepon')) {
                $table->string('telepon', 20)->nullable()->after('alamat');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cabang', function (Blueprint $table) {
            $table->dropColumn(['kode', 'telepon']);
        });
    }
};
