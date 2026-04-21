<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, int $role): mixed
    {
        if ($request->user()?->id_role !== $role) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return $next($request);
    }
}