<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\FileValidator;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Notifikasi;
use App\Models\Pengguna;
use App\Models\ProgressMateri;
use App\Models\AttemptKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PesertaController extends Controller
{
    public function index(Request $request)
    {
        $cabangId = $request->user()->id_cabang;

        $query = Pengguna::with(['role', 'cabang', 'dataPkl', 'pesertaKursus'])
            ->where('id_role', 4)
            ->where('id_cabang', $cabangId);

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

        if ($request->status) $query->where('status', $request->status);

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
            'username'        => [
                'required', 'string', 'max:100',
                Rule::unique('pengguna', 'username')->whereNull('deleted_at'),
            ],
            'email'           => [
                'required', 'email',
                Rule::unique('pengguna', 'email')->whereNull('deleted_at'),
            ],
            'password'        => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Z])(?=.*\d).+$/'],
            'nomor_hp'        => 'nullable|string|max:20',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date|after_or_equal:periode_mulai',
            'status'          => 'nullable|in:pending,aktif,ditolak',
        ], [
            'password.regex' => 'Password harus mengandung minimal 1 huruf besar dan 1 angka.',
        ]);

        $pengguna = Pengguna::create([
            'id_role'   => 4,
            'id_cabang' => $request->user()->id_cabang,
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

        AuditLog::log(
            $request->user()->id_pengguna, 'create', 'peserta',
            $pengguna->id_pengguna,
            ['nama' => $pengguna->nama, 'email' => $pengguna->email],
            [], $request->ip()
        );

        return response()->json([
            'message' => 'Peserta berhasil ditambahkan.',
            'data'    => $this->formatPeserta($pengguna->load('role', 'cabang', 'dataPkl', 'pesertaKursus')),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $peserta = Pengguna::with([
            'role', 'cabang', 'dataPkl',
            'pesertaKursus.kursus.materi',
            'pesertaKursus.kursus.kuis',
            'penilaianPkl',
        ])->where('id_cabang', $request->user()->id_cabang)->findOrFail($id);

        $progressMateri = ProgressMateri::where('id_pengguna', $id)
            ->where('status', 'selesai')
            ->pluck('id_materi')
            ->all();

        $completedKuis = AttemptKuis::where('id_pengguna', $id)
            ->where('status', 'selesai')
            ->pluck('id_kuis')
            ->all();

        return response()->json($this->formatPesertaDetail($peserta, $progressMateri, $completedKuis));
    }

    public function update(Request $request, $id)
    {
        $peserta = Pengguna::where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->findOrFail($id);

        $request->validate([
            'nama'            => 'sometimes|string|max:100',
            'email'           => [
                'sometimes', 'email',
                Rule::unique('pengguna', 'email')->ignore($id, 'id_pengguna')->whereNull('deleted_at'),
            ],
            'username'        => [
                'sometimes', 'string',
                Rule::unique('pengguna', 'username')->ignore($id, 'id_pengguna')->whereNull('deleted_at'),
            ],
            'nomor_hp'        => 'nullable|string|max:20',
            'password'        => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[A-Z])(?=.*\d).+$/'],
            'status'          => 'nullable|in:pending,aktif,ditolak',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date',
        ], [
            'password.regex' => 'Password harus mengandung minimal 1 huruf besar dan 1 angka.',
        ]);

        $oldValues = $peserta->only(['nama', 'email', 'status']);

        $payload = [];
        if ($request->has('nama'))     $payload['nama']     = $request->nama;
        if ($request->has('email'))    $payload['email']    = $request->email;
        if ($request->has('username')) $payload['username'] = $request->username;
        if ($request->has('nomor_hp')) $payload['nomor_hp'] = $request->nomor_hp;
        if ($request->has('status'))   $payload['status']   = $request->status;
        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->password);
        }

        $peserta->update($payload);

        // Invalidate semua token aktif jika password diganti
        if ($request->filled('password')) {
            $peserta->tokens()->delete();
        }

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

        AuditLog::log(
            $request->user()->id_pengguna, 'update', 'peserta', $id,
            array_diff_assoc($payload, $oldValues), $oldValues, $request->ip()
        );

        return response()->json([
            'message' => 'Data peserta berhasil diperbarui.',
            'data'    => $this->formatPeserta($peserta->fresh()->load('role', 'cabang', 'dataPkl', 'pesertaKursus')),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $peserta = Pengguna::where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->findOrFail($id);

        // Hapus file fisik dokumen PKL dari private storage
        $dataPkl = $peserta->dataPkl;
        if ($dataPkl) {
            if ($dataPkl->surat_siswa && !str_starts_with($dataPkl->surat_siswa, 'http')) {
                Storage::disk('local')->delete($dataPkl->surat_siswa);
            }
            if ($dataPkl->surat_ortu && !str_starts_with($dataPkl->surat_ortu, 'http')) {
                Storage::disk('local')->delete($dataPkl->surat_ortu);
            }
        }

        // Soft delete — data terkait (nilai, progress, kuis) dipertahankan untuk audit
        $peserta->delete();

        AuditLog::log(
            $request->user()->id_pengguna, 'delete', 'peserta', $id,
            [], ['nama' => $peserta->nama, 'email' => $peserta->email],
            $request->ip()
        );

        return response()->json(['message' => 'Peserta berhasil dihapus.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,aktif,ditolak',
        ]);

        $peserta = Pengguna::where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->findOrFail($id);

        $oldStatus = $peserta->status;
        $peserta->update(['status' => $request->status]);

        AuditLog::log(
            $request->user()->id_pengguna, 'update_status', 'peserta', $id,
            ['status' => $request->status], ['status' => $oldStatus], $request->ip()
        );

        return response()->json([
            'message' => 'Status peserta berhasil diperbarui.',
            'status'  => $peserta->status,
        ]);
    }

    /**
     * PATCH /api/peserta/{id}/verifikasi-dokumen
     */
    public function verifikasiDokumen(Request $request, $id)
    {
        $request->validate([
            'aksi'    => 'required|in:setujui,tolak',
            'catatan' => 'nullable|string|max:500',
        ]);

        $peserta = Pengguna::with('dataPkl')
            ->where('id_cabang', $request->user()->id_cabang)
            ->findOrFail($id);

        if (! $peserta->dataPkl) {
            return response()->json(['message' => 'Data dokumen tidak ditemukan.'], 404);
        }

        $admin     = $request->user();
        $disetujui = $request->aksi === 'setujui';
        $statusDok = $disetujui ? 'disetujui' : 'ditolak';
        $statusUser= $disetujui ? 'aktif' : 'pending';

        $peserta->dataPkl->update([
            'status_dokumen'  => $statusDok,
            'catatan_dokumen' => $request->catatan,
            'diperiksa_oleh'  => $admin->id_pengguna,
            'diperiksa_pada'  => now(),
        ]);

        $peserta->update(['status' => $statusUser]);

        $judulNotif = $disetujui ? 'Dokumen Disetujui' : 'Dokumen Ditolak';
        $pesanNotif = $disetujui
            ? 'Dokumen Anda telah diverifikasi. Akun Anda sekarang aktif.'
            : 'Dokumen Anda ditolak. ' . ($request->catatan ?? 'Silakan hubungi admin cabang.');

        Notifikasi::create([
            'id_penerima'  => $peserta->id_pengguna,
            'judul'        => $judulNotif,
            'pesan'        => $pesanNotif,
            'tipe'         => $disetujui ? 'dokumen_disetujui' : 'dokumen_ditolak',
            'id_referensi' => $peserta->id_pengguna,
        ]);

        AuditLog::log(
            $admin->id_pengguna,
            $disetujui ? 'verify_approve' : 'verify_reject',
            'dokumen_peserta', $id,
            ['aksi' => $request->aksi, 'catatan' => $request->catatan],
            [], $request->ip()
        );

        return response()->json([
            'message'        => $disetujui ? 'Dokumen disetujui, akun peserta diaktifkan.' : 'Dokumen ditolak.',
            'status_user'    => $statusUser,
            'status_dokumen' => $statusDok,
        ]);
    }

    /**
     * POST /api/peserta/saya/dokumen
     * Peserta upload dokumen PKL ke private storage (tidak bisa diakses publik)
     */
    public function uploadDokumen(Request $request)
    {
        if ($request->user()->id_role !== 4) {
            return response()->json(['message' => 'Hanya peserta yang dapat mengupload dokumen ini.'], 403);
        }

        $request->validate([
            'surat_siswa' => 'required|file|mimes:pdf|max:5120',
            'surat_ortu'  => 'required|file|mimes:pdf|max:5120',
        ]);

        // Validasi MIME nyata menggunakan magic bytes (bukan hanya ekstensi)
        if (! FileValidator::isPdf($request->file('surat_siswa'))) {
            return response()->json(['message' => 'File surat siswa bukan PDF yang valid.'], 422);
        }
        if (! FileValidator::isPdf($request->file('surat_ortu'))) {
            return response()->json(['message' => 'File surat orang tua bukan PDF yang valid.'], 422);
        }

        $pengguna = $request->user();
        $dataPkl  = $pengguna->dataPkl;

        if (! $dataPkl) {
            return response()->json(['message' => 'Data peserta tidak ditemukan.'], 404);
        }

        // Hapus file lama dari private storage
        if ($dataPkl->surat_siswa && !str_starts_with($dataPkl->surat_siswa, 'http')) {
            Storage::disk('local')->delete($dataPkl->surat_siswa);
        }
        if ($dataPkl->surat_ortu && !str_starts_with($dataPkl->surat_ortu, 'http')) {
            Storage::disk('local')->delete($dataPkl->surat_ortu);
        }

        // Simpan ke private storage (tidak accessible via URL langsung)
        $suratSiswaPath = $request->file('surat_siswa')
            ->store("dokumen/{$pengguna->id_pengguna}", 'local');
        $suratOrtuPath  = $request->file('surat_ortu')
            ->store("dokumen/{$pengguna->id_pengguna}", 'local');

        $dataPkl->update([
            'surat_siswa'     => $suratSiswaPath,
            'surat_ortu'      => $suratOrtuPath,
            'status_dokumen'  => 'menunggu',
            'catatan_dokumen' => null,
        ]);

        // Notifikasi ke admin cabang
        $adminCabang = Pengguna::where('id_cabang', $pengguna->id_cabang)
            ->whereIn('id_role', [1, 2])
            ->where('status', 'aktif')
            ->get();

        foreach ($adminCabang as $admin) {
            Notifikasi::create([
                'id_penerima'  => $admin->id_pengguna,
                'judul'        => 'Dokumen Menunggu Verifikasi',
                'pesan'        => 'Peserta "' . e($pengguna->nama) . '" telah mengupload dokumen PKL dan menunggu verifikasi.',
                'tipe'         => 'dokumen_menunggu',
                'id_referensi' => $pengguna->id_pengguna,
            ]);
        }

        return response()->json([
            'message'        => 'Dokumen berhasil diupload. Menunggu verifikasi dari admin cabang.',
            'status_dokumen' => 'menunggu',
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatPeserta($p)
    {
        $kursusCount = $p->pesertaKursus->count();
        $selesai     = $p->pesertaKursus->where('status', 'selesai')->count();
        $progress    = $kursusCount > 0 ? round(($selesai / $kursusCount) * 100) : 0;

        $siswaPath = $p->dataPkl?->surat_siswa ?? null;
        $ortuPath  = $p->dataPkl?->surat_ortu  ?? null;

        return [
            'id'               => $p->id_pengguna,
            'nama'             => $p->nama,
            'email'            => $p->email,
            'nomor_hp'         => $p->nomor_hp,
            'asal_sekolah'     => $p->dataPkl?->asal_sekolah ?? null,
            'jurusan'          => $p->dataPkl?->jurusan ?? null,
            'enrolled_courses' => $kursusCount,
            'progress'         => $progress,
            'status'           => $p->status,
            'cabang'           => $p->cabang?->nama_cabang ?? null,
            'join_date'        => $p->dibuat_pada,
            'status_dokumen'   => $p->dataPkl?->status_dokumen  ?? null,
            'catatan_dokumen'  => $p->dataPkl?->catatan_dokumen ?? null,
            'surat_siswa_url'  => $siswaPath ? url('/api/dokumen/secure/' . urlencode($siswaPath)) : null,
            'surat_ortu_url'   => $ortuPath  ? url('/api/dokumen/secure/' . urlencode($ortuPath))  : null,
        ];
    }

    private function formatPesertaDetail($p, array $progressMateri = [], array $completedKuis = [])
    {
        $kursusData = $p->pesertaKursus->map(function ($pk) use ($progressMateri, $completedKuis) {
            $kursus = $pk->kursus;
            if (!$kursus) return null;

            $totalMateri   = $kursus->materi->count();
            $selesaiMateri = $kursus->materi->filter(fn($m) => in_array($m->id_materi, $progressMateri))->count();
            $totalKuis     = $kursus->kuis->count();
            $selesaiKuis   = $kursus->kuis->filter(fn($k) => in_array($k->id_kuis, $completedKuis))->count();

            $adaKonten = ($totalMateri + $totalKuis) > 0;
            $isSelesai = $adaKonten
                && ($totalMateri === 0 || $selesaiMateri === $totalMateri)
                && ($totalKuis   === 0 || $selesaiKuis   === $totalKuis);

            $adaProgress = ($selesaiMateri + $selesaiKuis) > 0;
            $statusBaru  = $isSelesai ? 'selesai' : ($adaProgress ? 'sedang_belajar' : 'belum_mulai');
            if ($pk->status !== $statusBaru) {
                $pk->update(['status' => $statusBaru]);
            }

            return [
                'id'             => $kursus->id_kursus,
                'judul'          => $kursus->judul_kursus,
                'status'         => $statusBaru,
                'materi_total'   => $totalMateri,
                'materi_selesai' => $selesaiMateri,
                'kuis_total'     => $totalKuis,
                'kuis_selesai'   => $selesaiKuis,
            ];
        })->filter()->values();

        $selesaiCount = $kursusData->where('status', 'selesai')->count();
        $totalCount   = $kursusData->count();
        $progress     = $totalCount > 0 ? round(($selesaiCount / $totalCount) * 100) : 0;

        return array_merge($this->formatPeserta($p), [
            'progress'        => $progress,
            'periode_mulai'   => $p->dataPkl->periode_mulai ?? null,
            'periode_selesai' => $p->dataPkl->periode_selesai ?? null,
            'kursus'          => $kursusData,
            'penilaian_pkl'   => $p->penilaianPkl ? [
                'nilai_teknis'     => $p->penilaianPkl->nilai_teknis,
                'nilai_non_teknis' => $p->penilaianPkl->nilai_non_teknis,
                'nilai_akhir'      => $p->penilaianPkl->nilai_akhir,
            ] : null,
        ]);
    }
}
