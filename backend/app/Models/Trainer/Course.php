<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Trainer\Material;

class Course extends Model
{
    protected $table      = 'kursus';
    protected $primaryKey = 'id_kursus';
    public $timestamps    = false;

    protected $fillable = [
        'id_trainer',   // FIX: sebelumnya salah tulis 'id_pengguna', padahal kolom di DB adalah id_trainer
        'id_cabang',
        'judul_kursus',
        'deskripsi',
        'gambar_kursus',
        'status',
    ];

    // RELASI KE TRAINER (USER) — FIX: sesuaikan foreign key dengan kolom DB
    public function trainer()
    {
        return $this->belongsTo(User::class, 'id_trainer', 'id_pengguna');
    }

    // RELASI KE MATERI
    public function materials()
    {
        return $this->hasMany(Material::class, 'id_kursus', 'id_kursus');
    }

    // RELASI KE TUGAS
    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'id_kursus', 'id_kursus');
    }
}
