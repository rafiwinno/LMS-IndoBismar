<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;

class Choice extends Model
{
    protected $table      = 'pilihan_jawaban';
    protected $primaryKey = 'id_pilihan';
    public $timestamps    = false;

    protected $fillable = [
        'id_pertanyaan',
        'teks_jawaban',
        'benar',
    ];
}
