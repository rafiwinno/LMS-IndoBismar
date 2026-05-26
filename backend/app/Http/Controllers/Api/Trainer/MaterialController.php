<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use App\Models\Trainer\Material;
use App\Models\Trainer\Course;

class MaterialController extends Controller
{
    private function fileUrl(string $path): string
    {
        return URL::temporarySignedRoute('files.serve', now()->addHours(2), ['path' => $path]);
    }

    private function formatMaterial(Material $material): array
    {
        $data = $material->toArray();
        $data['file_url'] = ($material->file_materi && !str_starts_with($material->file_materi, 'http'))
            ? $this->fileUrl($material->file_materi)
            : $material->file_materi;
        return $data;
    }

    public function index(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $materials = Material::where('id_kursus', $courseId)
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'message' => 'List materi',
            'data'    => $materials->map(fn($m) => $this->formatMaterial($m)),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'    => 'required|integer|exists:kursus,id_kursus',
            'judul_materi' => 'required|string|max:200',
            'tipe_materi'  => 'required|in:video,pdf,dokumen',
            'urutan'       => 'nullable|integer|min:1',
            'sub_bab'      => 'nullable|string|max:100',
        ]);

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
            $mimes = $request->tipe_materi === 'pdf' ? 'pdf' : 'doc,docx';
            $request->validate([
                'file_materi' => "required|file|mimes:{$mimes}|max:10240",
            ]);
            $fileMateri = $request->file('file_materi')->store('materi', 'local');
        }

        $material = Material::create([
            'id_kursus'    => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi'  => $request->tipe_materi,
            'file_materi'  => $fileMateri,
            'urutan'       => $request->urutan ?? 1,
            'sub_bab'      => $request->sub_bab ?: null,
        ]);

        return response()->json([
            'message' => 'Materi berhasil dibuat',
            'data'    => $this->formatMaterial($material),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $course = Course::findOrFail($material->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $effectiveTipe = $request->tipe_materi ?? $material->tipe_materi;
        $mimes = $effectiveTipe === 'pdf' ? 'pdf' : 'doc,docx';

        $request->validate([
            'judul_materi' => 'sometimes|required|string|max:200',
            'tipe_materi'  => 'sometimes|required|in:video,pdf,dokumen',
            'urutan'       => 'nullable|integer|min:1',
            'sub_bab'      => 'nullable|string|max:100',
            'link_video'   => 'sometimes|nullable|url',
            'file_materi'  => "sometimes|file|mimes:{$mimes}|max:10240",
        ]);

        if ($request->hasFile('file_materi')) {
            if ($material->file_materi && !filter_var($material->file_materi, FILTER_VALIDATE_URL)) {
                Storage::disk('local')->delete($material->file_materi);
            }
            $fileMateri = $request->file('file_materi')->store('materi', 'local');
            $material->file_materi = $fileMateri;
        } elseif ($request->filled('link_video')) {
            $material->file_materi = $request->link_video;
        }

        $material->judul_materi = $request->judul_materi ?? $material->judul_materi;
        $material->tipe_materi  = $request->tipe_materi  ?? $material->tipe_materi;
        $material->urutan       = $request->urutan       ?? $material->urutan;
        if ($request->has('sub_bab')) {
            $material->sub_bab = $request->sub_bab ?: null;
        }
        $material->save();

        return response()->json([
            'message' => 'Materi berhasil diupdate',
            'data'    => $this->formatMaterial($material),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $course = Course::findOrFail($material->id_kursus);
        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($material->file_materi && !filter_var($material->file_materi, FILTER_VALIDATE_URL)) {
            Storage::disk('local')->delete($material->file_materi);
        }

        $material->delete();

        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}