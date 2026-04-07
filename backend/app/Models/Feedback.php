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

    // Relasi ke trainer
    public function trainer()
    {
        return $this->belongsTo(User::class, 'id_trainer', 'id_pengguna');
    }

    // Relasi ke peserta
    public function peserta()
    {
        return $this->belongsTo(User::class, 'id_peserta', 'id_pengguna');
    }

    // Tambahkan relasi ini di Feedback.php
    public function kursus()
    {
        return $this->belongsTo(\App\Models\Trainer\Course::class, 'id_kursus', 'id_kursus');
    }
}
