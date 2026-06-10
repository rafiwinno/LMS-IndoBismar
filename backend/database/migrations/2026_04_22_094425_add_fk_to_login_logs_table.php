<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    public function up(): void
    {
        // Cek apakah FK sudah ada
        $fkExists = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'login_logs'
              AND COLUMN_NAME = 'user_id'
              AND REFERENCED_TABLE_NAME = 'pengguna'
        "))->isNotEmpty();

        if ($fkExists) {
            return;
        }

        // Hapus orphaned records (termasuk NULL)
        DB::table('login_logs')
            ->whereNull('user_id')
            ->orWhereNotIn('user_id', DB::table('pengguna')->pluck('id_pengguna'))
            ->delete();

        // Drop index sisa jika ada (sering tertinggal setelah drop FK)
        $indexExists = collect(DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'login_logs'
              AND INDEX_NAME = 'login_logs_user_id_foreign'
        "))->isNotEmpty();

        if ($indexExists) {
            DB::statement('DROP INDEX login_logs_user_id_foreign ON login_logs');
        }

        // Sesuaikan tipe user_id dengan pengguna.id_pengguna (INT)
        DB::statement('ALTER TABLE login_logs MODIFY user_id INT NOT NULL');

        // Tambah FK — bungkus try/catch agar tidak memblokir migration lain
        try {
            Schema::table('login_logs', function (Blueprint $table) {
                $table->foreign('user_id')
                      ->references('id_pengguna')
                      ->on('pengguna')
                      ->onDelete('cascade');
            });
        } catch (\Throwable $e) {
            // FK tidak kritis untuk fungsi aplikasi, lanjutkan migrate
            \Illuminate\Support\Facades\Log::warning(
                'Gagal menambahkan FK login_logs.user_id: ' . $e->getMessage()
            );
        }
    }

    public function down(): void
    {
        $fkExists = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'login_logs'
              AND COLUMN_NAME = 'user_id'
              AND REFERENCED_TABLE_NAME = 'pengguna'
        "))->isNotEmpty();

        if ($fkExists) {
            Schema::table('login_logs', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }
    }
};
