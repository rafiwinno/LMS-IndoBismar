<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureIsAdmin
{
    // id_role yang boleh akses panel admin:
    // 1 = superadmin, 2 = admin, 3 = trainer
    private const ALLOWED_ROLES = [1, 2, 3];

    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Jika ada role spesifik yang diberikan via parameter middleware
        if (! empty($roles)) {
            $allowedIds = array_map('intval', $roles);
        } else {
            $allowedIds = self::ALLOWED_ROLES;
        }

        if (! in_array($user->id_role, $allowedIds)) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses panel ini.',
            ], 403);
        }

        return $next($request);
    }
}
