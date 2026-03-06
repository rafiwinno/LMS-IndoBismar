<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PesertaController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengguna::with(['role', 'cabang', 'dataPkl', 'pesertaKursus'])
            ->whereHas('role', fn($q) => $q->where('nama_role', 'peserta'));

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhereHas('dataPkl', fn($dq) =>
                      $dq->where('asal_sekolah', 'like', "%$search%")
                  );
            });
        }

        if ($request->status)    $query->where('status', $request->status);
        if ($request->id_cabang) $query->where('id_cabang', $request->id_cabang);

        $peserta = $query->orderBy('dibuat_pada', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $peserta->map(fn($p) => $this->formatPeserta($p)),
            'meta' => [
                'total'        => $peserta->total(),
                'per_page'     => $peserta->perPage(),
                'current_page' => $peserta->currentPage(),
                'last_page'    => $peserta->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'            => 'required|string|max:100',
            'username'        => 'required|string|max:100|unique:pengguna,username',
            'email'           => 'required|email|unique:pengguna,email',
            'password'        => 'required|string|min:8',
            'nomor_hp'        => 'nullable|string|max:20',
            'id_cabang'       => 'required|exists:cabang,id_cabang',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date|after_or_equal:periode_mulai',
            'status'          => 'nullable|in:pending,aktif,ditolak',
        ]);

        $pengguna = Pengguna::create([
            'id_role'   => 4,
            'id_cabang' => $request->id_cabang,
            'nama'      => $request->nama,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'nomor_hp'  => $request->nomor_hp,
            'status'    => $request->status ?? 'aktif',
        ]);

        $pengguna->dataPkl()->create([
            'asal_sekolah'    => $request->asal_sekolah,
            'jurusan'         => $request->jurusan,
            'periode_mulai'   => $request->periode_mulai,
            'periode_selesai' => $request->periode_selesai,
        ]);

        return response()->json([
            'message' => 'Peserta berhasil ditambahkan.',
            'data'    => $this->formatPeserta($pengguna->load('role', 'cabang', 'dataPkl', 'pesertaKursus')),
        ], 201);
    }

    public function show($id)
    {
        $peserta = Pengguna::with(['role', 'cabang', 'dataPkl', 'pesertaKursus.kursus', 'penilaianPkl'])
            ->findOrFail($id);

        return response()->json($this->formatPesertaDetail($peserta));
    }

    public function update(Request $request, $id)
    {
        $peserta = Pengguna::findOrFail($id);

        $request->validate([
            'nama'            => 'sometimes|string|max:100',
            'email'           => "sometimes|email|unique:pengguna,email,$id,id_pengguna",
            'username'        => "sometimes|string|unique:pengguna,username,$id,id_pengguna",
            'nomor_hp'        => 'nullable|string|max:20',
            'id_cabang'       => 'sometimes|exists:cabang,id_cabang',
            'password'        => 'nullable|string|min:8',
            'status'          => 'nullable|in:pending,aktif,ditolak',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date',
        ]);

        // Build update payload — status disertakan langsung tanpa array_filter
        // supaya tidak ter-skip saat nilainya valid string
        $payload = [];
        if ($request->has('nama'))      $payload['nama']      = $request->nama;
        if ($request->has('email'))     $payload['email']     = $request->email;
        if ($request->has('username'))  $payload['username']  = $request->username;
        if ($request->has('nomor_hp'))  $payload['nomor_hp']  = $request->nomor_hp;
        if ($request->has('id_cabang')) $payload['id_cabang'] = $request->id_cabang;
        if ($request->has('status'))    $payload['status']    = $request->status;
        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->password);
        }

        $peserta->update($payload);

        // Update data PKL
        $pklPayload = [];
        if ($request->has('asal_sekolah'))    $pklPayload['asal_sekolah']    = $request->asal_sekolah;
        if ($request->has('jurusan'))         $pklPayload['jurusan']         = $request->jurusan;
        if ($request->has('periode_mulai'))   $pklPayload['periode_mulai']   = $request->periode_mulai;
        if ($request->has('periode_selesai')) $pklPayload['periode_selesai'] = $request->periode_selesai;

        if (! empty($pklPayload)) {
            $peserta->dataPkl()->updateOrCreate(
                ['id_pengguna' => $id],
                $pklPayload
            );
        }

        return response()->json([
            'message' => 'Data peserta berhasil diperbarui.',
            'data'    => $this->formatPeserta($peserta->fresh()->load('role', 'cabang', 'dataPkl', 'pesertaKursus')),
        ]);
    }

    public function destroy($id)
    {
        $peserta = Pengguna::findOrFail($id);
        $peserta->delete();

        return response()->json(['message' => 'Peserta berhasil dihapus.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,aktif,ditolak',
        ]);

        $peserta = Pengguna::findOrFail($id);
        $peserta->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status peserta berhasil diperbarui.',
            'status'  => $peserta->status,
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatPeserta($p)
    {
        $kursusCount = $p->pesertaKursus->count();
        $selesai     = $p->pesertaKursus->where('status', 'selesai')->count();
        $progress    = $kursusCount > 0 ? round(($selesai / $kursusCount) * 100) : 0;

        return [
            'id'               => $p->id_pengguna,
            'nama'             => $p->nama,
            'email'            => $p->email,
            'nomor_hp'         => $p->nomor_hp,
            'asal_sekolah'     => $p->dataPkl->asal_sekolah ?? null,
            'jurusan'          => $p->dataPkl->jurusan ?? null,
            'enrolled_courses' => $kursusCount,
            'progress'         => $progress,
            'status'           => $p->status,
            'cabang'           => $p->cabang->nama_cabang ?? null,
            'join_date'        => $p->dibuat_pada,
        ];
    }

    private function formatPesertaDetail($p)
    {
        return array_merge($this->formatPeserta($p), [
            'periode_mulai'   => $p->dataPkl->periode_mulai ?? null,
            'periode_selesai' => $p->dataPkl->periode_selesai ?? null,
            'kursus'          => $p->pesertaKursus->map(fn($pk) => [
                'id'     => $pk->kursus->id_kursus ?? null,
                'judul'  => $pk->kursus->judul_kursus ?? null,
                'status' => $pk->status,
            ]),
            'penilaian_pkl' => $p->penilaianPkl ? [
                'nilai_teknis'     => $p->penilaianPkl->nilai_teknis,
                'nilai_non_teknis' => $p->penilaianPkl->nilai_non_teknis,
                'nilai_akhir'      => $p->penilaianPkl->nilai_akhir,
            ] : null,
        ]);
    }
}