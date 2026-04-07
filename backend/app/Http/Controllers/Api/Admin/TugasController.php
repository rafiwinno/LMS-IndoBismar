<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\PesertaKursus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TugasController extends Controller
{
    /**
     * GET /api/tugas
     */
    public function index(Request $request)
    {
        $query = Tugas::with(['kursus.pesertaKursus', 'pengumpulan']);

        if ($request->id_kursus) {
            $query->where('id_kursus', $request->id_kursus);
        }

        if ($request->search) {
            $query->where('judul_tugas', 'like', "%{$request->search}%");
        }

        if ($request->status) {
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
            'id_kursus'      => 'required|exists:kursus,id_kursus',
            'judul_tugas'    => 'required|string|max:200',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'required|date|after:now',
            'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
            'file_soal'      => 'nullable|file|max:51200|mimes:pdf',
        ]);

        $data = $request->only(['id_kursus', 'judul_tugas', 'deskripsi', 'deadline', 'nilai_maksimal']);

        if ($request->hasFile('file_soal')) {
            $data['file_soal'] = $request->file('file_soal')->store('tugas/soal', 'public');
        }

        $tugas = Tugas::create($data);

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
            'judul_tugas'    => 'sometimes|string|max:200',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'sometimes|date',
            'nilai_maksimal' => 'nullable|integer|min:1|max:1000',
            'file_soal'      => 'nullable|file|max:51200|mimes:pdf',
        ]);

        $data = $request->only(['judul_tugas', 'deskripsi', 'deadline', 'nilai_maksimal']);

        if ($request->hasFile('file_soal')) {
            if ($tugas->file_soal) {
                Storage::disk('public')->delete($tugas->file_soal);
            }
            $data['file_soal'] = $request->file('file_soal')->store('tugas/soal', 'public');
        }

        $tugas->update($data);

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
        $tugas = Tugas::findOrFail($id);
        if ($tugas->file_soal) {
            Storage::disk('public')->delete($tugas->file_soal);
        }
        $tugas->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus.']);
    }

    /**
     * GET /api/tugas/{id}/submissions
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
     * Peserta kumpulkan tugas (accessible by student)
     */
    public function submit(Request $request, $id)
    {
        $request->validate([
            'file_tugas' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt',
        ]);

        Tugas::findOrFail($id);

        $idPengguna = $request->user()->id_pengguna;

        $path = $request->file('file_tugas')->store("tugas/{$id}", 'public');

        PengumpulanTugas::updateOrCreate(
            ['id_tugas' => $id, 'id_pengguna' => $idPengguna],
            ['file_tugas' => $path, 'tanggal_kumpul' => now()]
        );

        return response()->json([
            'message'  => 'Tugas berhasil dikumpulkan.',
            'file_url' => asset("storage/{$path}"),
        ], 201);
    }

    /**
     * PATCH /api/tugas/submissions/{subId}/grade
     */
    public function grade(Request $request, $subId)
    {
        $request->validate([
            'nilai'    => 'required|integer|min:0|max:1000',
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

    /**
     * GET /api/tugas/saya
     * List tugas untuk peserta yang login (by enrolled courses)
     */
    public function myTugas(Request $request)
    {
        $idPengguna = $request->user()->id_pengguna;

        // Ambil id_kursus yang diikuti peserta
        $idKursus = PesertaKursus::where('id_pengguna', $idPengguna)
            ->pluck('id_kursus');

        $tugas = Tugas::with(['kursus', 'pengumpulan' => fn($q) => $q->where('id_pengguna', $idPengguna)])
            ->whereIn('id_kursus', $idKursus)
            ->orderBy('deadline')
            ->get()
            ->map(fn($t) => $this->formatTugasPeserta($t, $idPengguna));

        return response()->json(['data' => $tugas]);
    }

    /**
     * GET /api/tugas/{id}/my-submission
     */
    public function mySubmission(Request $request, $id)
    {
        $idPengguna = $request->user()->id_pengguna;
        $tugas      = Tugas::with('kursus')->findOrFail($id);
        $sub        = PengumpulanTugas::where('id_tugas', $id)
            ->where('id_pengguna', $idPengguna)
            ->first();

        return response()->json([
            'tugas'      => $this->formatTugasPeserta($tugas, $idPengguna),
            'submission' => $sub ? [
                'id'             => $sub->id_pengumpulan,
                'file_url'       => asset("storage/{$sub->file_tugas}"),
                'tanggal_kumpul' => $sub->tanggal_kumpul,
                'nilai'          => $sub->nilai,
                'feedback'       => $sub->feedback,
            ] : null,
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatTugas($t)
    {
        $total       = $t->kursus ? $t->kursus->pesertaKursus->count() : 0;
        $submissions = $t->pengumpulan->count();
        $isCompleted = $t->deadline && now()->isAfter($t->deadline);

        return [
            'id'             => $t->id_tugas,
            'judul'          => $t->judul_tugas,
            'deskripsi'      => $t->deskripsi,
            'kursus'         => $t->kursus->judul_kursus ?? null,
            'id_kursus'      => $t->id_kursus,
            'deadline'       => $t->deadline,
            'nilai_maksimal' => $t->nilai_maksimal ?? 100,
            'file_soal_url'  => $t->file_soal ? asset("storage/{$t->file_soal}") : null,
            'submissions'    => $submissions,
            'total'          => $total,
            'status'         => $isCompleted ? 'Completed' : 'Active',
        ];
    }

    private function formatTugasPeserta($t, $idPengguna)
    {
        $sub = $t->pengumpulan->firstWhere('id_pengguna', $idPengguna)
            ?? $t->pengumpulan->first();

        return [
            'id'             => $t->id_tugas,
            'judul'          => $t->judul_tugas,
            'deskripsi'      => $t->deskripsi,
            'kursus'         => $t->kursus->judul_kursus ?? null,
            'id_kursus'      => $t->id_kursus,
            'deadline'       => $t->deadline,
            'nilai_maksimal' => $t->nilai_maksimal ?? 100,
            'file_soal_url'  => $t->file_soal ? asset("storage/{$t->file_soal}") : null,
            'sudah_kumpul'   => $sub !== null,
            'tanggal_kumpul' => $sub?->tanggal_kumpul,
            'nilai'          => $sub?->nilai,
            'feedback'       => $sub?->feedback,
            'file_jawaban'   => $sub?->file_tugas ? asset("storage/{$sub->file_tugas}") : null,
            'id_pengumpulan' => $sub?->id_pengumpulan,
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
