<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table      = 'pertanyaan';
    protected $primaryKey = 'id_pertanyaan';
    public $timestamps    = false;

    protected $fillable = [
        'id_kuis',
        'pertanyaan',
        'tipe',
        'bobot_nilai',
    ];

    public function pilihan()
    {
        return $this->hasMany(Choice::class, 'id_pertanyaan', 'id_pertanyaan');
    }
}
