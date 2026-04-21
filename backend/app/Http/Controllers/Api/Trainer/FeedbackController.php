<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Feedback;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $feedbacks = Feedback::where('id_trainer', $request->user()->id_pengguna)
        ->with(['peserta:id_pengguna,nama', 'kursus:id_kursus,judul_kursus'])
        ->orderByDesc('dibuat_pada')
        ->get();

        return response()->json(['data' => $feedbacks]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_peserta' => 'required|integer|exists:pengguna,id_pengguna',
            'pesan'      => 'required|string',
            'tipe'       => 'required|in:positif,negatif,netral',
            'id_kursus'  => 'nullable|integer|exists:kursus,id_kursus',
        ]);

        $feedback = Feedback::create([
            'id_trainer' => $request->user()->id_pengguna,
            'id_peserta' => $request->id_peserta,
            'id_kursus'  => $request->id_kursus,
            'pesan'      => $request->pesan,
            'tipe'       => $request->tipe,
        ]);

        return response()->json([
            'message' => 'Feedback berhasil dikirim',
            'data'    => $feedback,
        ], 201);
    }
}
