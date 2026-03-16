<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\Trainer\MaterialController;
use App\Http\Controllers\Api\Trainer\AssignmentController; // FIX: import yang sebelumnya tidak ada
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\Trainer\FeedbackController;
use App\Http\Controllers\Api\Trainer\ProgressController;
use App\Http\Controllers\Api\Trainer\QuizController;
use App\Http\Controllers\Api\Trainer\SubmissionController;

// tambahkan di dalam group prefix('trainer')
Route::get('/feedback',          [FeedbackController::class, 'index']);
Route::post('/feedback',         [FeedbackController::class, 'store']);
Route::get('/peserta/progress',  [ProgressController::class, 'index']);

// TEST
Route::get('/test', function () {
    return response()->json(['message' => 'API working']);
});

// AUTH (public)
Route::post('/register',      [AuthController::class, 'register']);
Route::post('/login/peserta', [AuthController::class, 'loginPeserta']);
Route::post('/login/staff',   [AuthController::class, 'loginStaff']);

// AUTH (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // FIX: tambah logout endpoint

    // ─── TRAINER ROUTES ───────────────────────────────────────
    Route::prefix('trainer')->group(function () {

        // COURSE
        Route::get('/courses',              [CourseController::class, 'index']);
        Route::post('/courses',             [CourseController::class, 'store']);
        Route::get('/courses/{id}',         [CourseController::class, 'show']);
        Route::put('/courses/{id}',         [CourseController::class, 'update']);
        Route::delete('/courses/{id}',      [CourseController::class, 'destroy']);
        Route::patch('/courses/{id}/publish', [CourseController::class, 'publish']);

        // MATERIAL
        Route::get('/courses/{id}/materials', [MaterialController::class, 'index']);
        Route::post('/materials',             [MaterialController::class, 'store']);
        Route::put('/materials/{id}',         [MaterialController::class, 'update']);
        Route::delete('/materials/{id}',      [MaterialController::class, 'destroy']);

        // ASSIGNMENT — FIX: sebelumnya route ini TIDAK ADA sama sekali!
        Route::get('/courses/{id}/assignments', [AssignmentController::class, 'index']);
        Route::post('/assignments',             [AssignmentController::class, 'store']);
        Route::put('/assignments/{id}',         [AssignmentController::class, 'update']);
        Route::delete('/assignments/{id}',      [AssignmentController::class, 'destroy']);

        Route::get('/feedback',          [FeedbackController::class, 'index']);
        Route::post('/feedback',         [FeedbackController::class, 'store']);
        Route::get('/peserta/progress',  [ProgressController::class, 'index']);

        // Tambah di dalam group prefix('trainer')
        Route::get('/peserta', function (Illuminate\Http\Request $request) {
            $peserta = \App\Models\User::where('id_role', 4)
                ->where('id_cabang', $request->user()->id_cabang)
                ->select('id_pengguna', 'nama', 'email')
                ->get();
            return response()->json(['data' => $peserta]);
        });

        Route::get('/courses/{id}/quizzes',          [QuizController::class, 'index']);
        Route::post('/quizzes',                      [QuizController::class, 'store']);
        Route::get('/quizzes/{id}',                  [QuizController::class, 'show']);
        Route::put('/quizzes/{id}',                  [QuizController::class, 'update']);
        Route::delete('/quizzes/{id}',               [QuizController::class, 'destroy']);
        Route::post('/quizzes/{id}/questions',       [QuizController::class, 'storeQuestion']);
        Route::delete('/questions/{id}',             [QuizController::class, 'destroyQuestion']);

        Route::get('/assignments/{id}/submissions',  [SubmissionController::class, 'index']);
        Route::put('/submissions/{id}/grade',        [SubmissionController::class, 'grade']);


    });
});
