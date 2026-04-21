<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        $feedback = Feedback::with(['trainer:id_pengguna,nama', 'kursus:id_kursus,judul_kursus'])
            ->where('id_peserta', $id_pengguna)
            ->orderByDesc('dibuat_pada')
            ->get();

        return response()->json(['data' => $feedback]);
    }
}
