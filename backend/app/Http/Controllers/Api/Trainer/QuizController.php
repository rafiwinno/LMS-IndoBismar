<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Quiz;
use App\Models\Trainer\Question;
use App\Models\Trainer\Choice;
use App\Models\Trainer\Course;

class QuizController extends Controller
{
    // LIST KUIS PER COURSE
    public function index(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizzes = Quiz::where('id_kursus', $courseId)
            ->withCount('pertanyaan')
            ->get();

        return response()->json(['data' => $quizzes]);
    }

    // DETAIL KUIS + PERTANYAAN
    public function show(Request $request, $id)
    {
        $quiz = Quiz::with(['pertanyaan.pilihan'])->findOrFail($id);

        $course = Course::findOrFail($quiz->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $quiz]);
    }

    // BUAT KUIS
    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'     => 'required|integer|exists:kursus,id_kursus',
            'judul_kuis'    => 'required|string|max:200',
            'waktu_mulai'   => 'nullable|date',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
        ]);

        $course = Course::findOrFail($request->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quiz = Quiz::create([
            'id_kursus'     => $request->id_kursus,
            'judul_kuis'    => $request->judul_kuis,
            'waktu_mulai'   => $request->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai,
        ]);

        return response()->json([
            'message' => 'Kuis berhasil dibuat',
            'data'    => $quiz,
        ], 201);
    }

    // UPDATE KUIS
    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $course = Course::findOrFail($quiz->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'judul_kuis'    => 'sometimes|required|string|max:200',
            'waktu_mulai'   => 'nullable|date',
            'waktu_selesai' => 'nullable|date',
        ]);

        $quiz->update([
            'judul_kuis'    => $request->judul_kuis    ?? $quiz->judul_kuis,
            'waktu_mulai'   => $request->waktu_mulai   ?? $quiz->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai ?? $quiz->waktu_selesai,
        ]);

        return response()->json(['message' => 'Kuis berhasil diupdate', 'data' => $quiz]);
    }

    // DELETE KUIS
    public function destroy(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $course = Course::findOrFail($quiz->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hapus semua pertanyaan + pilihan terkait
        foreach ($quiz->pertanyaan as $q) {
            $q->pilihan()->delete();
            $q->delete();
        }
        $quiz->delete();

        return response()->json(['message' => 'Kuis berhasil dihapus']);
    }

    // TAMBAH PERTANYAAN KE KUIS
    public function storeQuestion(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);

        $course = Course::findOrFail($quiz->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'pertanyaan'  => 'required|string',
            'tipe'        => 'required|in:pilihan_ganda,essay',
            'bobot_nilai' => 'nullable|integer|min:1',
            'pilihan'     => 'required_if:tipe,pilihan_ganda|array|min:2',
            'pilihan.*.teks_jawaban' => 'required_if:tipe,pilihan_ganda|string',
            'pilihan.*.benar'        => 'required_if:tipe,pilihan_ganda|boolean',
        ]);

        $question = Question::create([
            'id_kuis'     => $quizId,
            'pertanyaan'  => $request->pertanyaan,
            'tipe'        => $request->tipe,
            'bobot_nilai' => $request->bobot_nilai ?? 10,
        ]);

        // Jika pilihan ganda, simpan pilihan jawaban
        if ($request->tipe === 'pilihan_ganda' && $request->pilihan) {
            foreach ($request->pilihan as $p) {
                Choice::create([
                    'id_pertanyaan' => $question->id_pertanyaan,
                    'teks_jawaban'  => $p['teks_jawaban'],
                    'benar'         => $p['benar'] ? 1 : 0,
                ]);
            }
        }

        return response()->json([
            'message' => 'Pertanyaan berhasil ditambahkan',
            'data'    => $question->load('pilihan'),
        ], 201);
    }

    // HAPUS PERTANYAAN
    public function destroyQuestion(Request $request, $questionId)
    {
        $question = Question::findOrFail($questionId);
        $quiz     = Quiz::findOrFail($question->id_kuis);
        $course   = Course::findOrFail($quiz->id_kursus);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->pilihan()->delete();
        $question->delete();

        return response()->json(['message' => 'Pertanyaan berhasil dihapus']);
    }
}
