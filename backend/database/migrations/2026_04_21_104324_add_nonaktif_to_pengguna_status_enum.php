<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN status ENUM('pending','aktif','nonaktif','ditolak') DEFAULT 'aktif'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pengguna MODIFY COLUMN status ENUM('pending','aktif','ditolak') DEFAULT 'pending'");
    }
};
