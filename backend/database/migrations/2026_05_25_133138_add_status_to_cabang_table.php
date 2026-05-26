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
        Schema::table('cabang', function (Blueprint $table) {
            if (!Schema::hasColumn('cabang', 'kode')) {
                $table->string('kode', 20)->nullable()->unique()->after('nama_cabang');
            }
            if (!Schema::hasColumn('cabang', 'telepon')) {
                $table->string('telepon', 20)->nullable()->after('alamat');
            }
            if (!Schema::hasColumn('cabang', 'status')) {
                $table->enum('status', ['aktif', 'nonaktif'])->default('aktif')->after('telepon');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cabang', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('cabang', 'status'))  $cols[] = 'status';
            if (Schema::hasColumn('cabang', 'telepon')) $cols[] = 'telepon';
            if (Schema::hasColumn('cabang', 'kode'))    $cols[] = 'kode';
            if ($cols) $table->dropColumn($cols);
        });
    }
};
