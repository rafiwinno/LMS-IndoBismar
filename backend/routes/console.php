<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Hapus notifikasi yang sudah dibaca dan lebih dari 90 hari
Schedule::call(function () {
    $deleted = \App\Models\Notifikasi::where('dibaca', true)
        ->where('dibuat_pada', '<', now()->subDays(90))
        ->delete();

    \Illuminate\Support\Facades\Log::info("Notifikasi cleanup: {$deleted} notifikasi lama dihapus.");
})->daily()
  ->name('cleanup-old-notifications')
  ->withoutOverlapping();

// Hapus OTP yang sudah kedaluwarsa setiap jam
Schedule::call(function () {
    \App\Models\OtpCode::where('expires_at', '<', now())
        ->orWhere('used', true)
        ->delete();
})->hourly()
  ->name('cleanup-expired-otps')
  ->withoutOverlapping();

// Hapus token Sanctum yang sudah expired setiap malam
Schedule::command('sanctum:prune-expired --hours=0')->daily();
