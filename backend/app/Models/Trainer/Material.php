<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $table = 'materi';
    protected $primaryKey = 'id_materi';
    public $timestamps = false;

    protected $casts = [
        'dibuat_pada' => 'datetime',
    ];

    protected $fillable = [
        'id_kursus',
        'judul_materi',
        'tipe_materi',
        'file_materi',
        'urutan',
        'sub_bab',
    ];
}
