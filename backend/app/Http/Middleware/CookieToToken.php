<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CookieToToken
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->bearerToken() && $request->cookie('lms_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('lms_token'));
        }
        return $next($request);
    }
}