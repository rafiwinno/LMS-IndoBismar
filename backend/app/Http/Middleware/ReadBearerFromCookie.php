<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ReadBearerFromCookie
{
    // Jika tidak ada Authorization header, baca token dari httpOnly cookie
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->bearerToken() && $request->hasCookie('auth_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('auth_token'));
        }

        return $next($request);
    }
}
