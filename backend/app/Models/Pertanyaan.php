<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Pertanyaan extends Model {
    protected $table = 'pertanyaan';
    protected $primaryKey = 'id_pertanyaan';
    public $timestamps = false;
    protected $fillable = ['id_kuis', 'pertanyaan', 'tipe', 'bobot_nilai'];
    public function kuis()           { return $this->belongsTo(Kuis::class, 'id_kuis', 'id_kuis'); }
    public function pilihanJawaban() { return $this->hasMany(PilihanJawaban::class, 'id_pertanyaan', 'id_pertanyaan'); }
    public function jawabanKuis()    { return $this->hasMany(JawabanKuis::class, 'id_pertanyaan', 'id_pertanyaan'); }
}
