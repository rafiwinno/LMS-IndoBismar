<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('login_logs')) {
            Schema::create('login_logs', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->foreign('user_id')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
                $table->string('ip_address')->nullable();
                $table->timestamp('logged_in_at')->useCurrent();
                $table->timestamp('logged_out_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('login_logs');
    }
};
