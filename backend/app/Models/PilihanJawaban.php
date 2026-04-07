<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PilihanJawaban extends Model {
    protected $table = 'pilihan_jawaban';
    protected $primaryKey = 'id_pilihan';
    public $timestamps = false;
    protected $fillable = ['id_pertanyaan', 'teks_jawaban', 'benar'];
    protected $casts = ['benar' => 'boolean'];
}
