<?php

use Illuminate\Support\Facades\Route;

// ── User / Peserta Controllers ────────────────────────────────────────────────
use App\Http\Controllers\Api\User\AuthController     as UserAuthController;
use App\Http\Controllers\Api\User\DashboardController as UserDashboardController;
use App\Http\Controllers\Api\User\KursusController   as UserKursusController;
use App\Http\Controllers\Api\User\KuisController     as UserKuisController;
use App\Http\Controllers\Api\User\NilaiController    as UserNilaiController;
use App\Http\Controllers\Api\User\ProfileController  as UserProfileController;
use App\Http\Controllers\Api\User\DocumentController as UserDocumentController;
use App\Http\Controllers\Api\User\FeedbackController as UserFeedbackController;

// ── Admin Controllers ─────────────────────────────────────────────────────────
use App\Http\Controllers\Api\Admin\AuthController        as AdminAuthController;
use App\Http\Controllers\Api\Admin\DashboardController   as AdminDashboardController;
use App\Http\Controllers\Api\Admin\PesertaController     as AdminPesertaController;
use App\Http\Controllers\Api\Admin\KursusController      as AdminKursusController;
use App\Http\Controllers\Api\Admin\MateriController      as AdminMateriController;
use App\Http\Controllers\Api\Admin\TugasController       as AdminTugasController;
use App\Http\Controllers\Api\Admin\KuisController        as AdminKuisController;
use App\Http\Controllers\Api\Admin\TrainerController     as AdminTrainerController;
use App\Http\Controllers\Api\Admin\LaporanController     as AdminLaporanController;
use App\Http\Controllers\Api\Admin\NotifikasiController  as AdminNotifikasiController;

// ── Trainer Controllers ───────────────────────────────────────────────────────
use App\Http\Controllers\Api\Trainer\CourseController      as TrainerCourseController;
use App\Http\Controllers\Api\Trainer\AssignmentController  as TrainerAssignmentController;
use App\Http\Controllers\Api\Trainer\SubmissionController  as TrainerSubmissionController;
use App\Http\Controllers\Api\Trainer\QuizController        as TrainerQuizController;
use App\Http\Controllers\Api\Trainer\MaterialController    as TrainerMaterialController;
use App\Http\Controllers\Api\Trainer\FeedbackController        as TrainerFeedbackController;
use App\Http\Controllers\Api\Trainer\ProgressController        as TrainerProgressController;
use App\Http\Controllers\Api\Trainer\NotificationController    as TrainerNotificationController;

// ── Superadmin Controllers ────────────────────────────────────────────────────
use App\Http\Controllers\Api\Superadmin\DashboardController as SuperDashboardController;
use App\Http\Controllers\Api\Superadmin\BranchController    as SuperBranchController;
use App\Http\Controllers\Api\Superadmin\UserController      as SuperUserController;

// ── Test ──────────────────────────────────────────────────────────────────────
Route::get('/test', fn() => response()->json(['message' => 'API working']));

// =============================================================================
// AUTH — Guest routes
// =============================================================================

// Peserta login/register (used by student portal)
Route::post('/register',      [UserAuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login/peserta', [UserAuthController::class, 'loginPeserta'])->middleware('throttle:5,1');
Route::post('/login/staff',   [UserAuthController::class, 'loginStaff'])->middleware('throttle:5,1');

// Admin/Trainer/Superadmin login (used by admin portal via api.ts)
Route::post('/auth/login',       [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/auth/login-admin', [AdminAuthController::class, 'loginAdmin'])->middleware('throttle:5,1');
Route::post('/auth/register',    [AdminAuthController::class, 'register'])->middleware('throttle:10,1');

// =============================================================================
// AUTHENTICATED ROUTES
// =============================================================================
Route::middleware('auth:sanctum')->group(function () {

    // ── Shared auth ──────────────────────────────────────────────────────────
    Route::post('/logout',      [UserAuthController::class, 'logout']);
    Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
    Route::get('/auth/me',      [AdminAuthController::class, 'me']);

    // =========================================================================
    // SUPERADMIN PORTAL
    // =========================================================================
    Route::prefix('superadmin')->middleware('admin:1')->group(function () {
        Route::get('/dashboard',            [SuperDashboardController::class, 'index']);
        Route::get('/dashboard/login-recap',[SuperDashboardController::class, 'loginRecap']);

        Route::get('/cabang',               [SuperBranchController::class, 'index']);
        Route::post('/cabang',              [SuperBranchController::class, 'store']);
        Route::put('/cabang/{id}',          [SuperBranchController::class, 'update']);
        Route::delete('/cabang/{id}',       [SuperBranchController::class, 'destroy']);
        Route::get('/cabang/{id}/users',    [SuperBranchController::class, 'users']);

        // alias /branches untuk frontend yang pakai endpoint ini
        Route::get('/branches',             [SuperBranchController::class, 'index']);

        Route::get('/users',                [SuperUserController::class, 'index']);
        Route::post('/users',               [SuperUserController::class, 'store']);
        Route::put('/users/{id}',           [SuperUserController::class, 'update']);
        Route::delete('/users/{id}',        [SuperUserController::class, 'destroy']);
    });

    // =========================================================================
    // USER / PESERTA PORTAL
    // =========================================================================
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [UserDashboardController::class, 'stats']);

        Route::get('/dokumen',           [UserDocumentController::class, 'index']);
        Route::post('/dokumen/{jenis}',  [UserDocumentController::class, 'upload']);

        Route::get('/kursus',            [UserKursusController::class, 'index']);
        Route::get('/kursus/{id_kursus}',[UserKursusController::class, 'show']);
        Route::post('/kursus/{id_kursus}/materi/{id_materi}/progress',
                                         [UserKursusController::class, 'markProgress']);

        Route::get('/kuis',              [UserKuisController::class, 'index']);
        Route::get('/kuis/{id_kuis}',    [UserKuisController::class, 'show']);
        Route::post('/kuis/{id_kuis}/kerjakan', [UserKuisController::class, 'kerjakan']);

        Route::get('/nilai',             [UserNilaiController::class, 'index']);

        // Tugas peserta
        Route::get('/tugas',                        [\App\Http\Controllers\Api\User\TugasController::class, 'index']);
        Route::get('/tugas/{id_tugas}',             [\App\Http\Controllers\Api\User\TugasController::class, 'show']);
        Route::post('/tugas/{id_tugas}/kumpul',     [\App\Http\Controllers\Api\User\TugasController::class, 'kumpul']);

        Route::get('/feedback',          [UserFeedbackController::class, 'index']);

        Route::get('/profil',            [UserProfileController::class, 'show']);
        Route::put('/profil',            [UserProfileController::class, 'update']);
    });

    // =========================================================================
    // ADMIN / TRAINER / SUPERADMIN PORTAL
    // =========================================================================

    // ── Route khusus admin & superadmin (role 1 & 2) ─────────────────────────
    Route::middleware('admin:1,2')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Peserta
        Route::get('/peserta',               [AdminPesertaController::class, 'index']);
        Route::post('/peserta',              [AdminPesertaController::class, 'store']);
        Route::get('/peserta/{id}',          [AdminPesertaController::class, 'show']);
        Route::put('/peserta/{id}',          [AdminPesertaController::class, 'update']);
        Route::delete('/peserta/{id}',       [AdminPesertaController::class, 'destroy']);
        Route::patch('/peserta/{id}/status', [AdminPesertaController::class, 'updateStatus']);
        Route::patch('/peserta/{id}/verifikasi-dokumen', [AdminPesertaController::class, 'verifikasiDokumen']);
        Route::post('/peserta/saya/dokumen', [AdminPesertaController::class, 'uploadDokumen']);

        // Kursus (admin)
        Route::get('/kursus',                                     [AdminKursusController::class, 'index']);
        Route::post('/kursus',                                    [AdminKursusController::class, 'store']);
        Route::put('/kursus/{id}',                                [AdminKursusController::class, 'update']);
        Route::delete('/kursus/{id}',                             [AdminKursusController::class, 'destroy']);
        Route::patch('/kursus/{id}/status',                       [AdminKursusController::class, 'updateStatus']);
        Route::get('/kursus/{id}/peserta',                        [AdminKursusController::class, 'peserta']);
        Route::post('/kursus/{id}/enroll',                        [AdminKursusController::class, 'enroll']);
        Route::delete('/kursus/{id}/peserta/{id_pengguna}',       [AdminKursusController::class, 'unenroll']);
        Route::get('/kursus/{id}',                                [AdminKursusController::class, 'show']);

        // Materi
        Route::get('/materi',         [AdminMateriController::class, 'index']);
        Route::post('/materi',        [AdminMateriController::class, 'store']);
        Route::get('/materi/{id}',    [AdminMateriController::class, 'show']);
        Route::put('/materi/{id}',    [AdminMateriController::class, 'update']);
        Route::delete('/materi/{id}', [AdminMateriController::class, 'destroy']);

        // Tugas
        Route::get('/tugas',                              [AdminTugasController::class, 'index']);
        Route::post('/tugas',                             [AdminTugasController::class, 'store']);
        Route::put('/tugas/{id}',                         [AdminTugasController::class, 'update']);
        Route::delete('/tugas/{id}',                      [AdminTugasController::class, 'destroy']);
        Route::get('/tugas/{id}/submissions',             [AdminTugasController::class, 'submissions']);
        Route::patch('/tugas/submissions/{subId}/grade',  [AdminTugasController::class, 'grade']);

        // Kuis (admin)
        Route::get('/kuis',                                     [AdminKuisController::class, 'index']);
        Route::post('/kuis',                                    [AdminKuisController::class, 'store']);
        Route::get('/kuis/{id}',                                [AdminKuisController::class, 'show']);
        Route::put('/kuis/{id}',                                [AdminKuisController::class, 'update']);
        Route::delete('/kuis/{id}',                             [AdminKuisController::class, 'destroy']);
        Route::get('/kuis/{id}/results',                        [AdminKuisController::class, 'results']);
        Route::patch('/kuis/attempts/{attemptId}/grade-essay',  [AdminKuisController::class, 'gradeEssay']);

        // Laporan
        Route::get('/laporan/dashboard', [AdminLaporanController::class, 'dashboard']);
        Route::get('/laporan/peserta',   [AdminLaporanController::class, 'peserta']);
        Route::get('/laporan/kursus',    [AdminLaporanController::class, 'kursus']);
        Route::get('/laporan/kuis',      [AdminLaporanController::class, 'kuis']);
        Route::get('/laporan/trainer',   [AdminLaporanController::class, 'trainer']);

        // Notifikasi
        Route::get('/notifikasi',                      [AdminNotifikasiController::class, 'index']);
        Route::patch('/notifikasi/baca-semua',         [AdminNotifikasiController::class, 'markAllRead']);
        Route::patch('/notifikasi/{id}/baca',          [AdminNotifikasiController::class, 'markRead']);

        // Trainer management (admin CRUD)
        Route::get('/trainer',               [AdminTrainerController::class, 'index']);
        Route::post('/trainer',              [AdminTrainerController::class, 'store']);
        Route::get('/trainer/{id}',          [AdminTrainerController::class, 'show']);
        Route::put('/trainer/{id}',          [AdminTrainerController::class, 'update']);
        Route::delete('/trainer/{id}',       [AdminTrainerController::class, 'destroy']);
        Route::patch('/trainer/{id}/status', [AdminTrainerController::class, 'updateStatus']);

        // Jadwal trainer
        Route::get('/trainer/jadwal/all',     [AdminTrainerController::class, 'allJadwal']);
        Route::post('/trainer/jadwal',        [AdminTrainerController::class, 'storeJadwal']);
        Route::put('/trainer/jadwal/{id}',    [AdminTrainerController::class, 'updateJadwal']);
        Route::delete('/trainer/jadwal/{id}', [AdminTrainerController::class, 'deleteJadwal']);

    }); // end admin:1,2

    // ── Trainer Portal (trainer's own portal) ─────────────────────────────────
    Route::middleware('admin:3')->group(function () {

        // Courses
        Route::get('/trainer/courses',                              [TrainerCourseController::class, 'index']);
        Route::post('/trainer/courses',                             [TrainerCourseController::class, 'store']);
        Route::get('/trainer/courses/{id}',                         [TrainerCourseController::class, 'show']);
        Route::put('/trainer/courses/{id}',                         [TrainerCourseController::class, 'update']);
        Route::delete('/trainer/courses/{id}',                      [TrainerCourseController::class, 'destroy']);
        Route::patch('/trainer/courses/{id}/publish',               [TrainerCourseController::class, 'publish']);
        Route::get('/trainer/courses/{id}/peserta',                 [TrainerCourseController::class, 'peserta']);
        Route::post('/trainer/courses/{id}/enroll',                 [TrainerCourseController::class, 'enroll']);
        Route::delete('/trainer/courses/{id}/peserta/{id_pengguna}',[TrainerCourseController::class, 'unenroll']);

        // Assignments (nested under course)
        Route::get('/trainer/courses/{id}/assignments',  [TrainerAssignmentController::class, 'index']);
        Route::post('/trainer/assignments',              [TrainerAssignmentController::class, 'store']);
        Route::put('/trainer/assignments/{id}',          [TrainerAssignmentController::class, 'update']);
        Route::delete('/trainer/assignments/{id}',       [TrainerAssignmentController::class, 'destroy']);

        // Submissions (trainer grades student submissions)
        Route::get('/trainer/assignments/{id}/submissions', [TrainerSubmissionController::class, 'index']);
        Route::put('/trainer/submissions/{id}/grade',       [TrainerSubmissionController::class, 'grade']);

        // Quizzes (nested under course)
        Route::get('/trainer/courses/{id}/quizzes',   [TrainerQuizController::class, 'index']);
        Route::post('/trainer/quizzes',               [TrainerQuizController::class, 'store']);
        Route::get('/trainer/quizzes/{id}',           [TrainerQuizController::class, 'show']);
        Route::put('/trainer/quizzes/{id}',           [TrainerQuizController::class, 'update']);
        Route::delete('/trainer/quizzes/{id}',        [TrainerQuizController::class, 'destroy']);
        Route::post('/trainer/quizzes/{id}/questions',[TrainerQuizController::class, 'storeQuestion']);
        Route::delete('/trainer/questions/{id}',      [TrainerQuizController::class, 'destroyQuestion']);

        // Materials (nested under course)
        Route::get('/trainer/courses/{id}/materials', [TrainerMaterialController::class, 'index']);
        Route::post('/trainer/materials',             [TrainerMaterialController::class, 'store']);
        Route::put('/trainer/materials/{id}',         [TrainerMaterialController::class, 'update']);
        Route::delete('/trainer/materials/{id}',      [TrainerMaterialController::class, 'destroy']);

        // Progress peserta
        Route::get('/trainer/peserta/progress',       [TrainerProgressController::class, 'index']);
        Route::get('/trainer/peserta/semua',          [TrainerProgressController::class, 'allPesertaCabang']);

        // Notifications
        Route::get('/trainer/notifications',          [TrainerNotificationController::class, 'index']);

        // Feedback
        Route::get('/trainer/feedback',               [TrainerFeedbackController::class, 'index']);
        Route::post('/trainer/feedback',              [TrainerFeedbackController::class, 'store']);

    }); // end admin:3

});

