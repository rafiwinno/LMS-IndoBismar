<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kuis;
use App\Models\AttemptKuis;
use App\Models\JawabanKuis;
use App\Models\Pertanyaan;
use Illuminate\Http\Request;

class KuisController extends Controller
{
    public function index(Request $request)
    {
        $query = Kuis::with(['kursus', 'attemptKuis']);

        if ($request->id_kursus) $query->where('id_kursus', $request->id_kursus);
        if ($request->search)    $query->where('judul_kuis', 'like', "%{$request->search}%");

        $kuis = $query->orderBy('waktu_mulai', 'desc')->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $kuis->map(fn($k) => $this->formatKuis($k)),
            'meta' => [
                'total'        => $kuis->total(),
                'current_page' => $kuis->currentPage(),
                'last_page'    => $kuis->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_kursus'     => 'required|exists:kursus,id_kursus',
            'judul_kuis'    => 'required|string|max:200',
            'waktu_mulai'   => 'required|date',
            'waktu_selesai' => 'required|date|after:waktu_mulai',
            'pertanyaan'                          => 'nullable|array',
            'pertanyaan.*.pertanyaan'             => 'required_with:pertanyaan|string',
            'pertanyaan.*.tipe'                   => 'required_with:pertanyaan|in:pilihan_ganda,essay',
            'pertanyaan.*.bobot_nilai'            => 'required_with:pertanyaan|integer|min:0',
            'pertanyaan.*.pilihan'                => 'nullable|array',
            'pertanyaan.*.pilihan.*.teks_jawaban' => 'required|string',
            'pertanyaan.*.pilihan.*.benar'        => 'required|boolean',
        ]);

        $kuis = Kuis::create([
            'id_kursus'     => $request->id_kursus,
            'judul_kuis'    => $request->judul_kuis,
            'waktu_mulai'   => $request->waktu_mulai,
            'waktu_selesai' => $request->waktu_selesai,
        ]);

        $this->savePertanyaan($kuis, $request->pertanyaan ?? []);

        return response()->json([
            'message' => 'Kuis berhasil dibuat.',
            'data'    => $this->formatKuisDetail($kuis->load('kursus', 'pertanyaan.pilihanJawaban', 'attemptKuis')),
        ], 201);
    }

    public function show($id)
    {
        $kuis = Kuis::with(['kursus', 'pertanyaan.pilihanJawaban', 'attemptKuis'])->findOrFail($id);
        return response()->json($this->formatKuisDetail($kuis));
    }

    public function update(Request $request, $id)
    {
        $kuis = Kuis::findOrFail($id);

        $request->validate([
            'judul_kuis'    => 'sometimes|string|max:200',
            'waktu_mulai'   => 'sometimes|date',
            'waktu_selesai' => 'sometimes|date',
            'pertanyaan'                          => 'nullable|array',
            'pertanyaan.*.pertanyaan'             => 'required_with:pertanyaan|string',
            'pertanyaan.*.tipe'                   => 'required_with:pertanyaan|in:pilihan_ganda,essay',
            'pertanyaan.*.bobot_nilai'            => 'required_with:pertanyaan|integer|min:0',
            'pertanyaan.*.pilihan'                => 'nullable|array',
            'pertanyaan.*.pilihan.*.teks_jawaban' => 'nullable|string',
            'pertanyaan.*.pilihan.*.benar'        => 'nullable|boolean',
        ]);

        $kuis->update($request->only(['judul_kuis', 'waktu_mulai', 'waktu_selesai']));

        // Update pertanyaan — hapus lama, buat baru
        if ($request->has('pertanyaan')) {
            $kuis->pertanyaan()->each(fn($p) => $p->pilihanJawaban()->delete());
            $kuis->pertanyaan()->delete();
            $this->savePertanyaan($kuis, $request->pertanyaan);
        }

        return response()->json([
            'message' => 'Kuis berhasil diperbarui.',
            'data'    => $this->formatKuisDetail($kuis->fresh()->load('kursus', 'pertanyaan.pilihanJawaban', 'attemptKuis')),
        ]);
    }

    public function destroy($id)
    {
        $kuis = Kuis::findOrFail($id);
        $kuis->pertanyaan()->each(fn($p) => $p->pilihanJawaban()->delete());
        $kuis->pertanyaan()->delete();
        $kuis->delete();
        return response()->json(['message' => 'Kuis berhasil dihapus.']);
    }

    public function start(Request $request, $id)
    {
        $request->validate(['id_pengguna' => 'required|exists:pengguna,id_pengguna']);
        Kuis::findOrFail($id);

        $existing = AttemptKuis::where('id_kuis', $id)
            ->where('id_pengguna', $request->id_pengguna)
            ->where('status', 'sedang')->first();

        if ($existing) {
            return response()->json(['message' => 'Kuis sedang berjalan.', 'attempt_id' => $existing->id_attempt]);
        }

        $attempt = AttemptKuis::create([
            'id_kuis'     => $id,
            'id_pengguna' => $request->id_pengguna,
            'waktu_mulai' => now(),
            'status'      => 'sedang',
        ]);

        return response()->json(['message' => 'Kuis dimulai.', 'attempt_id' => $attempt->id_attempt], 201);
    }

    public function submitAttempt(Request $request, $id)
    {
        $request->validate([
            'attempt_id'                      => 'required|exists:attempt_kuis,id_attempt',
            'jawaban'                         => 'required|array',
            'jawaban.*.id_pertanyaan'         => 'required|exists:pertanyaan,id_pertanyaan',
            'jawaban.*.id_pilihan'            => 'nullable|exists:pilihan_jawaban,id_pilihan',
            'jawaban.*.jawaban_text'          => 'nullable|string',
        ]);

        $attempt = AttemptKuis::findOrFail($request->attempt_id);

        if ($attempt->status === 'selesai') {
            return response()->json(['message' => 'Kuis sudah selesai.'], 409);
        }

        $totalSkor = 0;

        foreach ($request->jawaban as $jawaban) {
            $pertanyaan = Pertanyaan::find($jawaban['id_pertanyaan']);
            $skor = 0;

            if ($pertanyaan->tipe === 'pilihan_ganda' && isset($jawaban['id_pilihan'])) {
                $pilihan = $pertanyaan->pilihanJawaban()->find($jawaban['id_pilihan']);
                $skor = ($pilihan && $pilihan->benar) ? $pertanyaan->bobot_nilai : 0;
            }
            // Essay: skor = 0 dulu, dinilai manual

            JawabanKuis::updateOrCreate(
                ['id_attempt' => $attempt->id_attempt, 'id_pertanyaan' => $jawaban['id_pertanyaan']],
                ['id_pilihan' => $jawaban['id_pilihan'] ?? null, 'jawaban_text' => $jawaban['jawaban_text'] ?? null, 'skor' => $skor]
            );

            $totalSkor += $skor;
        }

        $attempt->update(['waktu_selesai' => now(), 'skor' => $totalSkor, 'status' => 'selesai']);

        return response()->json(['message' => 'Kuis berhasil dikumpulkan.', 'skor' => $totalSkor]);
    }

    /**
     * PATCH /api/kuis/attempts/{attemptId}/grade-essay
     * Nilai essay oleh admin/trainer
     */
    public function gradeEssay(Request $request, $attemptId)
    {
        $request->validate([
            'scores'   => 'required|array',
            'scores.*' => 'required|integer|min:0',
        ]);

        $attempt = AttemptKuis::findOrFail($attemptId);

        $totalSkor = 0;

        foreach ($request->scores as $jawabanId => $skor) {
            $jawaban = JawabanKuis::where('id_jawaban', $jawabanId)
                ->where('id_attempt', $attemptId)
                ->first();

            if ($jawaban) {
                $pertanyaan = Pertanyaan::find($jawaban->id_pertanyaan);
                $maxSkor    = $pertanyaan ? $pertanyaan->bobot_nilai : 100;
                $finalSkor  = min($skor, $maxSkor);
                $jawaban->update(['skor' => $finalSkor]);
            }
        }

        // Hitung ulang total skor
        $totalSkor = JawabanKuis::where('id_attempt', $attemptId)->sum('skor');
        $attempt->update(['skor' => $totalSkor]);

        return response()->json(['message' => 'Penilaian essay berhasil.', 'skor_total' => $totalSkor]);
    }

    public function results($id)
    {
        Kuis::findOrFail($id);

        $attempts = AttemptKuis::with(['pengguna', 'jawabanKuis.pertanyaan.pilihanJawaban', 'jawabanKuis.pilihan'])
            ->where('id_kuis', $id)
            ->where('status', 'selesai')
            ->get();

        $avgScore = $attempts->avg('skor') ?? 0;

        return response()->json([
            'avg_score'     => round($avgScore, 1),
            'total_peserta' => $attempts->count(),
            'data'          => $attempts->map(fn($a) => [
                'id_attempt'    => $a->id_attempt,
                'peserta'       => $a->pengguna->nama ?? null,
                'skor'          => $a->skor,
                'waktu_mulai'   => $a->waktu_mulai,
                'waktu_selesai' => $a->waktu_selesai,
                'has_essay'     => $a->jawabanKuis->contains(fn($j) => $j->pertanyaan?->tipe === 'essay'),
                'jawaban_essay' => $a->jawabanKuis
                    ->filter(fn($j) => $j->pertanyaan?->tipe === 'essay')
                    ->map(fn($j) => [
                        'id_jawaban'   => $j->id_jawaban,
                        'pertanyaan'   => $j->pertanyaan?->pertanyaan,
                        'bobot_nilai'  => $j->pertanyaan?->bobot_nilai,
                        'jawaban_text' => $j->jawaban_text,
                        'skor'         => $j->skor,
                    ])->values(),
                'jawaban_pg' => $a->jawabanKuis
                    ->filter(fn($j) => $j->pertanyaan?->tipe === 'pilihan_ganda')
                    ->map(fn($j) => [
                        'pertanyaan'      => $j->pertanyaan?->pertanyaan,
                        'bobot_nilai'     => $j->pertanyaan?->bobot_nilai,
                        'jawaban_dipilih' => $j->pilihan?->teks_jawaban,
                        'benar'           => $j->skor > 0,
                        'jawaban_benar'   => $j->pertanyaan?->pilihanJawaban->firstWhere('benar', true)?->teks_jawaban,
                    ])->values(),
            ]),
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function savePertanyaan(Kuis $kuis, array $pertanyaanList): void
    {
        foreach ($pertanyaanList as $pData) {
            $pertanyaan = $kuis->pertanyaan()->create([
                'pertanyaan'  => $pData['pertanyaan'],
                'tipe'        => $pData['tipe'],
                'bobot_nilai' => $pData['bobot_nilai'],
            ]);

            if ($pData['tipe'] === 'pilihan_ganda') {
                foreach ($pData['pilihan'] ?? [] as $pilihan) {
                    $pertanyaan->pilihanJawaban()->create([
                        'teks_jawaban' => $pilihan['teks_jawaban'],
                        'benar'        => $pilihan['benar'] ?? false,
                    ]);
                }
            }
        }
    }

    private function formatKuis($k)
    {
        $attempts = $k->attemptKuis->where('status', 'selesai');
        return [
            'id'            => $k->id_kuis,
            'judul'         => $k->judul_kuis,
            'kursus'        => $k->kursus->judul_kursus ?? null,
            'id_kursus'     => $k->id_kursus,
            'waktu_mulai'   => $k->waktu_mulai,
            'waktu_selesai' => $k->waktu_selesai,
            'participants'  => $attempts->count(),
            'avg_score'     => $attempts->count() > 0 ? round($attempts->avg('skor'), 1) : 0,
            'dibuat_pada'   => $k->dibuat_pada,
        ];
    }

    private function formatKuisDetail($k)
    {
        return array_merge($this->formatKuis($k), [
            'pertanyaan' => $k->pertanyaan->map(fn($p) => [
                'id'          => $p->id_pertanyaan,
                'pertanyaan'  => $p->pertanyaan,
                'tipe'        => $p->tipe,
                'bobot_nilai' => $p->bobot_nilai,
                'pilihan'     => $p->pilihanJawaban->map(fn($pl) => [
                    'id'    => $pl->id_pilihan,
                    'teks'  => $pl->teks_jawaban,
                    'benar' => $pl->benar,
                ]),
            ]),
        ]);
    }
}
