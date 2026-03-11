<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AttemptKuis extends Model {
    protected $table = 'attempt_kuis';
    protected $primaryKey = 'id_attempt';
    public $timestamps = false;
    protected $fillable = ['id_kuis', 'id_pengguna', 'waktu_mulai', 'waktu_selesai', 'skor', 'status'];
    public function pengguna()    { return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna'); }
    public function kuis()        { return $this->belongsTo(Kuis::class, 'id_kuis', 'id_kuis'); }
    public function jawabanKuis() { return $this->hasMany(JawabanKuis::class, 'id_attempt', 'id_attempt'); }
}
