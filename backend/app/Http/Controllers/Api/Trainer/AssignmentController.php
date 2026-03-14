<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Assignment;
use App\Models\Trainer\Course;

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
        ]);

        // FIX: cek kepemilikan course
        $course = Course::findOrFail($request->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignment = Assignment::create([
            'id_kursus'      => $request->id_kursus,
            'judul_tugas'    => $request->judul_tugas,
            'deskripsi'      => $request->deskripsi,
            'deadline'       => $request->deadline,
            'nilai_maksimal' => $request->nilai_maksimal ?? 100,
        ]);

        return response()->json([
            'message' => 'Tugas berhasil dibuat',
            'data'    => $assignment,
        ], 201);
    }

    // UPDATE TUGAS (FIX: tambah validasi + cek kepemilikan)
    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        // FIX: cek kepemilikan lewat course
        $course = Course::findOrFail($assignment->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // FIX: validasi yang sebelumnya tidak ada
        $request->validate([
            'judul_tugas'    => 'sometimes|required|string|max:200',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'nullable|date',
            'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
        ]);

        $assignment->update([
            'judul_tugas'    => $request->judul_tugas    ?? $assignment->judul_tugas,
            'deskripsi'      => $request->deskripsi      ?? $assignment->deskripsi,
            'deadline'       => $request->deadline       ?? $assignment->deadline,
            'nilai_maksimal' => $request->nilai_maksimal ?? $assignment->nilai_maksimal,
        ]);

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

        $assignment->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus']);
    }
}
