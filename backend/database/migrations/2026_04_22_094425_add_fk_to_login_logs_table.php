<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Hapus orphaned records agar FK tidak gagal
        DB::table('login_logs')
            ->whereNotIn('user_id', DB::table('pengguna')->pluck('id_pengguna'))
            ->delete();

        // id_pengguna bertipe INT, jadi user_id harus INT juga
        DB::statement('ALTER TABLE login_logs MODIFY user_id INT NOT NULL');

        $fkExists = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'login_logs'
              AND COLUMN_NAME = 'user_id'
              AND REFERENCED_TABLE_NAME = 'pengguna'
        "))->isNotEmpty();

        if (!$fkExists) {
            Schema::table('login_logs', function (Blueprint $table) {
                $table->foreign('user_id')
                      ->references('id_pengguna')
                      ->on('pengguna')
                      ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('login_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
