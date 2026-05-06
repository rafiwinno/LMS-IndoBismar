<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class FileValidator
{
    // Mapping ekstensi → MIME type nyata (dari isi file, bukan ekstensi)
    private static array $MIME_MAP = [
        'application/pdf'    => ['pdf'],
        'application/vnd.ms-powerpoint'
            => ['ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            => ['pptx'],
        'application/msword'
            => ['doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            => ['docx'],
        'application/vnd.ms-excel'
            => ['xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            => ['xlsx'],
        // Office Open XML (format baru MS Office)
        'application/zip'
            => ['docx', 'xlsx', 'pptx'], // OOXML berbasis ZIP — hanya izinkan jika ekstensi cocok
    ];

    /**
     * Validasi file menggunakan finfo (cek isi file, bukan hanya ekstensi).
     * Mengembalikan true jika MIME nyata file sesuai dengan ekstensi yang diizinkan.
     */
    public static function validate(UploadedFile $file, array $allowedExtensions): bool
    {
        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $realMime = $finfo->file($file->getRealPath());
        $ext      = strtolower($file->getClientOriginalExtension());

        // Khusus untuk file ZIP: hanya izinkan jika ekstensi adalah docx/xlsx/pptx
        if ($realMime === 'application/zip') {
            return in_array($ext, ['docx', 'xlsx', 'pptx']) && in_array($ext, $allowedExtensions);
        }

        $allowedMimes = [];
        foreach (self::$MIME_MAP as $mime => $exts) {
            if (array_intersect($exts, $allowedExtensions)) {
                $allowedMimes[] = $mime;
            }
        }

        return in_array($realMime, $allowedMimes);
    }

    /**
     * Validasi khusus untuk PDF (digunakan untuk dokumen surat PKL).
     * Lebih ketat: cek magic bytes %PDF di awal file.
     */
    public static function isPdf(UploadedFile $file): bool
    {
        $handle = fopen($file->getRealPath(), 'rb');
        if (!$handle) return false;
        $header = fread($handle, 5);
        fclose($handle);
        return $header === '%PDF-';
    }

    public static function getRealMime(UploadedFile $file): string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        return $finfo->file($file->getRealPath());
    }
}
