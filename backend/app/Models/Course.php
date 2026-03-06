<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'kursus';
    protected $primaryKey = 'id_kursus';

    public $timestamps = false;

    protected $fillable = [
        'id_pengguna',
        'id_cabang',
        'judul_kursus',
        'deskripsi',
        'status'
    ];

    public function trainer()
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }
}
