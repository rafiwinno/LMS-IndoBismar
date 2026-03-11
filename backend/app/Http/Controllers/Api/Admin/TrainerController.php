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
        $query = Pengguna::with(['role', 'kursus'])
            ->whereHas('role', fn($q) => $q->where('nama_role', 'trainer'));

        if ($request->search) {
            $query->where('nama', 'like', "%{$request->search}%");
        }

        $trainers = $query->get()->map(fn($t) => $this->formatTrainer($t));

        return response()->json(['data' => $trainers]);
    }

    public function show($id)
    {
        $trainer = Pengguna::with(['role', 'kursus', 'jadwal.kursus'])
            ->findOrFail($id);

        return response()->json(array_merge(
            $this->formatTrainer($trainer),
            ['jadwal' => $trainer->jadwal->map(fn($j) => $this->formatJadwal($j))]
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
        $trainer = Pengguna::findOrFail($id);

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

    public function destroy($id)
    {
        Pengguna::findOrFail($id)->delete();

        return response()->json(['message' => 'Trainer berhasil dihapus.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:aktif,pending,ditolak']);
        $trainer = Pengguna::findOrFail($id);
        $trainer->update(['status' => $request->status]);

        return response()->json(['message' => 'Status trainer diperbarui.', 'status' => $trainer->status]);
    }

    // ── Jadwal ────────────────────────────────────────────────────────────────

    public function allJadwal(Request $request)
    {
        $query = JadwalTrainer::with(['trainer', 'kursus']);

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
        $request->validate([
            'id_trainer' => 'required|exists:pengguna,id_pengguna',
            'id_kursus'  => 'required|exists:kursus,id_kursus',
            'tanggal'    => 'required|date',
            'jam_mulai'  => 'required|date_format:H:i',
            'jam_selesai'=> 'required|date_format:H:i|after:jam_mulai',
            'ruangan'    => 'nullable|string|max:100',
            'tipe'       => 'required|in:Online,Offline',
        ]);

        $jadwal = JadwalTrainer::create($request->all());

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
            'id'      => $t->id_pengguna,
            'nama'    => $t->nama,
            'email'   => $t->email,
            'nomor_hp'=> $t->nomor_hp,
            'status'  => $t->status,
            'courses' => $t->kursus->count(),
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
