<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\DashboardController;
use App\Http\Controllers\Api\User\KursusController;
use App\Http\Controllers\Api\User\KuisController;
use App\Http\Controllers\Api\User\NilaiController;
use App\Http\Controllers\Api\User\ProfileController;

// Test API
Route::get('/test', function () {
    return response()->json(['message' => 'API working']);
});

// ===== AUTH =====
Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login/peserta',  [AuthController::class, 'loginPeserta']);
Route::post('/login/staff',    [AuthController::class, 'loginStaff']);

// ===== USER / PESERTA =====
// Semua route di sini butuh id_pengguna dikirim di body/query
Route::prefix('user')->group(function () {

    // Dashboard
    Route::get('/dashboard',   [DashboardController::class, 'stats']);

    // Kursus
    Route::get('/kursus',                          [KursusController::class, 'index']);
    Route::get('/kursus/{id_kursus}',              [KursusController::class, 'show']);

    // Kuis
    Route::get('/kuis',                            [KuisController::class, 'index']);
    Route::get('/kuis/{id_kuis}',                  [KuisController::class, 'show']);
    Route::post('/kuis/{id_kuis}/kerjakan',        [KuisController::class, 'kerjakan']);

    // Nilai & Progress
    Route::get('/nilai',               [NilaiController::class, 'index']);

    // Profil
    Route::get('/profil',              [ProfileController::class, 'show']);
    Route::put('/profil',              [ProfileController::class, 'update']);
});

// ===== TRAINER =====
Route::prefix('trainer')->group(function () {
    Route::get('/courses',              [CourseController::class, 'index']);
    Route::post('/courses',             [CourseController::class, 'store']);
    Route::get('/courses/{id}',         [CourseController::class, 'show']);
    Route::put('/courses/{id}',         [CourseController::class, 'update']);
    Route::delete('/courses/{id}',      [CourseController::class, 'destroy']);
    Route::patch('/courses/{id}/publish', [CourseController::class, 'publish']);
});