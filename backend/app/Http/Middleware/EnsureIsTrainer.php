<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureIsTrainer
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->id_role !== 3) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya trainer yang dapat mengakses endpoint ini.',
            ], 403);
        }

        return $next($request);
    }
}
