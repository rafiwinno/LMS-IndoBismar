<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create audit_logs and otp_codes (from skipped security_features migration)
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('action', 50);
                $table->string('entity_type', 100);
                $table->unsignedBigInteger('entity_id')->nullable();
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index(['entity_type', 'entity_id']);
                $table->index('user_id');
            });
        }

        if (!Schema::hasTable('otp_codes')) {
            Schema::create('otp_codes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('code', 64);
                $table->timestamp('expires_at');
                $table->boolean('used')->default(false);
                $table->string('ip_address', 45)->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index(['user_id', 'used', 'expires_at']);
            });
        }

        // Re-create notifikasi table (was dropped manually)
        if (!Schema::hasTable('notifikasi')) {
            Schema::create('notifikasi', function (Blueprint $table) {
                $table->id('id_notif');
                $table->integer('id_penerima');
                $table->string('judul');
                $table->text('pesan');
                $table->string('tipe')->default('info');
                $table->integer('id_referensi')->nullable();
                $table->boolean('dibaca')->default(false);
                $table->timestamp('dibuat_pada')->useCurrent();
            });
        }

        // Add missing columns to data_peserta_pkl
        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            if (!Schema::hasColumn('data_peserta_pkl', 'surat_siswa')) {
                $table->string('surat_siswa')->nullable()->after('periode_selesai');
            }
            if (!Schema::hasColumn('data_peserta_pkl', 'surat_ortu')) {
                $table->string('surat_ortu')->nullable()->after('surat_siswa');
            }
            if (!Schema::hasColumn('data_peserta_pkl', 'status_dokumen')) {
                $table->enum('status_dokumen', ['belum_upload', 'menunggu', 'disetujui', 'ditolak'])
                    ->default('belum_upload')->after('surat_ortu');
            }
            if (!Schema::hasColumn('data_peserta_pkl', 'catatan_dokumen')) {
                $table->text('catatan_dokumen')->nullable()->after('status_dokumen');
            }
            if (!Schema::hasColumn('data_peserta_pkl', 'diperiksa_oleh')) {
                $table->unsignedBigInteger('diperiksa_oleh')->nullable()->after('catatan_dokumen');
            }
            if (!Schema::hasColumn('data_peserta_pkl', 'diperiksa_pada')) {
                $table->timestamp('diperiksa_pada')->nullable()->after('diperiksa_oleh');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');

        Schema::table('data_peserta_pkl', function (Blueprint $table) {
            $cols = [];
            foreach (['surat_siswa','surat_ortu','status_dokumen','catatan_dokumen','diperiksa_oleh','diperiksa_pada'] as $col) {
                if (Schema::hasColumn('data_peserta_pkl', $col)) $cols[] = $col;
            }
            if ($cols) $table->dropColumn($cols);
        });
    }
};
