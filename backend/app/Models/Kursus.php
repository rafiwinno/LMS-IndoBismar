<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kursus extends Model {
    protected $table = 'kursus';
    protected $primaryKey = 'id_kursus';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;
    protected $fillable = ['id_trainer', 'id_cabang', 'judul_kursus', 'deskripsi', 'status'];
    public function trainer()       { return $this->belongsTo(Pengguna::class, 'id_trainer', 'id_pengguna'); }
    public function cabang()        { return $this->belongsTo(Cabang::class, 'id_cabang', 'id_cabang'); }
    public function pesertaKursus() { return $this->hasMany(PesertaKursus::class, 'id_kursus', 'id_kursus'); }
    public function materi()        { return $this->hasMany(Materi::class, 'id_kursus', 'id_kursus')->orderBy('urutan'); }
    public function tugas()         { return $this->hasMany(Tugas::class, 'id_kursus', 'id_kursus'); }
    public function kuis()          { return $this->hasMany(Kuis::class, 'id_kursus', 'id_kursus'); }
}
