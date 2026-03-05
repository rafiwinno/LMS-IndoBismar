<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    // 1. List semua course trainer
    public function index()
    {
        $courses = Course::all();

        return response()->json($courses);
    }

    // 2. Buat course baru
    public function store(Request $request)
    {
        $course = Course::create([
            'id_trainer' => $request->id_trainer,
            'id_cabang' => $request->id_cabang,
            'judul_kursus' => $request->judul_kursus,
            'deskripsi' => $request->deskripsi,
            'status' => 'draft'
        ]);

        return response()->json([
            'message' => 'Course berhasil dibuat',
            'data' => $course
        ]);
    }

    // 3. Detail course
    public function show($id)
    {
        $course = Course::findOrFail($id);

        return response()->json($course);
    }

    // 4. Update course
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $course->update([
            'judul_kursus' => $request->judul_kursus,
            'deskripsi' => $request->deskripsi
        ]);

        return response()->json([
            'message' => 'Course berhasil diupdate',
            'data' => $course
        ]);
    }

    // 5. Delete course
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Course berhasil dihapus'
        ]);
    }

    // 6. Publish course
    public function publish($id)
    {
        $course = Course::findOrFail($id);

        $course->update([
            'status' => 'publish'
        ]);

        return response()->json([
            'message' => 'Course berhasil dipublish',
            'data' => $course
        ]);
    }
}
