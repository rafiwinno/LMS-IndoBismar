<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\DashboardController;
use App\Http\Controllers\Api\User\KursusController;
use App\Http\Controllers\Api\User\KuisController;
use App\Http\Controllers\Api\User\NilaiController;
use App\Http\Controllers\Api\User\ProfileController;
use App\Http\Controllers\Api\User\DocumentController;
use App\Http\Controllers\Api\User\TugasController;
use App\Http\Controllers\Api\User\NotifikasiController;


// ===== AUTH =====
Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login/peserta',  [AuthController::class, 'loginPeserta'])->middleware('throttle:5,1');
Route::post('/login/staff',    [AuthController::class, 'loginStaff'])->middleware('throttle:5,1');
Route::post('/logout',         [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ===== USER / PESERTA =====
Route::middleware(['auth:sanctum', 'role:4'])->prefix('user')->group(function () {

    // Dashboard
    Route::get('/dashboard',   [DashboardController::class, 'stats']);

    // Dokumen
    Route::get('/dokumen', [DocumentController::class, 'index']);
    Route::post('/dokumen/{jenis}', [DocumentController::class, 'upload']);

    // Kursus
    Route::get('/kursus',                          [KursusController::class, 'index']);
    Route::get('/kursus/{id_kursus}',              [KursusController::class, 'show']);
    Route::post('/kursus/{id_kursus}/materi/{id_materi}/progress', [KursusController::class, 'markProgress']);

    // Kuis
    Route::get('/kuis',                            [KuisController::class, 'index']);
    Route::get('/kuis/{id_kuis}',                  [KuisController::class, 'show']);
    Route::post('/kuis/{id_kuis}/mulai',           [KuisController::class, 'mulai']);
    Route::post('/kuis/{id_kuis}/kerjakan',        [KuisController::class, 'kerjakan']);

    // Tugas
    Route::get('/tugas',                        [TugasController::class, 'index']);
    Route::get('/tugas/{id_tugas}',             [TugasController::class, 'show']);
    Route::post('/tugas/{id_tugas}/kumpul',     [TugasController::class, 'kumpul']);

    // Nilai & Progress
    Route::get('/nilai',               [NilaiController::class, 'index']);

    // Profil
    Route::get('/profil',              [ProfileController::class, 'show']);
    Route::put('/profil',              [ProfileController::class, 'update']);

    // Notifikasi
    Route::get('/notifikasi',                        [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/baca-semua',           [NotifikasiController::class, 'bacaSemua']);
    Route::patch('/notifikasi/{id}/baca',            [NotifikasiController::class, 'baca']);
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