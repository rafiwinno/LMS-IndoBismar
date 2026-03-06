<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $query = Materi::with(['kursus']);

        if ($request->search) {
            $query->where('judul_materi', 'like', "%{$request->search}%");
        }
        if ($request->id_kursus)   $query->where('id_kursus', $request->id_kursus);
        if ($request->tipe_materi) $query->where('tipe_materi', $request->tipe_materi);

        $materi = $query->orderBy('urutan')->orderBy('id_materi', 'desc')->get();

        return response()->json([
            'data' => $materi->map(fn($m) => $this->formatMateri($m)),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul_materi' => 'required|string|max:200',
            'tipe_materi'  => 'required|in:pdf,video,dokumen',
            'id_kursus'    => 'required|exists:kursus,id_kursus',
            'file_materi'  => 'nullable|file|max:102400',
            'youtube_url'  => 'nullable|url',
        ]);

        $fileUrl = null;
        $ukuran  = null;

        if ($request->tipe_materi === 'video') {
            // Simpan YouTube URL langsung
            $fileUrl = $request->youtube_url;
        } elseif ($request->hasFile('file_materi')) {
            $file   = $request->file('file_materi');
            $path   = $file->store('materi', 'public');
            // Simpan URL lengkap yang bisa diakses browser
            $fileUrl = url(Storage::url($path));
            $ukuran  = $this->formatBytes($file->getSize());
        }

        $urutan = Materi::where('id_kursus', $request->id_kursus)->max('urutan') + 1;

        $materi = Materi::create([
            'id_kursus'    => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi'  => $request->tipe_materi,
            'file_materi'  => $fileUrl,   // kolom yang benar: file_materi
            'ukuran'       => $ukuran,
            'urutan'       => $urutan,
        ]);

        return response()->json([
            'message' => 'Materi berhasil ditambahkan.',
            'data'    => $this->formatMateri($materi->load('kursus')),
        ], 201);
    }

    public function show($id)
    {
        $materi = Materi::with('kursus')->findOrFail($id);
        return response()->json($this->formatMateri($materi));
    }

    public function update(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);
        $request->validate([
            'judul_materi' => 'sometimes|string|max:200',
            'urutan'       => 'sometimes|integer|min:1',
        ]);
        $materi->update($request->only(['judul_materi', 'urutan']));
        return response()->json([
            'message' => 'Materi berhasil diperbarui.',
            'data'    => $this->formatMateri($materi->load('kursus')),
        ]);
    }

    public function destroy($id)
    {
        $materi = Materi::findOrFail($id);

        // Hapus file dari storage kalau bukan YouTube
        if ($materi->file_materi && $materi->tipe_materi !== 'video') {
            // Ekstrak path dari URL
            $path = 'public/' . ltrim(parse_url($materi->file_materi, PHP_URL_PATH), '/storage/');
            Storage::delete($path);
        }

        $materi->delete();
        return response()->json(['message' => 'Materi berhasil dihapus.']);
    }

    public function updateProgress(Request $request, $id)
    {
        $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna',
            'status'      => 'required|in:belum,selesai',
        ]);

        $progress = \App\Models\ProgressMateri::updateOrCreate(
            ['id_materi' => $id, 'id_pengguna' => $request->id_pengguna],
            ['status' => $request->status]
        );

        return response()->json(['message' => 'Progress diperbarui.', 'data' => $progress]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatMateri($m)
    {
        return [
            'id'          => $m->id_materi,
            'judul'       => $m->judul_materi,
            'tipe'        => $m->tipe_materi,
            'file_url'    => $m->file_materi,   // map file_materi → file_url untuk frontend
            'ukuran'      => $m->ukuran,
            'urutan'      => $m->urutan,
            'kursus'      => $m->kursus->judul_kursus ?? null,
            'id_kursus'   => $m->id_kursus,
            'dibuat_pada' => $m->dibuat_pada ?? null,
        ];
    }

    private function formatBytes($bytes): string
    {
        if ($bytes >= 1073741824) return round($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576)    return round($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)       return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }
}
