<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Trainer\CourseController;
use App\Http\Controllers\Api\User\AuthController;



Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
});



Route::post('/register', [AuthController::class,'register']);

Route::post('/login/peserta', [AuthController::class,'loginPeserta']);

Route::post('/login/staff', [AuthController::class,'loginStaff']);



Route::prefix('trainer')->group(function () {

    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
    Route::patch('/courses/{id}/publish', [CourseController::class, 'publish']);

});
