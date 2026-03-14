<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $table = 'tugas';
    protected $primaryKey = 'id_tugas';
    public $timestamps = false;

    protected $fillable = [
        'id_kursus',
        'judul_tugas',
        'deskripsi',
        'deadline',
        'nilai_maksimal',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'id_kursus');
    }
}
