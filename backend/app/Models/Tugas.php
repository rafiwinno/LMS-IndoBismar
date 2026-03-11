<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model {
    protected $table = 'tugas';
    protected $primaryKey = 'id_tugas';
    public $timestamps = false;
    protected $fillable = ['id_kursus', 'judul_tugas', 'deskripsi', 'deadline'];
    protected $casts = ['deadline' => 'datetime'];
    public function kursus()      { return $this->belongsTo(Kursus::class, 'id_kursus', 'id_kursus'); }
    public function pengumpulan() { return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas'); }
}
