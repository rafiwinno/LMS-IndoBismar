<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use App\Models\ProgressMateri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $kursusIds = \App\Models\Kursus::where('id_cabang', $request->user()->id_cabang)->pluck('id_kursus');

        $query = Materi::whereIn('id_kursus', $kursusIds);

        if ($request->has('id_kursus')) {
            $query->where('id_kursus', $request->id_kursus);
        }

        if ($request->search) {
            $query->where('judul_materi', 'like', '%' . $request->search . '%');
        }

        $materi = $query->with('kursus')->orderBy('urutan')->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'data'    => $materi->map(fn($m) => $this->formatMateri($m)),
            'meta'    => [
                'total'        => $materi->total(),
                'current_page' => $materi->currentPage(),
                'last_page'    => $materi->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $cabangId = $request->user()->id_cabang;

        $validator = Validator::make($request->all(), [
            'id_kursus'    => [
                'required',
                'exists:kursus,id_kursus',
                function ($attr, $val, $fail) use ($cabangId) {
                    $ok = \App\Models\Kursus::where('id_kursus', $val)->where('id_cabang', $cabangId)->exists();
                    if (! $ok) $fail('Kursus tidak ditemukan di cabang Anda.');
                },
            ],
            'judul_materi' => 'required|string|max:255',
            'tipe_materi'  => 'required|in:pdf,video,ppt,link_drive,dokumen',
            'file_materi'  => 'nullable|file|max:5120|mimes:pdf,ppt,pptx,doc,docx,xls,xlsx,zip',
            'youtube_url'  => 'nullable|url',
            'drive_url'    => 'nullable|url',
            'urutan'       => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = [
            'id_kursus'    => $request->id_kursus,
            'judul_materi' => $request->judul_materi,
            'tipe_materi'  => $request->tipe_materi,
            'urutan'       => $request->urutan ?? 0,
        ];

        if ($request->hasFile('file_materi')) {
            $file     = $request->file('file_materi');
            $path     = $file->store('materi', 'public');
            $data['file_materi'] = $path;
            $data['ukuran']      = $this->formatBytes($file->getSize());
        }

        if ($request->tipe_materi === 'video' && $request->youtube_url) {
            $data['file_materi'] = $request->youtube_url;
        }

        if ($request->tipe_materi === 'link_drive' && $request->drive_url) {
            $data['file_materi'] = $request->drive_url;
        }

        $materi = Materi::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil ditambahkan',
            'data'    => $this->formatMateri($materi),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $kursusIds = \App\Models\Kursus::where('id_cabang', $request->user()->id_cabang)->pluck('id_kursus');
        $materi = Materi::whereIn('id_kursus', $kursusIds)->find($id);

        if (!$materi) {
            return response()->json([
                'success' => false,
                'message' => 'Materi tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatMateri($materi),
        ]);
    }

    public function update(Request $request, $id)
    {
        $cabangId  = $request->user()->id_cabang;
        $kursusIds = \App\Models\Kursus::where('id_cabang', $cabangId)->pluck('id_kursus');
        $materi = Materi::whereIn('id_kursus', $kursusIds)->find($id);

        if (!$materi) {
            return response()->json([
                'success' => false,
                'message' => 'Materi tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'judul_materi' => 'sometimes|string|max:255',
            'tipe_materi'  => 'sometimes|in:pdf,video,ppt,link_drive,dokumen',
            'file_materi'  => 'nullable|file|max:5120|mimes:pdf,ppt,pptx,doc,docx,xls,xlsx,zip',
            'youtube_url'  => 'nullable|url',
            'drive_url'    => 'nullable|url',
            'urutan'       => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if ($request->has('judul_materi')) {
            $materi->judul_materi = $request->judul_materi;
        }

        if ($request->has('tipe_materi')) {
            $materi->tipe_materi = $request->tipe_materi;
        }

        if ($request->has('urutan')) {
            $materi->urutan = $request->urutan;
        }

        if ($request->hasFile('file_materi')) {
            // Hapus file lama jika ada
            if ($materi->file_materi && !str_starts_with($materi->file_materi, 'http')) {
                Storage::disk('public')->delete($materi->file_materi);
            }
            $file = $request->file('file_materi');
            $path = $file->store('materi', 'public');
            $materi->file_materi = $path;
            $materi->ukuran      = $this->formatBytes($file->getSize());
        }

        if ($request->tipe_materi === 'video' && $request->youtube_url) {
            $materi->file_materi = $request->youtube_url;
        }

        if ($request->tipe_materi === 'link_drive' && $request->drive_url) {
            $materi->file_materi = $request->drive_url;
        }

        $materi->save();

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil diperbarui',
            'data'    => $this->formatMateri($materi),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $kursusIds = \App\Models\Kursus::where('id_cabang', $request->user()->id_cabang)->pluck('id_kursus');
        $materi = Materi::whereIn('id_kursus', $kursusIds)->find($id);

        if (!$materi) {
            return response()->json([
                'success' => false,
                'message' => 'Materi tidak ditemukan',
            ], 404);
        }

        // Hapus file fisik jika bukan URL eksternal
        if ($materi->file_materi && !str_starts_with($materi->file_materi, 'http')) {
            Storage::disk('public')->delete($materi->file_materi);
        }

        $materi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Materi berhasil dihapus',
        ]);
    }

    public function updateProgress(Request $request, $id)
    {
        $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna',
        ]);

        Materi::findOrFail($id);

        ProgressMateri::updateOrCreate(
            ['id_pengguna' => $request->id_pengguna, 'id_materi' => $id],
            ['status' => 'selesai', 'waktu_update' => now()]
        );

        return response()->json(['message' => 'Progress materi berhasil diperbarui.']);
    }

    private function formatMateri(Materi $materi): array
    {
        $fileUrl = null;

        if ($materi->file_materi) {
            if (str_starts_with($materi->file_materi, 'http')) {
                $fileUrl = $materi->file_materi;
            } else {
                $fileUrl = Storage::disk('public')->url($materi->file_materi);
            }
        }

        return [
            'id_materi'    => $materi->id_materi,
            'id_kursus'    => $materi->id_kursus,
            'kursus'       => $materi->kursus?->judul_kursus,
            'judul_materi' => $materi->judul_materi,
            'tipe_materi'  => $materi->tipe_materi,
            'file_materi'  => $fileUrl,
            'ukuran'       => $materi->ukuran,
            'urutan'       => $materi->urutan,
            'dibuat_pada'  => $materi->dibuat_pada,
        ];
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}