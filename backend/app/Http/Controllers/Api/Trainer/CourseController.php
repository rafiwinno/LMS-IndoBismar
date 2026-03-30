<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Trainer\Course;

class CourseController extends Controller
{
    // 1. List course MILIK trainer yang login (bukan semua course)
    public function index(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;
        $courses = Cache::remember("trainer_courses_{$trainerId}", 60, function () use ($trainerId) {
            return Course::where('id_trainer', $trainerId)->get();
        });

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

        Cache::forget("trainer_courses_{$user->id_pengguna}");

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

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");

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

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");
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

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");

        return response()->json([
            'message' => 'Course berhasil dipublish',
            'data'    => $course,
        ]);
    }
}
