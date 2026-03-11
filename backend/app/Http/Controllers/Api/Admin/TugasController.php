<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TugasController extends Controller
{
    /**
     * GET /api/tugas
     */
    public function index(Request $request)
    {
        $query = Tugas::with(['kursus', 'pengumpulan']);

        if ($request->id_kursus) {
            $query->where('id_kursus', $request->id_kursus);
        }

        if ($request->search) {
            $query->where('judul_tugas', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            // 'Active' = deadline belum lewat, 'Completed' = semua sudah kumpul
            if ($request->status === 'Active') {
                $query->where('deadline', '>=', now());
            } elseif ($request->status === 'Completed') {
                $query->where('deadline', '<', now());
            }
        }

        $tugas = $query->orderBy('deadline')->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $tugas->map(fn($t) => $this->formatTugas($t)),
            'meta' => [
                'total'        => $tugas->total(),
                'current_page' => $tugas->currentPage(),
                'last_page'    => $tugas->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/tugas
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'   => 'required|exists:kursus,id_kursus',
            'judul_tugas' => 'required|string|max:200',
            'deskripsi'   => 'nullable|string',
            'deadline'    => 'required|date|after:now',
        ]);

        $tugas = Tugas::create($request->only(['id_kursus', 'judul_tugas', 'deskripsi', 'deadline']));

        return response()->json([
            'message' => 'Tugas berhasil dibuat.',
            'data'    => $this->formatTugas($tugas->load('kursus', 'pengumpulan')),
        ], 201);
    }

    /**
     * GET /api/tugas/{id}
     */
    public function show($id)
    {
        $tugas = Tugas::with(['kursus', 'pengumpulan.pengguna'])->findOrFail($id);

        return response()->json($this->formatTugasDetail($tugas));
    }

    /**
     * PUT /api/tugas/{id}
     */
    public function update(Request $request, $id)
    {
        $tugas = Tugas::findOrFail($id);

        $request->validate([
            'judul_tugas' => 'sometimes|string|max:200',
            'deskripsi'   => 'nullable|string',
            'deadline'    => 'sometimes|date',
        ]);

        $tugas->update($request->only(['judul_tugas', 'deskripsi', 'deadline']));

        return response()->json([
            'message' => 'Tugas berhasil diperbarui.',
            'data'    => $this->formatTugas($tugas->fresh()->load('kursus', 'pengumpulan')),
        ]);
    }

    /**
     * DELETE /api/tugas/{id}
     */
    public function destroy($id)
    {
        Tugas::findOrFail($id)->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus.']);
    }

    /**
     * GET /api/tugas/{id}/submissions
     * Daftar pengumpulan tugas
     */
    public function submissions($id)
    {
        Tugas::findOrFail($id);

        $submissions = PengumpulanTugas::with('pengguna')
            ->where('id_tugas', $id)
            ->get()
            ->map(fn($s) => [
                'id'             => $s->id_pengumpulan,
                'peserta'        => $s->pengguna->nama ?? null,
                'email'          => $s->pengguna->email ?? null,
                'file_url'       => $s->file_tugas ? asset("storage/{$s->file_tugas}") : null,
                'tanggal_kumpul' => $s->tanggal_kumpul,
                'nilai'          => $s->nilai,
                'feedback'       => $s->feedback,
            ]);

        return response()->json(['data' => $submissions]);
    }

    /**
     * POST /api/tugas/{id}/submit
     * Peserta kumpulkan tugas
     */
    public function submit(Request $request, $id)
    {
        $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna',
            'file_tugas'  => 'required|file|max:51200', // max 50MB
        ]);

        Tugas::findOrFail($id);

        $path = $request->file('file_tugas')->store("tugas/{$id}", 'public');

        $submission = PengumpulanTugas::updateOrCreate(
            ['id_tugas' => $id, 'id_pengguna' => $request->id_pengguna],
            ['file_tugas' => $path, 'tanggal_kumpul' => now()]
        );

        return response()->json([
            'message'  => 'Tugas berhasil dikumpulkan.',
            'file_url' => asset("storage/{$path}"),
        ], 201);
    }

    /**
     * PATCH /api/tugas/submissions/{subId}/grade
     * Trainer beri nilai & feedback
     */
    public function grade(Request $request, $subId)
    {
        $request->validate([
            'nilai'    => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission = PengumpulanTugas::findOrFail($subId);
        $submission->update([
            'nilai'    => $request->nilai,
            'feedback' => $request->feedback,
        ]);

        return response()->json([
            'message' => 'Penilaian berhasil disimpan.',
            'nilai'   => $submission->nilai,
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatTugas($t)
    {
        $total       = $t->kursus ? $t->kursus->pesertaKursus()->count() : 0;
        $submissions = $t->pengumpulan->count();
        $isCompleted = $t->deadline && now()->isAfter($t->deadline);

        return [
            'id'          => $t->id_tugas,
            'judul'       => $t->judul_tugas,
            'deskripsi'   => $t->deskripsi,
            'kursus'      => $t->kursus->judul_kursus ?? null,
            'id_kursus'   => $t->id_kursus,
            'deadline'    => $t->deadline,
            'submissions' => $submissions,
            'total'       => $total,
            'status'      => $isCompleted ? 'Completed' : 'Active',
        ];
    }

    private function formatTugasDetail($t)
    {
        return array_merge($this->formatTugas($t), [
            'pengumpulan' => $t->pengumpulan->map(fn($s) => [
                'id'             => $s->id_pengumpulan,
                'peserta'        => $s->pengguna->nama ?? null,
                'tanggal_kumpul' => $s->tanggal_kumpul,
                'nilai'          => $s->nilai,
                'feedback'       => $s->feedback,
            ]),
        ]);
    }
}
