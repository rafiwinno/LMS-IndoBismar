<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tugas', function (Blueprint $table) {
            if (!Schema::hasColumn('tugas', 'file_soal')) {
                $table->string('file_soal')->nullable()->after('deadline');
            }
            if (!Schema::hasColumn('tugas', 'nilai_maksimal')) {
                $table->unsignedSmallInteger('nilai_maksimal')->default(100)->after('file_soal');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tugas', function (Blueprint $table) {
            $table->dropColumn(['file_soal', 'nilai_maksimal']);
        });
    }
};
