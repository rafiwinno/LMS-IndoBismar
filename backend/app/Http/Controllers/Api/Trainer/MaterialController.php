<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Material;
use App\Models\Trainer\Course;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    // LIST MATERI PER COURSE (dengan cek kepemilikan course)
    public function index(Request $request, $courseId)
    {
        // FIX: pastikan course milik trainer yang login
        $course = Course::findOrFail($courseId);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $materials = Material::where('id_kursus', $courseId)
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'message' => 'List materi',
            'data'    => $materials,
        ]);
    }

    // CREATE MATERI
    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'    => 'required|integer|exists:kursus,id_kursus',
            'judul_materi' => 'required|string|max:200',
            'tipe_materi'  => 'required|in:video,pdf,dokumen',
            'urutan'       => 'nullable|integer|min:1',
        ]);

        // FIX: cek kepemilikan course
        $course = Course::findOrFail($request->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->tipe_materi === 'video') {
            $request->validate([
                'link_video' => 'required|url',
            ]);
            $fileMateri = $request->link_video;
        } else {
            $request->validate([
                'file_materi' => 'required|file|mimes:pdf,doc,docx|max:10240',
            ]);
            $fileMateri = $request->file('file_materi')->store('materi', 'public');
        }

        $material = Material::create([
            'id_kursus'    => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi'  => $request->tipe_materi,
            'file_materi'  => $fileMateri,
            'urutan'       => $request->urutan ?? 1,
        ]);

        return response()->json([
            'message' => 'Materi berhasil dibuat',
            'data'    => $material,
        ], 201);
    }

    // UPDATE MATERI (dengan validasi + hapus file lama)
    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        // FIX: cek kepemilikan lewat course
        $course = Course::findOrFail($material->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // FIX: tambah validasi
        $request->validate([
            'judul_materi' => 'sometimes|required|string|max:200',
            'tipe_materi'  => 'sometimes|required|in:video,pdf,dokumen',
            'urutan'       => 'nullable|integer|min:1',
            'link_video'   => 'sometimes|nullable|url',
            'file_materi'  => 'sometimes|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // FIX: hapus file lama jika ada file baru yang diupload
        if ($request->hasFile('file_materi')) {
            if ($material->file_materi && !filter_var($material->file_materi, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($material->file_materi);
            }
            $fileMateri = $request->file('file_materi')->store('materi', 'public');
            $material->file_materi = $fileMateri;
        } elseif ($request->filled('link_video')) {
            $material->file_materi = $request->link_video;
        }

        $material->judul_materi = $request->judul_materi ?? $material->judul_materi;
        $material->tipe_materi  = $request->tipe_materi  ?? $material->tipe_materi;
        $material->urutan       = $request->urutan       ?? $material->urutan;
        $material->save();

        return response()->json([
            'message' => 'Materi berhasil diupdate',
            'data'    => $material,
        ]);
    }

    // DELETE MATERI (dengan hapus file + cek kepemilikan)
    public function destroy(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        // FIX: cek kepemilikan
        $course = Course::findOrFail($material->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // FIX: hapus file dari storage saat delete
        if ($material->file_materi && !filter_var($material->file_materi, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($material->file_materi);
        }

        $material->delete();

        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}
