<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trainer\Material;

class MaterialController extends Controller
{

    // LIST MATERI PER COURSE
    public function index($courseId)
    {
        $materials = Material::where('id_kursus', $courseId)
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'message' => 'List materi',
            'data' => $materials
        ]);
    }


    // CREATE MATERI
    public function store(Request $request)
    {

        $request->validate([
            'id_kursus' => 'required',
            'judul_materi' => 'required',
            'tipe_materi' => 'required|in:video,pdf,dokumen'
        ]);

        if ($request->tipe_materi == 'video') {

            $fileMateri = $request->link_video;

        } else {

            $request->validate([
                'file_materi' => 'required|file|mimes:pdf,doc,docx'
            ]);

            $fileMateri = $request->file('file_materi')
                ->store('materi', 'public');
        }

        $material = Material::create([
            'id_kursus' => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi' => $request->tipe_materi,
            'file_materi' => $fileMateri,
            'urutan' => $request->urutan
        ]);

        return response()->json([
            'message' => 'Materi berhasil dibuat',
            'data' => $material
        ]);
    }


    // UPDATE MATERI
    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $material->update([
            'judul_materi' => $request->judul_materi ?? $material->judul_materi,
            'tipe_materi' => $request->tipe_materi ?? $material->tipe_materi,
            'urutan' => $request->urutan ?? $material->urutan
        ]);

        return response()->json([
            'message' => 'Materi berhasil diupdate',
            'data' => $material
        ]);
    }


    // DELETE MATERI
    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();

        return response()->json([
            'message' => 'Materi berhasil dihapus'
        ]);
    }
}
