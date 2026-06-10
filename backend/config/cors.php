<?php

return [
    'paths' => ['api/*', 'login/*', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL'),                    // URL production (set di .env)
        'https://bismarlearning.bismareducation.com',
        'http://LMS-IndoBismar.test',
        'http://lms-indobismar.test',
        'https://LMS-IndoBismar.test',
        'https://lms-indobismar.test',
    ]),

    'allowed_origins_patterns' => env('APP_ENV') === 'local' ? [
        '#^https?://localhost:\d+$#',           // hanya aktif di local development
        '#^https?://127\.0\.0\.1:\d+$#',
    ] : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];