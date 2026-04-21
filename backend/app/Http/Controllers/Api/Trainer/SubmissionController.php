<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Submission;
use App\Models\Trainer\Assignment;
use App\Models\Trainer\Course;

class SubmissionController extends Controller
{
    // LIST PENGUMPULAN PER TUGAS
    public function index(Request $request, $assignmentId)
    {
        $assignment = Assignment::findOrFail($assignmentId);
        $course     = Course::findOrFail($assignment->id_kursus);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submissions = Submission::where('id_tugas', $assignmentId)
            ->with('peserta:id_pengguna,nama,email')
            ->get();

        return response()->json(['data' => $submissions]);
    }

    // JUMLAH PENGUMPULAN BELUM DINILAI
    public function pendingCount(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;

        $count = Submission::whereNull('nilai')
            ->whereHas('tugas.course', fn ($q) => $q->where('id_trainer', $trainerId))
            ->count();

        return response()->json(['pending_count' => $count]);
    }

    // BERI NILAI & FEEDBACK
    public function grade(Request $request, $submissionId)
    {
        $submission = Submission::findOrFail($submissionId);
        $assignment = Assignment::findOrFail($submission->id_tugas);
        $course     = Course::findOrFail($assignment->id_kursus);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'nilai'    => 'required|integer|min:0|max:' . $assignment->nilai_maksimal,
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'nilai'    => $request->nilai,
            'feedback' => $request->feedback,
        ]);

        return response()->json([
            'message' => 'Nilai berhasil disimpan',
            'data'    => $submission,
        ]);
    }
}
