<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PesertaKursus extends Model {
    protected $table = 'peserta_kursus';
    protected $primaryKey = 'id_peserta_kursus';
    public $timestamps = false;
    protected $fillable = ['id_pengguna', 'id_kursus', 'status', 'tanggal_daftar'];
    protected $casts = ['tanggal_daftar' => 'datetime'];
    public function pengguna() { return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna'); }
    public function kursus()   { return $this->belongsTo(Kursus::class, 'id_kursus', 'id_kursus'); }
}
