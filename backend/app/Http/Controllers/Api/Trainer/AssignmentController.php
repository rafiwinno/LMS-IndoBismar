<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use App\Models\Trainer\Assignment;
use App\Models\Trainer\Course;
use App\Models\Trainer\Submission;

class AssignmentController extends Controller
{
    private function fileUrl(string $path): string
    {
        return URL::temporarySignedRoute('files.serve', now()->addHours(2), ['path' => $path]);
    }

    private function formatAssignment(Assignment $assignment): array
    {
        $data = $assignment->toArray();
        $data['file_url'] = $assignment->file_tugas ? $this->fileUrl($assignment->file_tugas) : null;
        return $data;
    }

    public function index(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignments = Assignment::where('id_kursus', $id)->get();

        return response()->json([
            'message' => 'List tugas',
            'data'    => $assignments->map(fn($a) => $this->formatAssignment($a)),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'      => 'required|integer|exists:kursus,id_kursus',
            'judul_tugas'    => 'required|string|max:200',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'nullable|date|after:now',
            'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
            'file_tugas'     => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $course = Course::findOrFail($request->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filePath = null;
        if ($request->hasFile('file_tugas')) {
            $filePath = $request->file('file_tugas')->store('tugas', 'local');
        }

        $assignment = Assignment::create([
            'id_kursus'      => $request->id_kursus,
            'judul_tugas'    => $request->judul_tugas,
            'deskripsi'      => $request->deskripsi,
            'file_tugas'     => $filePath,
            'deadline'       => $request->deadline,
            'nilai_maksimal' => $request->nilai_maksimal ?? 100,
        ]);

        return response()->json([
            'message' => 'Tugas berhasil dibuat',
            'data'    => $this->formatAssignment($assignment),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        $course = Course::findOrFail($assignment->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'judul_tugas'    => 'sometimes|required|string|max:200',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'sometimes|nullable|date|after:now',
            'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
            'file_tugas'     => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->hasFile('file_tugas')) {
            if ($assignment->file_tugas) {
                Storage::disk('local')->delete($assignment->file_tugas);
            }
            $assignment->file_tugas = $request->file('file_tugas')->store('tugas', 'local');
        }

        $assignment->judul_tugas    = $request->judul_tugas    ?? $assignment->judul_tugas;
        $assignment->deskripsi      = $request->has('deskripsi') ? $request->deskripsi : $assignment->deskripsi;
        $assignment->deadline       = $request->has('deadline')  ? $request->deadline  : $assignment->deadline;
        $assignment->nilai_maksimal = $request->nilai_maksimal ?? $assignment->nilai_maksimal;
        $assignment->save();

        return response()->json([
            'message' => 'Tugas berhasil diupdate',
            'data'    => $this->formatAssignment($assignment),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        $course = Course::findOrFail($assignment->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Submission::where('id_tugas', $assignment->id_tugas)->each(function ($sub) {
            if ($sub->file_tugas) {
                Storage::disk('local')->delete($sub->file_tugas);
            }
            $sub->delete();
        });

        if ($assignment->file_tugas) {
            Storage::disk('local')->delete($assignment->file_tugas);
        }

        $assignment->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus']);
    }
}
