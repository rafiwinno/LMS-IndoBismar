<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Assignment;
use App\Models\Trainer\Course;
use Illuminate\Support\Facades\Storage;
class AssignmentController extends Controller
{
    // LIST TUGAS PER COURSE (dengan cek kepemilikan)
    public function index(Request $request, $id)
    {
        // FIX: cek kepemilikan course
        $course = Course::findOrFail($id);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignments = Assignment::where('id_kursus', $id)->get();

        return response()->json([
            'message' => 'List tugas',
            'data'    => $assignments,
        ]);
    }


    // CREATE TUGAS
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

        // FIX: cek kepemilikan course
        $course = Course::findOrFail($request->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filePath = null;
         if ($request->hasFile('file_tugas')) {
        $filePath = $request->file('file_tugas')->store('tugas', 'public');
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
            'data'    => $assignment,
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
        'deadline'       => 'nullable|date|after:now',
        'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
        'file_tugas'     => 'nullable|file|mimes:pdf|max:10240', // tambah ini
    ]);

    // Handle upload file baru
    if ($request->hasFile('file_tugas')) {
        // Hapus file lama jika ada
        if ($assignment->file_tugas) {
            Storage::disk('public')->delete($assignment->file_tugas);
        }
        $assignment->file_tugas = $request->file('file_tugas')->store('tugas', 'public');
    }

    $assignment->judul_tugas    = $request->judul_tugas    ?? $assignment->judul_tugas;
    $assignment->deskripsi      = $request->deskripsi      ?? $assignment->deskripsi;
    $assignment->deadline       = $request->deadline       ?? $assignment->deadline;
    $assignment->nilai_maksimal = $request->nilai_maksimal ?? $assignment->nilai_maksimal;
    $assignment->save();

    return response()->json([
        'message' => 'Tugas berhasil diupdate',
        'data'    => $assignment,
    ]);
}

    // DELETE TUGAS (dengan cek kepemilikan)
    public function destroy(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        // FIX: cek kepemilikan
        $course = Course::findOrFail($assignment->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($assignment->file_tugas) {
            Storage::disk('public')->delete($assignment->file_tugas);
        }

        $assignment->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus']);
    }
}
