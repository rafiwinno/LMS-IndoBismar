<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $table      = 'kuis';
    protected $primaryKey = 'id_kuis';
    public $timestamps    = false;

    protected $fillable = [
        'id_kursus',
        'judul_kuis',
        'waktu_mulai',
        'waktu_selesai',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'id_kursus', 'id_kursus');
    }

    public function pertanyaan()
    {
        return $this->hasMany(Question::class, 'id_kuis', 'id_kuis');
    }
}
