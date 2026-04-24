<?php

namespace App\Http\Controllers\Api\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Cabang;
use App\Models\LoginLog;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Anggap user "online" jika login dalam 15 menit terakhir & belum logout
    private const ONLINE_THRESHOLD_MINUTES = 15;

    // GET /superadmin/users
    public function index(Request $request)
    {
        $query = Pengguna::whereIn('id_role', [2, 3, 4])
            ->with('cabang');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama',     'like', "%{$request->search}%")
                  ->orWhere('email',    'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $roleMap = ['admin' => 2, 'trainer' => 3, 'user' => 4];
            if (isset($roleMap[$request->role])) {
                $query->where('id_role', $roleMap[$request->role]);
            }
        }

        if ($request->id_cabang) {
            $query->where('id_cabang', $request->id_cabang);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ?? 10;
        $users   = $query->orderBy('id_pengguna', 'desc')->paginate($perPage);

        $userIds = $users->pluck('id_pengguna');

        // Ambil log terakhir per user — subquery untuk pastikan logged_out_at
        // berasal dari baris yang sama dengan MAX(logged_in_at)
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

        $onlineThreshold = now()->subMinutes(self::ONLINE_THRESHOLD_MINUTES);
        $roleNames = [1 => 'superadmin', 2 => 'admin', 3 => 'trainer', 4 => 'user'];

        $mapped = $users->getCollection()->map(function($u) use ($latestLogs, $onlineThreshold, $roleNames) {
            $log       = $latestLogs[$u->id_pengguna] ?? null;
            $lastLogin = $log?->last_login_at ?? null;
            $loggedOut = $log?->logged_out_at ?? null;

            // Online = punya sesi aktif (belum logout) DAN login dalam 15 menit terakhir
            $isOnline = $lastLogin
                && is_null($loggedOut)
                && \Carbon\Carbon::parse($lastLogin)->gte($onlineThreshold);

            // Kirim datetime dengan timezone offset (+07:00) agar FE tidak salah interpretasi
            $lastLoginFormatted = $lastLogin
                ? \Carbon\Carbon::parse($lastLogin)
                    ->setTimezone('Asia/Jakarta')
                    ->toIso8601String()   // "2026-03-10T11:03:04+07:00"
                : null;

            return [
                'id'          => $u->id_pengguna,
                'nama'        => $u->nama,
                'username'    => $u->username,
                'email'       => $u->email,
                'role'        => $roleNames[$u->id_role] ?? 'user',
                'id_role'     => $u->id_role,
                'id_cabang'   => $u->id_cabang,
                'nama_cabang' => $u->cabang?->nama_cabang ?? '-',
                'status'      => $u->status,
                'last_login'  => $lastLoginFormatted,
                'is_online'   => $isOnline,
            ];
        });

        return response()->json([
            'data'         => $mapped,
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
            'total'        => $users->total(),
        ]);
    }

    // POST /superadmin/users
    public function store(Request $request)
    {
        $request->validate([
            'nama'      => 'required|string|max:255',
            'username'  => 'required|string|unique:pengguna,username',
            'email'     => 'nullable|email|unique:pengguna,email',
            'password'  => 'required|string|min:6',
            'id_role'   => 'required|in:2,3,4',
            'id_cabang' => 'required|exists:cabang,id_cabang',
            'status'    => 'in:aktif,nonaktif',
        ]);

        $user = Pengguna::create([
            'nama'       => $request->nama,
            'username'   => $request->username,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'id_role'    => $request->id_role,
            'id_cabang'  => $request->id_cabang,
            'status'     => $request->status ?? 'aktif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'create_user',
            'target_type'  => 'user',
            'target_id'    => $user->id_pengguna,
            'target_label' => $user->nama,
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json(['message' => 'User berhasil dibuat.', 'user' => $user], 201);
    }

    // PUT /superadmin/users/{id}
    public function update(Request $request, $id)
    {
        $user = Pengguna::findOrFail($id);

        $request->validate([
            'nama'      => 'required|string|max:255',
            'username'  => 'required|string|unique:pengguna,username,' . $id . ',id_pengguna',
            'email'     => 'nullable|email|unique:pengguna,email,' . $id . ',id_pengguna',
            'password'  => 'nullable|string|min:6',
            'id_role'   => 'required|in:2,3,4',
            'id_cabang' => 'required|exists:cabang,id_cabang',
            'status'    => 'in:aktif,nonaktif',
        ]);

        $before = $user->only(['nama','username','email','id_role','id_cabang','status']);

        $data = [
            'nama'       => $request->nama,
            'username'   => $request->username,
            'email'      => $request->email,
            'id_role'    => $request->id_role,
            'id_cabang'  => $request->id_cabang,
            'status'     => $request->status,
            'updated_at' => now(),
        ];

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'update_user',
            'target_type'  => 'user',
            'target_id'    => $user->id_pengguna,
            'target_label' => $user->nama,
            'changes'      => ['before' => $before, 'after' => $user->only(array_keys($before))],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json(['message' => 'User berhasil diupdate.', 'user' => $user]);
    }

    // DELETE /superadmin/users/{id}
    public function destroy(Request $request, $id)
    {
        $user = Pengguna::findOrFail($id);

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'delete_user',
            'target_type'  => 'user',
            'target_id'    => $user->id_pengguna,
            'target_label' => $user->nama,
            'changes'      => ['deleted' => $user->only(['nama','username','email','id_role','id_cabang','status'])],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus.']);
    }

    // PATCH /superadmin/users/{id}/status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:aktif,nonaktif']);
        $user = Pengguna::findOrFail($id);
        $user->update(['status' => $request->status]);

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'update_user_status',
            'target_type'  => 'user',
            'target_id'    => $user->id_pengguna,
            'target_label' => $user->nama,
            'changes'      => ['status' => $request->status],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json(['message' => 'Status user berhasil diubah.']);
    }

    // POST /superadmin/users/bulk-status
    public function bulkStatus(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $ids = $request->ids;

        DB::transaction(function () use ($ids, $request) {
            Pengguna::whereIn('id_pengguna', $ids)
                ->whereIn('id_role', [2, 3, 4])
                ->update(['status' => $request->status]);
        });

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'bulk_update_status',
            'target_type'  => 'user',
            'target_id'    => null,
            'target_label' => implode(',', $ids),
            'changes'      => ['status' => $request->status, 'count' => count($ids)],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json(['message' => 'Status berhasil diubah.', 'count' => count($ids)]);
    }

    // POST /superadmin/users/bulk-delete
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $ids = $request->ids;

        DB::transaction(function () use ($ids) {
            LoginLog::whereIn('user_id', $ids)->delete();
            Pengguna::whereIn('id_pengguna', $ids)
                ->whereIn('id_role', [2, 3, 4])
                ->delete();
        });

        try { ActivityLog::create([
            'user_id'      => $request->user()?->id_pengguna,
            'action'       => 'bulk_delete_user',
            'target_type'  => 'user',
            'target_id'    => null,
            'target_label' => implode(',', $ids),
            'changes'      => ['count' => count($ids)],
            'ip_address'   => $request->ip(),
        ]); } catch (\Throwable) {}

        return response()->json(['message' => 'User berhasil dihapus.', 'count' => count($ids)]);
    }

    // GET /superadmin/branches (dropdown)
    public function branches()
    {
        return response()->json(
            Cabang::where('status', 'aktif')->select('id_cabang as id', 'nama_cabang', 'kota')->get()
        );
    }
}
