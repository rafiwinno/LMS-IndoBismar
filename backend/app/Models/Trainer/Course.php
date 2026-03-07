<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Trainer\Material;

class Course extends Model
{
    protected $table = 'kursus';
    protected $primaryKey = 'id_kursus';
    public $timestamps = false;

    protected $fillable = [
        'id_trainer',
        'id_cabang',
        'judul_kursus',
        'deskripsi',
        'status'
    ];

    // RELASI KE TRAINER (USER)
    public function trainer()
    {
        return $this->belongsTo(User::class, 'id_trainer');
    }

    // RELASI KE MATERI
    public function materials()
    {
        return $this->hasMany(Material::class, 'id_kursus');
    }
}
