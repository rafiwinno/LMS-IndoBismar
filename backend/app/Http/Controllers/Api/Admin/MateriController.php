<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
{
    public function index()
    {
        $materi = Materi::with('kursus')->get();
        return response()->json([
            'data' => $materi->map(fn($m) => $this->formatMateri($m))
        ]);
    }

    public function show($id)
    {
        $materi = Materi::with('kursus')->findOrFail($id);
        return response()->json(['data' => $this->formatMateri($materi)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul_materi' => 'required|string|max:200',
            'tipe_materi'  => 'required|in:pdf,video,ppt,link_drive,dokumen',
            'id_kursus'    => 'required|exists:kursus,id_kursus',
            'file_materi'  => 'nullable|file|max:5120',
            'youtube_url'  => 'nullable|url',
            'drive_url'    => 'nullable|url',
        ]);

        $fileUrl = null;
        $ukuran  = null;

        if ($request->tipe_materi === 'video') {
            $fileUrl = $request->youtube_url;
        } elseif ($request->tipe_materi === 'link_drive') {
            $fileUrl = $request->drive_url;
        } elseif ($request->hasFile('file_materi')) {
            $file    = $request->file('file_materi');
            $path    = $file->store('materi', 'public');
            $fileUrl = url(Storage::url($path));
            $ukuran  = $this->formatBytes($file->getSize());
        }

        $urutan = Materi::where('id_kursus', $request->id_kursus)->max('urutan') + 1;

        $materi = Materi::create([
            'id_kursus'    => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi'  => $request->tipe_materi,
            'file_materi'  => $fileUrl,
            'ukuran'       => $ukuran,
            'urutan'       => $urutan,
        ]);

        return response()->json([
            'message' => 'Materi berhasil ditambahkan.',
            'data'    => $this->formatMateri($materi->load('kursus')),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);

        $request->validate([
            'judul_materi' => 'sometimes|string|max:200',
            'tipe_materi'  => 'sometimes|in:pdf,video,ppt,link_drive,dokumen',
            'youtube_url'  => 'nullable|url',
            'drive_url'    => 'nullable|url',
        ]);

        $materi->update($request->only(['judul_materi', 'tipe_materi', 'urutan']));

        return response()->json([
            'message' => 'Materi berhasil diupdate.',
            'data'    => $this->formatMateri($materi->load('kursus')),
        ]);
    }

    public function destroy($id)
    {
        $materi = Materi::findOrFail($id);
        $materi->delete();
        return response()->json(['message' => 'Materi berhasil dihapus.']);
    }

    public function updateProgress(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);
        return response()->json(['message' => 'Progress updated.', 'data' => $materi]);
    }

    private function formatBytes($bytes)
    {
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        return number_format($bytes / 1024, 2) . ' KB';
    }

    private function formatMateri($materi)
    {
        return [
            'id'          => $materi->id_materi,
            'judul'       => $materi->judul_materi,
            'tipe'        => $materi->tipe_materi,
            'file_url'    => $materi->file_materi,
            'ukuran'      => $materi->ukuran,
            'id_kursus'   => $materi->id_kursus,
            'kursus'      => $materi->kursus?->judul_kursus ?? '',
            'dibuat_pada' => $materi->created_at,
        ];
    }
}