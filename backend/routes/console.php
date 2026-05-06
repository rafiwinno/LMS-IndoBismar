<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Cleanup notifikasi lama ────────────────────────────────────────────────────
// Hapus notifikasi yang sudah dibaca dan lebih dari 90 hari
// Jalankan setiap hari: php artisan schedule:run (via cronjob)
Schedule::call(function () {
    $deleted = \App\Models\Notifikasi::where('dibaca', true)
        ->where('dibuat_pada', '<', now()->subDays(90))
        ->delete();

    \Illuminate\Support\Facades\Log::info("Notifikasi cleanup: {$deleted} notifikasi lama dihapus.");
})->daily()
  ->name('cleanup-old-notifications')
  ->withoutOverlapping();

// ── Cleanup OTP kedaluwarsa ────────────────────────────────────────────────────
Schedule::call(function () {
    \App\Models\OtpCode::where('expires_at', '<', now())
        ->orWhere('used', true)
        ->delete();
})->hourly()
  ->name('cleanup-expired-otps')
  ->withoutOverlapping();
