<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Quiz;
use App\Models\Trainer\Question;
use App\Models\Trainer\Choice;
use App\Models\Trainer\Course;
use App\Models\AttemptKuis;
use App\Models\JawabanKuis;
use App\Models\Pertanyaan;

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

        $effectiveWaktuMulai = $request->waktu_mulai ?? $quiz->waktu_mulai;
        $waktuSelesaiRules = ['nullable', 'date'];
        if ($effectiveWaktuMulai) {
            $waktuSelesaiRules[] = 'after:' . $effectiveWaktuMulai;
        }

        $request->validate([
            'judul_kuis'    => 'sometimes|required|string|max:200',
            'waktu_mulai'   => 'nullable|date',
            'waktu_selesai' => $waktuSelesaiRules,
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

    // UPDATE PERTANYAAN
    public function updateQuestion(Request $request, $questionId)
    {
        $question = Question::findOrFail($questionId);
        $quiz     = Quiz::findOrFail($question->id_kuis);
        $course   = Course::findOrFail($quiz->id_kursus);

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

        $question->update([
            'pertanyaan'  => $request->pertanyaan,
            'tipe'        => $request->tipe,
            'bobot_nilai' => $request->bobot_nilai ?? $question->bobot_nilai,
        ]);

        // Ganti pilihan lama dengan yang baru
        $question->pilihan()->delete();
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
            'message' => 'Pertanyaan berhasil diupdate',
            'data'    => $question->load('pilihan'),
        ]);
    }

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

    // HASIL KUIS — daftar attempt peserta beserta jawaban
    public function results(Request $request, $id)
    {
        $quiz   = Quiz::findOrFail($id);
        $course = Course::findOrFail($quiz->id_kursus);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attempts = AttemptKuis::with(['pengguna', 'jawabanKuis.pertanyaan.pilihanJawaban', 'jawabanKuis.pilihan'])
            ->where('id_kuis', $id)
            ->where('status', 'selesai')
            ->get();

        $avgScore = $attempts->avg('skor') ?? 0;

        return response()->json([
            'avg_score'     => round($avgScore, 1),
            'total_peserta' => $attempts->count(),
            'data'          => $attempts->map(fn($a) => [
                'id_attempt'    => $a->id_attempt,
                'peserta'       => $a->pengguna->nama ?? null,
                'skor'          => $a->skor,
                'waktu_mulai'   => $a->waktu_mulai,
                'waktu_selesai' => $a->waktu_selesai,
                'has_essay'     => $a->jawabanKuis->contains(fn($j) => $j->pertanyaan?->tipe === 'essay'),
                'jawaban_essay' => $a->jawabanKuis
                    ->filter(fn($j) => $j->pertanyaan?->tipe === 'essay')
                    ->map(fn($j) => [
                        'id_jawaban'   => $j->id_jawaban,
                        'pertanyaan'   => $j->pertanyaan?->pertanyaan,
                        'bobot_nilai'  => $j->pertanyaan?->bobot_nilai,
                        'jawaban_text' => $j->jawaban_text,
                        'skor'         => $j->skor,
                    ])->values(),
                'jawaban_pg' => $a->jawabanKuis
                    ->filter(fn($j) => $j->pertanyaan?->tipe === 'pilihan_ganda')
                    ->map(fn($j) => [
                        'pertanyaan'      => $j->pertanyaan?->pertanyaan,
                        'bobot_nilai'     => $j->pertanyaan?->bobot_nilai,
                        'jawaban_dipilih' => $j->pilihan?->teks_jawaban,
                        'benar'           => $j->skor > 0 || (bool)($j->pilihan?->benar),
                        'jawaban_benar'   => $j->pertanyaan?->pilihanJawaban->firstWhere('benar', true)?->teks_jawaban,
                    ])->values(),
            ]),
        ]);
    }

    // NILAI ESSAY oleh trainer
    public function gradeEssay(Request $request, $attemptId)
    {
        $request->validate([
            'scores'   => 'required|array',
            'scores.*' => 'required|integer|min:0',
        ]);

        $attempt = AttemptKuis::findOrFail($attemptId);
        $quiz    = Quiz::findOrFail($attempt->id_kuis);
        $course  = Course::findOrFail($quiz->id_kursus);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        foreach ($request->scores as $jawabanId => $skor) {
            $jawaban = JawabanKuis::where('id_jawaban', $jawabanId)
                ->where('id_attempt', $attemptId)
                ->first();

            if ($jawaban) {
                $pertanyaan = Pertanyaan::find($jawaban->id_pertanyaan);
                $maxSkor    = $pertanyaan ? $pertanyaan->bobot_nilai : 100;
                $jawaban->update(['skor' => min($skor, $maxSkor)]);
            }
        }

        $totalSkor = JawabanKuis::where('id_attempt', $attemptId)->sum('skor');
        $attempt->update(['skor' => $totalSkor]);

        return response()->json(['message' => 'Penilaian essay berhasil.', 'skor_total' => $totalSkor]);
    }
}
