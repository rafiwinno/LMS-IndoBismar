<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Course;

class CourseController extends Controller
{
    // 1. List course MILIK trainer yang login (bukan semua course)
    public function index(Request $request)
    {
        // FIX: filter berdasarkan id_trainer, bukan Course::all()
        $courses = Course::where('id_trainer', $request->user()->id_pengguna)->get();

        return response()->json($courses);
    }

    // 2. Buat course baru
    public function store(Request $request)
    {
        // FIX: tambah validasi
        $request->validate([
            'judul_kursus' => 'required|string|max:200',
            'deskripsi'    => 'nullable|string',
        ]);

        $user = $request->user();

        // FIX: gunakan id_trainer (sesuai kolom di tabel kursus), bukan id_pengguna
        $course = Course::create([
            'id_trainer'   => $user->id_pengguna,
            'id_cabang'    => $user->id_cabang,
            'judul_kursus' => $request->judul_kursus,
            'deskripsi'    => $request->deskripsi,
            'status'       => 'draft',
        ]);

        return response()->json([
            'message' => 'Course berhasil dibuat',
            'data'    => $course,
        ], 201);
    }

    // 3. Detail course (dengan cek kepemilikan)
    public function show(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        // FIX: cek kepemilikan
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($course);
    }

    // 4. Update course (dengan validasi + cek kepemilikan)
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        // FIX: cek kepemilikan
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // FIX: tambah validasi
        $request->validate([
            'judul_kursus' => 'sometimes|required|string|max:200',
            'deskripsi'    => 'nullable|string',
        ]);

        $course->update([
            'judul_kursus' => $request->judul_kursus ?? $course->judul_kursus,
            'deskripsi'    => $request->deskripsi    ?? $course->deskripsi,
        ]);

        return response()->json([
            'message' => 'Course berhasil diupdate',
            'data'    => $course,
        ]);
    }

    // 5. Delete course (dengan cek kepemilikan)
    public function destroy(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        // FIX: cek kepemilikan
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course berhasil dihapus']);
    }

    // 6. Publish course (dengan cek kepemilikan)
    public function publish(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        // FIX: cek kepemilikan
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->update(['status' => 'publish']);

        return response()->json([
            'message' => 'Course berhasil dipublish',
            'data'    => $course,
        ]);
    }
}
