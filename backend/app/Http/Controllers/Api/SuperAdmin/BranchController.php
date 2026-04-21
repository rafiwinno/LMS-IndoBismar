<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Cabang;
use App\Models\Pengguna;
use App\Models\LoginLog;
use App\Models\ActivityLog;
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

        // id_role = 2 → admin
        $admins = Pengguna::where('id_role', 2)
            ->select('id_cabang', 'nama')
            ->get()
            ->groupBy('id_cabang')
            ->map(fn($g) => $g->first()->nama);

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
        $cabang   = Cabang::findOrFail($id);
        $pengguna = Pengguna::where('id_cabang', $id)
            ->orderBy('id_role')->orderBy('nama')->get();

        $userIds = $pengguna->pluck('id_pengguna');

        // Ambil log login terbaru per user (subquery — sama dengan UserController)
        $latestLogs = LoginLog::whereIn('ll.user_id', $userIds)
            ->from('login_logs as ll')
            ->joinSub(
                LoginLog::whereIn('user_id', $userIds)
                    ->selectRaw('user_id, MAX(logged_in_at) as max_logged_in_at')
                    ->groupBy('user_id'),
                'latest',
                fn($join) => $join
                    ->on('ll.user_id', '=', 'latest.user_id')
                    ->on('ll.logged_in_at', '=', 'latest.max_logged_in_at')
            )
            ->select('ll.user_id', 'll.logged_in_at as last_login_at', 'll.logged_out_at')
            ->get()
            ->keyBy('user_id');

        $onlineThreshold = now()->subMinutes(15);

        $mapped = $pengguna->map(function ($p) use ($latestLogs, $onlineThreshold) {
            $log       = $latestLogs[$p->id_pengguna] ?? null;
            $lastLogin = $log?->last_login_at ?? null;
            $loggedOut = $log?->logged_out_at ?? null;

            $isOnline = $lastLogin
                && is_null($loggedOut)
                && \Carbon\Carbon::parse($lastLogin)->gte($onlineThreshold);

            return [
                'id'         => $p->id_pengguna,
                'nama'       => $p->nama,
                'username'   => $p->username,
                'email'      => $p->email,
                'nomor_hp'   => $p->nomor_hp,
                'role'       => self::ROLE_MAP[$p->id_role] ?? 'user',
                'id_role'    => $p->id_role,
                'status'     => $p->status,
                'is_online'  => $isOnline,
                'last_login' => $lastLogin
                    ? \Carbon\Carbon::parse($lastLogin)->setTimezone('Asia/Jakarta')->toIso8601String()
                    : null,
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

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'create_branch',
            'target_type'  => 'branch',
            'target_id'    => $cabang->id_cabang,
            'target_label' => $cabang->nama_cabang,
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

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

        $before = $cabang->only(['nama_cabang','kode','kota','alamat','telepon','status']);

        $cabang->update([
            'nama_cabang' => $request->nama_cabang,
            'kode'        => $request->kode,
            'kota'        => $request->kota,
            'alamat'      => $request->alamat,
            'telepon'     => $request->telepon,
            'status'      => $request->status,
        ]);

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'update_branch',
            'target_type'  => 'branch',
            'target_id'    => $cabang->id_cabang,
            'target_label' => $cabang->nama_cabang,
            'changes'      => ['before' => $before, 'after' => $cabang->only(array_keys($before))],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json([
            'message' => 'Cabang berhasil diupdate.',
            'cabang'  => $cabang,
        ]);
    }

    // DELETE /superadmin/cabang/{id}
    // Query param: force=1 → hapus semua user di cabang ini sekalian
    public function destroy(Request $request, $id)
    {
        $cabang    = Cabang::findOrFail($id);
        $userCount = Pengguna::where('id_cabang', $id)->count();

        if ($userCount > 0 && !$request->boolean('force')) {
            return response()->json([
                'message'    => "Cabang masih memiliki {$userCount} user.",
                'user_count' => $userCount,
                'can_force'  => true,
            ], 422);
        }

        if ($userCount > 0) {
            $userIds = Pengguna::where('id_cabang', $id)->pluck('id_pengguna');
            LoginLog::whereIn('user_id', $userIds)->delete();
            Pengguna::where('id_cabang', $id)->delete();
        }

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'delete_branch',
            'target_type'  => 'branch',
            'target_id'    => $cabang->id_cabang,
            'target_label' => $cabang->nama_cabang,
            'changes'      => $userCount > 0 ? ['cascade_deleted_users' => $userCount] : null,
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        $cabang->delete();

        return response()->json([
            'message' => 'Cabang berhasil dihapus.' . ($userCount > 0 ? " ({$userCount} user ikut dihapus)" : ''),
        ]);
    }
}
