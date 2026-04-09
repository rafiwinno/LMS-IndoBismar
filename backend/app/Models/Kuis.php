<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kuis extends Model {
    protected $table = 'kuis';
    protected $primaryKey = 'id_kuis';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;
    protected $fillable = ['id_kursus', 'judul_kuis', 'waktu_mulai', 'waktu_selesai'];
    protected $casts = ['waktu_mulai' => 'datetime', 'waktu_selesai' => 'datetime'];
    public function kursus()      { return $this->belongsTo(Kursus::class, 'id_kursus', 'id_kursus'); }
    public function pertanyaan()  { return $this->hasMany(Pertanyaan::class, 'id_kuis', 'id_kuis'); }
    public function attemptKuis() { return $this->hasMany(AttemptKuis::class, 'id_kuis', 'id_kuis'); }
}
