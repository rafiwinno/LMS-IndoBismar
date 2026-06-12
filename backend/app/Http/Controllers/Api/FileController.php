<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function serve(Request $request, string $path)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Link tidak valid atau sudah kadaluarsa.');
        }

        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    }
}