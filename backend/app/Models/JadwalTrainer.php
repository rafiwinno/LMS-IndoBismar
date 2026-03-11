<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JadwalTrainer extends Model {
    protected $table = 'jadwal_trainer';
    protected $primaryKey = 'id_jadwal';
    public $timestamps = false;
    protected $fillable = ['id_trainer', 'id_kursus', 'tanggal', 'jam_mulai', 'jam_selesai', 'ruangan', 'tipe'];
    public function trainer() { return $this->belongsTo(Pengguna::class, 'id_trainer', 'id_pengguna'); }
    public function kursus()  { return $this->belongsTo(Kursus::class, 'id_kursus', 'id_kursus'); }
}
