<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Soft deletes untuk pengguna (peserta, trainer, admin)
        Schema::table('pengguna', function (Blueprint $table) {
            $table->softDeletes()->after('status');
        });

        // 2. Soft deletes + updated_at untuk kursus (concurrency control)
        Schema::table('kursus', function (Blueprint $table) {
            $table->timestamp('updated_at')->nullable()->after('dibuat_pada');
            $table->softDeletes()->after('updated_at');
        });

        // 3. Audit log: mencatat setiap aksi admin (verifikasi, hapus, ubah status)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 50);           // create, update, delete, approve, reject
            $table->string('entity_type', 100);     // peserta, kursus, trainer, dokumen
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index('user_id');
        });

        // 4. OTP codes untuk MFA login admin (role 1 & 2)
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('code', 64);         // bcrypt-hashed 6-digit OTP
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'used', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('kursus', function (Blueprint $table) {
            $table->dropColumn('updated_at');
            $table->dropSoftDeletes();
        });
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('otp_codes');
    }
};
