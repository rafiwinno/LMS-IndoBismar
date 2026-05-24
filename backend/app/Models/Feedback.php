<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table      = 'feedback';
    protected $primaryKey = 'id_feedback';
    public $timestamps    = false;

    protected $fillable = [
        'id_trainer',
        'id_peserta',
        'id_kursus',
        'pesan',
        'tipe',
        'dibuat_pada',
    ];

    protected $casts = [
        'dibuat_pada' => 'datetime',
    ];

    public function trainer()
    {
        return $this->belongsTo(Pengguna::class, 'id_trainer', 'id_pengguna');
    }

    public function peserta()
    {
        return $this->belongsTo(Pengguna::class, 'id_peserta', 'id_pengguna');
    }

    public function kursus()
    {
        return $this->belongsTo(\App\Models\Kursus::class, 'id_kursus', 'id_kursus');
    }
}
