<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // kursus.id_trainer — dipakai di semua query trainer
        if (Schema::hasTable('kursus') && !$this->indexExists('kursus', 'kursus_id_trainer_index')) {
            Schema::table('kursus', function (Blueprint $table) {
                $table->index('id_trainer', 'kursus_id_trainer_index');
            });
        }

        // peserta_kursus — JOIN id_kursus dan id_pengguna
        if (Schema::hasTable('peserta_kursus')) {
            if (!$this->indexExists('peserta_kursus', 'pk_id_kursus_index')) {
                Schema::table('peserta_kursus', function (Blueprint $table) {
                    $table->index('id_kursus', 'pk_id_kursus_index');
                });
            }
            if (!$this->indexExists('peserta_kursus', 'pk_id_pengguna_index')) {
                Schema::table('peserta_kursus', function (Blueprint $table) {
                    $table->index('id_pengguna', 'pk_id_pengguna_index');
                });
            }
        }

        // materi.id_kursus — LEFT JOIN di query progress
        if (Schema::hasTable('materi') && !$this->indexExists('materi', 'materi_id_kursus_index')) {
            Schema::table('materi', function (Blueprint $table) {
                $table->index('id_kursus', 'materi_id_kursus_index');
            });
        }

        // progress_materi — composite index untuk JOIN
        if (Schema::hasTable('progress_materi') && !$this->indexExists('progress_materi', 'pm_pengguna_materi_index')) {
            Schema::table('progress_materi', function (Blueprint $table) {
                $table->index(['id_pengguna', 'id_materi', 'status'], 'pm_pengguna_materi_index');
            });
        }

        // tugas.id_kursus — JOIN di query notifikasi
        if (Schema::hasTable('tugas') && !$this->indexExists('tugas', 'tugas_id_kursus_index')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->index('id_kursus', 'tugas_id_kursus_index');
            });
        }

        // pengumpulan_tugas — tanggal_kumpul untuk ORDER BY, id_tugas untuk JOIN
        if (Schema::hasTable('pengumpulan_tugas')) {
            if (!$this->indexExists('pengumpulan_tugas', 'pt_id_tugas_index')) {
                Schema::table('pengumpulan_tugas', function (Blueprint $table) {
                    $table->index('id_tugas', 'pt_id_tugas_index');
                });
            }
            if (!$this->indexExists('pengumpulan_tugas', 'pt_tanggal_index')) {
                Schema::table('pengumpulan_tugas', function (Blueprint $table) {
                    $table->index('tanggal_kumpul', 'pt_tanggal_index');
                });
            }
        }
    }

    public function down(): void
    {
        $indexes = [
            'kursus'             => 'kursus_id_trainer_index',
            'peserta_kursus'     => ['pk_id_kursus_index', 'pk_id_pengguna_index'],
            'materi'             => 'materi_id_kursus_index',
            'progress_materi'    => 'pm_pengguna_materi_index',
            'tugas'              => 'tugas_id_kursus_index',
            'pengumpulan_tugas'  => ['pt_id_tugas_index', 'pt_tanggal_index'],
        ];

        foreach ($indexes as $table => $idx) {
            if (!Schema::hasTable($table)) continue;
            Schema::table($table, function (Blueprint $t) use ($idx) {
                foreach ((array) $idx as $i) {
                    try { $t->dropIndex($i); } catch (\Exception $e) {}
                }
            });
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        try {
            $indexes = \DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$index]);
            return count($indexes) > 0;
        } catch (\Exception $e) {
            return false;
        }
    }
};