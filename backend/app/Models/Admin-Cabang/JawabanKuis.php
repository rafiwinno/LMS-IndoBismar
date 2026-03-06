<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JawabanKuis extends Model {
    protected $table = 'jawaban_kuis';
    protected $primaryKey = 'id_jawaban';
    public $timestamps = false;
    protected $fillable = ['id_attempt', 'id_pertanyaan', 'id_pilihan', 'jawaban_text', 'skor'];
}
