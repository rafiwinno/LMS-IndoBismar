<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 50);          // create_user, update_user, delete_user, create_branch, dst.
            $table->string('target_type', 50);     // user, branch
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_label')->nullable(); // nama user/cabang saat aksi dilakukan
            $table->json('changes')->nullable();    // field sebelum & sesudah (untuk update)
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index(['target_type', 'target_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
