<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Expand enum to allow all values temporarily
        DB::statement("ALTER TABLE `kursus` MODIFY COLUMN `status` ENUM('draft','aktif','nonaktif','publish') NOT NULL DEFAULT 'draft'");

        // Step 2: Migrate existing 'publish' values to 'aktif'
        DB::statement("UPDATE `kursus` SET `status` = 'aktif' WHERE `status` = 'publish'");

        // Step 3: Remove 'publish' from enum
        DB::statement("ALTER TABLE `kursus` MODIFY COLUMN `status` ENUM('draft','aktif','nonaktif') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `kursus` MODIFY COLUMN `status` ENUM('draft','aktif','nonaktif','publish') NOT NULL DEFAULT 'draft'");
        DB::statement("UPDATE `kursus` SET `status` = 'publish' WHERE `status` = 'aktif'");
        DB::statement("ALTER TABLE `kursus` MODIFY COLUMN `status` ENUM('draft','publish') NOT NULL DEFAULT 'draft'");
    }
};
