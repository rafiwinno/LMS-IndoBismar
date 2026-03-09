<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\KursusController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\Api\KuisController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LaporanController;

/*
|--------------------------------------------------------------------------
| API Routes - LMS Indo Bismar
|--------------------------------------------------------------------------
*/

// ─── AUTH (Public) ───────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',       [AuthController::class, 'login']);
    Route::post('/login-admin', [AuthController::class, 'loginAdmin']);
    Route::post('/register',    [AuthController::class, 'register']);
});

// ─── Protected Routes ────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ── Dashboard ──────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Peserta (Participants) ──────────────────────────────────────────────
    Route::prefix('peserta')->group(function () {
        Route::get('/',           [PesertaController::class, 'index']);
        Route::post('/',          [PesertaController::class, 'store']);
        Route::get('/{id}',       [PesertaController::class, 'show']);
        Route::put('/{id}',       [PesertaController::class, 'update']);
        Route::delete('/{id}',    [PesertaController::class, 'destroy']);
        Route::patch('/{id}/status', [PesertaController::class, 'updateStatus']);
    });

    // ── Kursus (Courses) ───────────────────────────────────────────────────
    Route::prefix('kursus')->group(function () {
        Route::get('/',           [KursusController::class, 'index']);
        Route::post('/',          [KursusController::class, 'store']);
        Route::get('/{id}',       [KursusController::class, 'show']);
        Route::put('/{id}',       [KursusController::class, 'update']);
        Route::delete('/{id}',    [KursusController::class, 'destroy']);
        Route::patch('/{id}/status', [KursusController::class, 'updateStatus']);
        // Peserta dalam kursus
        Route::get('/{id}/peserta',  [KursusController::class, 'peserta']);
        Route::post('/{id}/enroll',  [KursusController::class, 'enroll']);
    });

    // ── Materi (Materials) ─────────────────────────────────────────────────
    Route::prefix('materi')->group(function () {
        Route::get('/',           [MateriController::class, 'index']);
        Route::post('/',          [MateriController::class, 'store']);
        Route::get('/{id}',       [MateriController::class, 'show']);
        Route::put('/{id}',       [MateriController::class, 'update']);
        Route::delete('/{id}',    [MateriController::class, 'destroy']);
        Route::post('/{id}/progress', [MateriController::class, 'updateProgress']);
    });

    // ── Tugas (Assignments) ────────────────────────────────────────────────
    Route::prefix('tugas')->group(function () {
        Route::get('/',           [TugasController::class, 'index']);
        Route::post('/',          [TugasController::class, 'store']);
        Route::get('/{id}',       [TugasController::class, 'show']);
        Route::put('/{id}',       [TugasController::class, 'update']);
        Route::delete('/{id}',    [TugasController::class, 'destroy']);
        // Pengumpulan tugas
        Route::get('/{id}/submissions',       [TugasController::class, 'submissions']);
        Route::post('/{id}/submit',           [TugasController::class, 'submit']);
        Route::patch('/submissions/{subId}/grade', [TugasController::class, 'grade']);
    });

    // ── Kuis / Ujian (Exams) ───────────────────────────────────────────────
    Route::prefix('kuis')->group(function () {
        Route::get('/',           [KuisController::class, 'index']);
        Route::post('/',          [KuisController::class, 'store']);
        Route::get('/{id}',       [KuisController::class, 'show']);
        Route::put('/{id}',       [KuisController::class, 'update']);
        Route::delete('/{id}',    [KuisController::class, 'destroy']);
        // Attempt kuis
        Route::post('/{id}/start',  [KuisController::class, 'start']);
        Route::post('/{id}/submit', [KuisController::class, 'submitAttempt']);
        Route::get('/{id}/results', [KuisController::class, 'results']);
        Route::patch('/attempts/{attemptId}/grade-essay', [KuisController::class, 'gradeEssay']);
    });

    // ── Trainer ────────────────────────────────────────────────────────────
    Route::prefix('trainer')->group(function () {
        Route::get('/',        [TrainerController::class, 'index']);
        // Jadwal routes MUST be before /{id} to avoid wildcard conflict
        Route::get('/jadwal/all',         [TrainerController::class, 'allJadwal']);
        Route::post('/jadwal',            [TrainerController::class, 'storeJadwal']);
        Route::put('/jadwal/{id}',        [TrainerController::class, 'updateJadwal']);
        Route::delete('/jadwal/{id}',     [TrainerController::class, 'deleteJadwal']);
        // Trainer by ID (wildcard — must come last)
        Route::get('/{id}',    [TrainerController::class, 'show']);
        Route::put('/{id}',    [TrainerController::class, 'update']);
        Route::delete('/{id}', [TrainerController::class, 'destroy']);
        Route::patch('/{id}/status', [TrainerController::class, 'updateStatus']);
    });

    // ── Laporan (Reports) ──────────────────────────────────────────────────
    Route::prefix('laporan')->group(function () {
        Route::get('/dashboard',    [LaporanController::class, 'dashboard']);
        Route::get('/peserta',      [LaporanController::class, 'peserta']);
        Route::get('/kursus',       [LaporanController::class, 'kursus']);
        Route::get('/kuis',         [LaporanController::class, 'kuis']);
        Route::get('/trainer',      [LaporanController::class, 'trainer']);
    });

});
