<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
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
        $request->validate([
            'judul_kursus'  => 'required|string|max:200',
            'deskripsi'     => 'nullable|string',
            'gambar_kursus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        $gambar = null;
        if ($request->hasFile('gambar_kursus')) {
            $gambar = $request->file('gambar_kursus')->store('kursus', 'public');
        }

        $course = Course::create([
            'id_trainer'    => $user->id_pengguna,
            'id_cabang'     => $user->id_cabang,
            'judul_kursus'  => $request->judul_kursus,
            'deskripsi'     => $request->deskripsi,
            'gambar_kursus' => $gambar,
            'status'        => 'draft',
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

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($course);
    }

    // 4. Update course (dengan validasi + cek kepemilikan)
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'judul_kursus'  => 'sometimes|required|string|max:200',
            'deskripsi'     => 'nullable|string',
            'gambar_kursus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('gambar_kursus')) {
            // Hapus gambar lama
            if ($course->gambar_kursus) {
                Storage::disk('public')->delete($course->gambar_kursus);
            }
            $course->gambar_kursus = $request->file('gambar_kursus')->store('kursus', 'public');
        }

        $course->judul_kursus = $request->judul_kursus ?? $course->judul_kursus;
        $course->deskripsi    = $request->has('deskripsi') ? $request->deskripsi : $course->deskripsi;
        $course->save();

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

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($course->gambar_kursus) {
            Storage::disk('public')->delete($course->gambar_kursus);
        }

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");
        $course->delete();

        return response()->json(['message' => 'Course berhasil dihapus']);
    }

    // 6. Publish course (dengan cek kepemilikan)
    public function publish(Request $request, $id)
    {
        $course = Course::findOrFail($id);

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