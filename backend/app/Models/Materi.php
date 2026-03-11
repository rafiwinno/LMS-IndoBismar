<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Materi extends Model {
    protected $table = 'materi';
    protected $primaryKey = 'id_materi';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;
    protected $fillable = ['id_kursus', 'judul_materi', 'tipe_materi', 'file_materi', 'urutan'];
    public function kursus()   { return $this->belongsTo(Kursus::class, 'id_kursus', 'id_kursus'); }
    public function progress() { return $this->hasMany(ProgressMateri::class, 'id_materi', 'id_materi'); }
}
