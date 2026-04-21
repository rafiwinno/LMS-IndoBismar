<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\JadwalTrainer;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user();

        $query = Pengguna::with(['kursus'])
            ->where('id_role', 3)
            ->where('id_cabang', $admin->id_cabang);

        if ($request->search) {
            $query->where('nama', 'like', "%{$request->search}%");
        }

        $trainers = $query->get()->map(fn($t) => $this->formatTrainer($t));

        return response()->json(['data' => $trainers]);
    }

    public function show(Request $request, $id)
    {
        $trainer = Pengguna::with(['kursus', 'jadwal.kursus'])
            ->where('id_role', 3)
            ->where('id_cabang', $request->user()->id_cabang)
            ->findOrFail($id);

        return response()->json(array_merge(
            $this->formatTrainer($trainer),
            [
                'jadwal'  => $trainer->jadwal->map(fn($j) => $this->formatJadwal($j)),
                'kursus_list' => $trainer->kursus->map(fn($k) => [
                    'id'     => $k->id_kursus,
                    'judul'  => $k->judul_kursus,
                    'status' => $k->status,
                ]),
            ]
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:100',
            'username' => 'required|string|max:100|unique:pengguna,username',
            'email'    => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8',
            'nomor_hp' => 'nullable|string|max:20',
        ]);

        $trainer = Pengguna::create([
            'id_role'   => 3,
            'id_cabang' => $request->user()->id_cabang,
            'nama'      => $request->nama,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => \Illuminate\Support\Facades\Hash::make($request->password),
            'nomor_hp'  => $request->nomor_hp,
            'status'    => 'aktif',
        ]);

        return response()->json([
            'message' => 'Trainer berhasil ditambahkan.',
            'data'    => $this->formatTrainer($trainer->load('role', 'kursus')),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $trainer = Pengguna::where('id_role', 3)
            ->where('id_cabang', $request->user()->id_cabang)
            ->findOrFail($id);

        $request->validate([
            'nama'     => 'sometimes|string|max:100',
            'email'    => "sometimes|email|unique:pengguna,email,$id,id_pengguna",
            'nomor_hp' => 'nullable|string|max:20',
        ]);

        $trainer->update($request->only(['nama', 'email', 'nomor_hp']));

        return response()->json([
            'message' => 'Data trainer berhasil diperbarui.',
            'data'    => $this->formatTrainer($trainer->fresh()->load('role', 'kursus')),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        Pengguna::where('id_role', 3)
            ->where('id_cabang', $request->user()->id_cabang)
            ->findOrFail($id)
            ->delete();

        return response()->json(['message' => 'Trainer berhasil dihapus.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:aktif,pending,ditolak']);
        $trainer = Pengguna::where('id_role', 3)
            ->where('id_cabang', $request->user()->id_cabang)
            ->findOrFail($id);
        $trainer->update(['status' => $request->status]);

        return response()->json(['message' => 'Status trainer diperbarui.', 'status' => $trainer->status]);
    }

    // ── Jadwal ────────────────────────────────────────────────────────────────

    public function allJadwal(Request $request)
    {
        $cabangId  = $request->user()->id_cabang;
        $kursusIds = \App\Models\Kursus::where('id_cabang', $cabangId)->pluck('id_kursus');

        $query = JadwalTrainer::with(['trainer', 'kursus'])
            ->whereHas('trainer', fn($q) => $q->where('id_cabang', $cabangId));

        if ($request->id_trainer) {
            $query->where('id_trainer', $request->id_trainer);
        }

        if ($request->search) {
            $query->whereHas('kursus', fn($q) =>
                $q->where('judul_kursus', 'like', "%{$request->search}%")
            );
        }

        return response()->json([
            'data' => $query->orderBy('tanggal')->get()->map(fn($j) => $this->formatJadwal($j)),
        ]);
    }

    public function storeJadwal(Request $request)
    {
        $cabangId = $request->user()->id_cabang;

        $request->validate([
            'id_trainer' => [
                'required',
                'exists:pengguna,id_pengguna',
                function ($attr, $val, $fail) use ($cabangId) {
                    $ok = Pengguna::where('id_pengguna', $val)->where('id_role', 3)->where('id_cabang', $cabangId)->exists();
                    if (! $ok) $fail('Trainer tidak ditemukan di cabang Anda.');
                },
            ],
            'id_kursus'  => [
                'required',
                'exists:kursus,id_kursus',
                function ($attr, $val, $fail) use ($cabangId) {
                    $ok = \App\Models\Kursus::where('id_kursus', $val)->where('id_cabang', $cabangId)->exists();
                    if (! $ok) $fail('Kursus tidak ditemukan di cabang Anda.');
                },
            ],
            'tanggal'    => 'required|date',
            'jam_mulai'  => 'required|date_format:H:i',
            'jam_selesai'=> 'required|date_format:H:i|after:jam_mulai',
            'ruangan'    => 'nullable|string|max:100',
            'tipe'       => 'required|in:Online,Offline',
        ]);

        // Cek overlap jadwal trainer pada tanggal yang sama
        $overlap = JadwalTrainer::where('id_trainer', $request->id_trainer)
            ->where('tanggal', $request->tanggal)
            ->where(function ($q) use ($request) {
                $q->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                  ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('jam_mulai', '<=', $request->jam_mulai)
                         ->where('jam_selesai', '>=', $request->jam_selesai);
                  });
            })->exists();

        if ($overlap) {
            return response()->json(['message' => 'Trainer sudah memiliki jadwal pada waktu tersebut.'], 422);
        }

        $jadwal = JadwalTrainer::create($request->only(['id_trainer', 'id_kursus', 'tanggal', 'jam_mulai', 'jam_selesai', 'ruangan', 'tipe']));

        return response()->json([
            'message' => 'Jadwal berhasil ditambahkan.',
            'data'    => $this->formatJadwal($jadwal->load('trainer', 'kursus')),
        ], 201);
    }

    public function updateJadwal(Request $request, $id)
    {
        $jadwal = JadwalTrainer::findOrFail($id);

        $request->validate([
            'tanggal'    => 'sometimes|date',
            'jam_mulai'  => 'sometimes|date_format:H:i',
            'jam_selesai'=> 'sometimes|date_format:H:i',
            'ruangan'    => 'nullable|string|max:100',
            'tipe'       => 'sometimes|in:Online,Offline',
        ]);

        $jadwal->update($request->only(['tanggal', 'jam_mulai', 'jam_selesai', 'ruangan', 'tipe']));

        return response()->json([
            'message' => 'Jadwal berhasil diperbarui.',
            'data'    => $this->formatJadwal($jadwal->fresh()->load('trainer', 'kursus')),
        ]);
    }

    public function deleteJadwal($id)
    {
        JadwalTrainer::findOrFail($id)->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus.']);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatTrainer($t)
    {
        return [
            'id'       => $t->id_pengguna,
            'nama'     => $t->nama,
            'username' => $t->username,
            'email'    => $t->email,
            'nomor_hp' => $t->nomor_hp,
            'status'   => $t->status,
            'courses'  => $t->kursus->count(),
        ];
    }

    private function formatJadwal($j)
    {
        return [
            'id'          => $j->id_jadwal,
            'trainer'     => $j->trainer->nama ?? null,
            'id_trainer'  => $j->id_trainer,
            'kursus'      => $j->kursus->judul_kursus ?? null,
            'id_kursus'   => $j->id_kursus,
            'tanggal'     => $j->tanggal,
            'jam'         => "{$j->jam_mulai} - {$j->jam_selesai}",
            'ruangan'     => $j->ruangan,
            'tipe'        => $j->tipe,
        ];
    }
}
