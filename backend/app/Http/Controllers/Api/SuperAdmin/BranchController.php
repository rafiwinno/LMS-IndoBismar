<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Cabang;
use App\Models\Pengguna;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    // ─── Mapping id_role ──────────────────────────────────────────────────────
    // 1 = superadmin | 2 = admin | 3 = trainer | 4 = user
    private const ROLE_MAP = [
        1 => 'superadmin',
        2 => 'admin',
        3 => 'trainer',
        4 => 'user',
    ];

    // GET /superadmin/cabang
    public function index(Request $request)
    {
        $query = Cabang::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_cabang', 'like', "%{$request->search}%")
                  ->orWhere('kota',      'like', "%{$request->search}%")
                  ->orWhere('kode',      'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->kota) {
            $query->where('kota', $request->kota);
        }

        $branches = $query->orderBy('id_cabang')->get();

        $userCounts = Pengguna::selectRaw('id_cabang, COUNT(*) as total')
            ->groupBy('id_cabang')
            ->pluck('total', 'id_cabang');

        // id_role = 2 → admin (semua admin per cabang)
        $admins = Pengguna::where('id_role', 2)
            ->select('id_cabang', 'nama')
            ->get()
            ->groupBy('id_cabang')
            ->map(fn($g) => $g->pluck('nama')->implode(', '));

        $cities = Cabang::distinct()->pluck('kota')->sort()->values();

        $mapped = $branches->map(function ($b) use ($userCounts, $admins) {
            return [
                'id'          => $b->id_cabang,
                'nama_cabang' => $b->nama_cabang,
                'kode'        => $b->kode ?? '-',
                'kota'        => $b->kota,
                'alamat'      => $b->alamat ?? '-',
                'telepon'     => $b->telepon ?? '-',
                'status'      => $b->status,
                'admin'       => $admins[$b->id_cabang] ?? '-',
                'total_users' => $userCounts[$b->id_cabang] ?? 0,
            ];
        });

        return response()->json([
            'data'   => $mapped,
            'total'  => $branches->count(),
            'active' => $branches->where('status', 'aktif')->count(),
            'cities' => $cities,
        ]);
    }

    // GET /superadmin/cabang/{id}/users
    public function users($id)
    {
        $cabang = Cabang::findOrFail($id);

        $pengguna = Pengguna::where('id_cabang', $id)
            ->orderBy('id_role')
            ->orderBy('nama')
            ->get();

        $mapped = $pengguna->map(function ($p) {
            return [
                'id'       => $p->id_pengguna,
                'nama'     => $p->nama,
                'username' => $p->username,
                'email'    => $p->email,
                'nomor_hp' => $p->nomor_hp,
                'role'     => self::ROLE_MAP[$p->id_role] ?? 'user',
                'id_role'  => $p->id_role,
                'status'   => $p->status,
            ];
        });

        return response()->json([
            'cabang' => $cabang->nama_cabang,
            'total'  => $mapped->count(),
            'data'   => $mapped,
        ]);
    }

    // POST /superadmin/cabang
    public function store(Request $request)
    {
        $request->validate([
            'nama_cabang' => 'required|string|max:255',
            'kode'        => 'nullable|string|max:20|unique:cabang,kode',
            'kota'        => 'required|string|max:100',
            'alamat'      => 'nullable|string',
            'telepon'     => 'nullable|string|max:20',
            'status'      => 'in:aktif,nonaktif',
        ]);

        $cabang = Cabang::create([
            'nama_cabang' => $request->nama_cabang,
            'kode'        => $request->kode,
            'kota'        => $request->kota,
            'alamat'      => $request->alamat,
            'telepon'     => $request->telepon,
            'status'      => $request->status ?? 'aktif',
        ]);

        return response()->json([
            'message' => 'Cabang berhasil dibuat.',
            'cabang'  => $cabang,
        ], 201);
    }

    // PUT /superadmin/cabang/{id}
    public function update(Request $request, $id)
    {
        $cabang = Cabang::findOrFail($id);

        $request->validate([
            'nama_cabang' => 'required|string|max:255',
            'kode'        => 'nullable|string|max:20|unique:cabang,kode,' . $id . ',id_cabang',
            'kota'        => 'required|string|max:100',
            'alamat'      => 'nullable|string',
            'telepon'     => 'nullable|string|max:20',
            'status'      => 'in:aktif,nonaktif',
        ]);

        $cabang->update([
            'nama_cabang' => $request->nama_cabang,
            'kode'        => $request->kode,
            'kota'        => $request->kota,
            'alamat'      => $request->alamat,
            'telepon'     => $request->telepon,
            'status'      => $request->status,
        ]);

        return response()->json([
            'message' => 'Cabang berhasil diupdate.',
            'cabang'  => $cabang,
        ]);
    }

    // DELETE /superadmin/cabang/{id}
    public function destroy($id)
    {
        $cabang = Cabang::findOrFail($id);

        $userCount = Pengguna::where('id_cabang', $id)->count();
        if ($userCount > 0) {
            return response()->json([
                'message' => "Cabang tidak bisa dihapus karena masih memiliki {$userCount} user.",
            ], 422);
        }

        $cabang->delete();

        return response()->json([
            'message' => 'Cabang berhasil dihapus.',
        ]);
    }
}
