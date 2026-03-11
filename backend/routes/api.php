<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\Superadmin\DashboardController;
use App\Http\Controllers\Api\Superadmin\UserController;
use App\Http\Controllers\Api\Superadmin\BranchController;

Route::get('/test', function () {
    return response()->json(['message' => 'API working']);
});

// ===== AUTH ROUTES =====
Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login/peserta',  [AuthController::class, 'loginPeserta']);
Route::post('/login/staff',    [AuthController::class, 'loginStaff']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// ===== TRAINER ROUTES =====
Route::middleware('auth:sanctum')->prefix('trainer')->group(function () {
    Route::get('/courses',              [CourseController::class, 'index']);
    Route::post('/courses',             [CourseController::class, 'store']);
    Route::get('/courses/{id}',         [CourseController::class, 'show']);
    Route::put('/courses/{id}',         [CourseController::class, 'update']);
    Route::delete('/courses/{id}',      [CourseController::class, 'destroy']);
    Route::patch('/courses/{id}/publish', [CourseController::class, 'publish']);
});

// ===== SUPERADMIN ROUTES =====
Route::middleware('auth:sanctum')->prefix('superadmin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/login-recap', [DashboardController::class, 'loginRecap']); // NEW

    // User Management
    Route::get('/users',          [UserController::class, 'index']);
    Route::post('/users',         [UserController::class, 'store']);
    Route::put('/users/{id}',     [UserController::class, 'update']);
    Route::delete('/users/{id}',  [UserController::class, 'destroy']);
    Route::get('/branches',       [UserController::class, 'branches']); // dropdown only

    // Branch Management
    Route::get('/cabang',                    [BranchController::class, 'index']);
    Route::post('/cabang',                   [BranchController::class, 'store']);
    Route::put('/cabang/{id}',               [BranchController::class, 'update']);
    Route::delete('/cabang/{id}',            [BranchController::class, 'destroy']);
    Route::get('/cabang/{id}/users',         [BranchController::class, 'users']);   // ← NEW
});
