<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'kursus';

    protected $primaryKey = 'id_kursus';

    protected $fillable = [
        'id_trainer',
        'id_cabang',
        'judul_kursus',
        'deskripsi',
        'status'
    ];
}
