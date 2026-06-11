<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->alias([
            'ensure.admin'   => \App\Http\Middleware\EnsureIsAdmin::class,
            'ensure.trainer' => \App\Http\Middleware\EnsureIsTrainer::class,
            'ensure.peserta' => \App\Http\Middleware\EnsureIsPeserta::class,
            'admin'          => \App\Http\Middleware\EnsureIsAdmin::class,
            'role'           => \App\Http\Middleware\CheckRole::class,
        ]);
        // Baca auth_token cookie sebelum Sanctum, agar httpOnly cookie bisa dipakai sebagai Bearer token
        $middleware->api(prepend: [
            \App\Http\Middleware\ReadBearerFromCookie::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated. Silakan login terlebih dahulu.'
                ], 401);
            }
        });
        $exceptions->render(function (RouteNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated. Silakan login terlebih dahulu.'
                ], 401);
            }
        });
        $exceptions->render(function (ThrottleRequestsException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.',
                    'retry_after' => $e->getHeaders()['Retry-After'] ?? 60,
                ], 429);
            }
        });
    })->create();
