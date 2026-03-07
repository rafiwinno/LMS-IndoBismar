<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\Trainer\MaterialController;
use App\Http\Controllers\Api\User\AuthController;



Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
});



Route::post('/register', [AuthController::class,'register']);

Route::post('/login/peserta', [AuthController::class,'loginPeserta']);

Route::post('/login/staff', [AuthController::class,'loginStaff']);



Route::middleware('auth:sanctum')->prefix('trainer')->group(function () {

    // COURSE
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
    Route::patch('/courses/{id}/publish', [CourseController::class, 'publish']);

    // MATERIAL
    Route::get('/courses/{id}/materials', [MaterialController::class, 'index']);
    Route::post('/materials', [MaterialController::class, 'store']);
    Route::put('/materials/{id}', [MaterialController::class, 'update']);
    Route::delete('/materials/{id}', [MaterialController::class, 'destroy']);


});
