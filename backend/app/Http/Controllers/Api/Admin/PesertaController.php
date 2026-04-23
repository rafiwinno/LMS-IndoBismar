<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Notifikasi;
use App\Models\ProgressMateri;
use App\Models\AttemptKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
            'username'        => 'required|string|max:100|unique:pengguna,username',
            'email'           => 'required|email|unique:pengguna,email',
            'password'        => 'required|string|min:8',
            'nomor_hp'        => 'nullable|string|max:20',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date|after_or_equal:periode_mulai',
            'status'          => 'nullable|in:pending,aktif,ditolak',
        ]);

        // Peserta selalu dibuat di cabang admin yang membuat
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
        // Verifikasi peserta milik cabang admin ini
        $peserta = Pengguna::where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->findOrFail($id);

        $request->validate([
            'nama'            => 'sometimes|string|max:100',
            'email'           => "sometimes|email|unique:pengguna,email,$id,id_pengguna",
            'username'        => "sometimes|string|unique:pengguna,username,$id,id_pengguna",
            'nomor_hp'        => 'nullable|string|max:20',
            'password'        => 'nullable|string|min:8',
            'status'          => 'nullable|in:pending,aktif,ditolak',
            'asal_sekolah'    => 'nullable|string|max:150',
            'jurusan'         => 'nullable|string|max:100',
            'periode_mulai'   => 'nullable|date',
            'periode_selesai' => 'nullable|date',
        ]);

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

    public function destroy(Request $request, $id)
    {
        $peserta = Pengguna::where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->findOrFail($id);

        DB::transaction(function () use ($id, $peserta) {
            DB::table('jawaban_kuis')
                ->whereIn('id_attempt', DB::table('attempt_kuis')->where('id_pengguna', $id)->pluck('id_attempt'))
                ->delete();
            DB::table('progress_materi')->where('id_pengguna', $id)->delete();
            DB::table('pengumpulan_tugas')->where('id_pengguna', $id)->delete();
            DB::table('attempt_kuis')->where('id_pengguna', $id)->delete();
            DB::table('peserta_kursus')->where('id_pengguna', $id)->delete();
            DB::table('penilaian_pkl')->where('id_pengguna', $id)->delete();
            DB::table('nilai_non_teknis')->where('id_pengguna', $id)->delete();
            DB::table('dokumen_verifikasi')->where('id_pengguna', $id)->delete();
            DB::table('data_peserta_pkl')->where('id_pengguna', $id)->delete();
            DB::table('notifikasi')->where('id_referensi', $id)->delete();
            $peserta->delete();
        });

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
        $peserta->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status peserta berhasil diperbarui.',
            'status'  => $peserta->status,
        ]);
    }

    /**
     * PATCH /api/peserta/{id}/verifikasi-dokumen
     * Admin cabang menyetujui atau menolak dokumen peserta
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

        $dokumen = DB::table('dokumen_verifikasi')->where('id_pengguna', $id)->first();
        if (! $dokumen && ! $peserta->dataPkl) {
            return response()->json(['message' => 'Data dokumen tidak ditemukan.'], 404);
        }

        $admin      = $request->user();
        $disetujui  = $request->aksi === 'setujui';
        $statusDok  = $disetujui ? 'disetujui' : 'ditolak';
        $statusUser = $disetujui ? 'aktif' : 'pending';

        // Update status di dokumen_verifikasi
        if ($dokumen) {
            DB::table('dokumen_verifikasi')->where('id_pengguna', $id)->update([
                'status'              => $statusDok,
                'diverifikasi_oleh'   => $admin->id_pengguna,
                'tanggal_verifikasi'  => now(),
            ]);
        }

        // Simpan catatan di data_peserta_pkl jika ada
        if ($peserta->dataPkl) {
            $peserta->dataPkl->update([
                'status_dokumen'  => $statusDok,
                'catatan_dokumen' => $request->catatan,
                'diperiksa_oleh'  => $admin->id_pengguna,
                'diperiksa_pada'  => now(),
            ]);
        }

        $peserta->update(['status' => $statusUser]);

        // Kirim notifikasi ke peserta (opsional — jika peserta punya akun aktif)
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

        return response()->json([
            'message'        => $disetujui ? 'Dokumen disetujui, akun peserta diaktifkan.' : 'Dokumen ditolak.',
            'status_user'    => $statusUser,
            'status_dokumen' => $statusDok,
        ]);
    }

    /**
     * POST /api/peserta/saya/dokumen
     * Peserta yang sudah login mengupload dokumen surat-surat PKL
     */
    public function uploadDokumen(Request $request)
    {
        $request->validate([
            'surat_siswa' => 'required|file|mimes:pdf|max:5120',
            'surat_ortu'  => 'required|file|mimes:pdf|max:5120',
        ]);

        $pengguna = $request->user();
        $dataPkl  = $pengguna->dataPkl;

        if (! $dataPkl) {
            return response()->json(['message' => 'Data peserta tidak ditemukan.'], 404);
        }

        // Hapus file lama jika ada
        if ($dataPkl->surat_siswa) {
            Storage::disk('public')->delete($dataPkl->surat_siswa);
        }
        if ($dataPkl->surat_ortu) {
            Storage::disk('public')->delete($dataPkl->surat_ortu);
        }

        $suratSiswaPath = $request->file('surat_siswa')
            ->store("surat/{$pengguna->id_pengguna}", 'public');
        $suratOrtuPath  = $request->file('surat_ortu')
            ->store("surat/{$pengguna->id_pengguna}", 'public');

        $dataPkl->update([
            'surat_siswa'     => $suratSiswaPath,
            'surat_ortu'      => $suratOrtuPath,
            'status_dokumen'  => 'menunggu',
            'catatan_dokumen' => null,
        ]);

        // Notifikasi 2: Dokumen menunggu verifikasi → ke admin cabang
        $adminCabang = Pengguna::where('id_cabang', $pengguna->id_cabang)
            ->whereIn('id_role', [1, 2])
            ->where('status', 'aktif')
            ->get();

        foreach ($adminCabang as $admin) {
            Notifikasi::create([
                'id_penerima'  => $admin->id_pengguna,
                'judul'        => 'Dokumen Menunggu Verifikasi',
                'pesan'        => "Peserta \"{$pengguna->nama}\" telah mengupload dokumen PKL dan menunggu verifikasi.",
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

        // Baca dokumen dari dokumen_verifikasi (diupload peserta via portal)
        $dokumen = DB::table('dokumen_verifikasi')
            ->where('id_pengguna', $p->id_pengguna)
            ->first();

        $suratSiswa = $dokumen?->surat_siswa     ?? null;
        $suratOrtu  = $dokumen?->surat_orang_tua ?? null;
        $statusDok  = $dokumen?->status          ?? ($p->dataPkl?->status_dokumen ?? null);
        $catatan    = $p->dataPkl?->catatan_dokumen ?? null;

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
            'status_dokumen'   => $statusDok,
            'catatan_dokumen'  => $catatan,
            'surat_siswa_url'  => $suratSiswa ? Storage::disk('public')->url($suratSiswa) : null,
            'surat_ortu_url'   => $suratOrtu  ? Storage::disk('public')->url($suratOrtu)  : null,
        ];
    }

    private function formatPesertaDetail($p, array $progressMateri = [], array $completedKuis = [])
    {
        $kursusData = $p->pesertaKursus->map(function ($pk) use ($progressMateri, $completedKuis) {
            $kursus = $pk->kursus;
            if (!$kursus) return null;

            $totalMateri   = $kursus->materi->count();
            $selesaiMateri = $kursus->materi->filter(fn($m) => in_array($m->id_materi, $progressMateri))->count();

            $totalKuis   = $kursus->kuis->count();
            $selesaiKuis = $kursus->kuis->filter(fn($k) => in_array($k->id_kuis, $completedKuis))->count();

            // Selesai = semua materi dibuka DAN semua kuis dikerjakan (minimal ada 1 konten)
            $adaKonten = ($totalMateri + $totalKuis) > 0;
            $isSelesai = $adaKonten
                && ($totalMateri === 0 || $selesaiMateri === $totalMateri)
                && ($totalKuis   === 0 || $selesaiKuis   === $totalKuis);

            // Auto-sync peserta_kursus.status
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