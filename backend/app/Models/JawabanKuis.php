<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JawabanKuis extends Model {
    protected $table = 'jawaban_kuis';
    protected $primaryKey = 'id_jawaban';
    public $timestamps = false;
    protected $fillable = ['id_attempt', 'id_pertanyaan', 'id_pilihan', 'jawaban_text', 'skor'];
    public function pertanyaan() { return $this->belongsTo(Pertanyaan::class, 'id_pertanyaan', 'id_pertanyaan'); }
    public function pilihan()    { return $this->belongsTo(PilihanJawaban::class, 'id_pilihan', 'id_pilihan'); }
}
