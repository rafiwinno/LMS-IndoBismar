<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\PesertaKursus;
use Illuminate\Http\Request;

class KursusController extends Controller
{
    public function index(Request $request)
    {
        $query = Kursus::with(['trainer', 'cabang', 'pesertaKursus']);

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul_kursus', 'like', "%$search%")
                  ->orWhere('deskripsi', 'like', "%$search%")
                  ->orWhereHas('trainer', fn($tq) =>
                      $tq->where('nama', 'like', "%$search%")
                  );
            });
        }

        if ($request->status)    $query->where('status', $request->status);
        if ($request->id_cabang) $query->where('id_cabang', $request->id_cabang);

        $kursus = $query->orderBy('dibuat_pada', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $kursus->map(fn($k) => $this->formatKursus($k)),
            'meta' => [
                'total'        => $kursus->total(),
                'per_page'     => $kursus->perPage(),
                'current_page' => $kursus->currentPage(),
                'last_page'    => $kursus->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul_kursus' => 'required|string|max:200',
            'deskripsi'    => 'nullable|string',
            'id_trainer'   => 'required|exists:pengguna,id_pengguna',
            'id_cabang'    => 'required|exists:cabang,id_cabang',
            'status'       => 'nullable|in:draft,publish',
        ]);

        $kursus = Kursus::create([
            'judul_kursus' => $request->judul_kursus,
            'deskripsi'    => $request->deskripsi,
            'id_trainer'   => $request->id_trainer,
            'id_cabang'    => $request->id_cabang,
            'status'       => $request->status ?? 'draft',
        ]);

        return response()->json([
            'message' => 'Kursus berhasil dibuat.',
            'data'    => $this->formatKursus($kursus->load('trainer', 'cabang', 'pesertaKursus')),
        ], 201);
    }

    public function show($id)
    {
        $kursus = Kursus::with(['trainer', 'cabang', 'pesertaKursus.pengguna', 'materi', 'tugas', 'kuis'])
            ->findOrFail($id);

        return response()->json($this->formatKursusDetail($kursus));
    }

    public function update(Request $request, $id)
    {
        $kursus = Kursus::findOrFail($id);

        $request->validate([
            'judul_kursus' => 'sometimes|string|max:200',
            'deskripsi'    => 'nullable|string',
            'id_trainer'   => 'sometimes|exists:pengguna,id_pengguna',
            'id_cabang'    => 'sometimes|exists:cabang,id_cabang',
            'status'       => 'sometimes|in:draft,publish',
        ]);

        $kursus->update($request->only(['judul_kursus', 'deskripsi', 'id_trainer', 'id_cabang', 'status']));

        return response()->json([
            'message' => 'Kursus berhasil diperbarui.',
            'data'    => $this->formatKursus($kursus->fresh()->load('trainer', 'cabang', 'pesertaKursus')),
        ]);
    }

    public function destroy($id)
    {
        Kursus::findOrFail($id)->delete();
        return response()->json(['message' => 'Kursus berhasil dihapus.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:draft,publish']);

        $kursus = Kursus::findOrFail($id);
        $kursus->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status kursus diperbarui.',
            'status'  => $kursus->status,
        ]);
    }

    public function peserta($id)
    {
        Kursus::findOrFail($id);

        $peserta = PesertaKursus::with('pengguna.dataPkl')
            ->where('id_kursus', $id)
            ->get()
            ->map(fn($pk) => [
                'id'             => $pk->pengguna->id_pengguna,
                'nama'           => $pk->pengguna->nama,
                'email'          => $pk->pengguna->email,
                'asal_sekolah'   => $pk->pengguna->dataPkl->asal_sekolah ?? null,
                'status'         => $pk->status,
                'tanggal_daftar' => $pk->tanggal_daftar,
            ]);

        return response()->json(['data' => $peserta]);
    }

    public function enroll(Request $request, $id)
    {
        $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna',
        ]);

        Kursus::findOrFail($id);

        $existing = PesertaKursus::where('id_kursus', $id)
            ->where('id_pengguna', $request->id_pengguna)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Peserta sudah terdaftar di kursus ini.'], 409);
        }

        PesertaKursus::create([
            'id_kursus'   => $id,
            'id_pengguna' => $request->id_pengguna,
            'status'      => 'belum_mulai',
        ]);

        return response()->json(['message' => 'Peserta berhasil didaftarkan ke kursus.'], 201);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatKursus($k)
    {
        return [
            'id'           => $k->id_kursus,
            'judul'        => $k->judul_kursus,
            'deskripsi'    => $k->deskripsi,
            'status'       => $k->status,
            'trainer'      => $k->trainer->nama ?? null,
            'id_trainer'   => $k->id_trainer,
            'cabang'       => $k->cabang->nama_cabang ?? null,
            'participants' => $k->pesertaKursus->count(),
            'dibuat_pada'  => $k->dibuat_pada,
        ];
    }

    private function formatKursusDetail($k)
    {
        return array_merge($this->formatKursus($k), [
            'materi' => $k->materi->map(fn($m) => [
                'id'     => $m->id_materi,
                'judul'  => $m->judul_materi,
                'tipe'   => $m->tipe_materi,
                'urutan' => $m->urutan,
            ]),
            'tugas' => $k->tugas->map(fn($t) => [
                'id'       => $t->id_tugas,
                'judul'    => $t->judul_tugas,
                'deadline' => $t->deadline,
            ]),
            'kuis' => $k->kuis->map(fn($q) => [
                'id'    => $q->id_kuis,
                'judul' => $q->judul_kuis,
            ]),
        ]);
    }
}