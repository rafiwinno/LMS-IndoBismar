<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PengumpulanTugas extends Model {
    protected $table = 'pengumpulan_tugas';
    protected $primaryKey = 'id_pengumpulan';
    public $timestamps = false;
    protected $fillable = ['id_tugas', 'id_pengguna', 'file_tugas', 'tanggal_kumpul', 'nilai', 'feedback'];
    public function pengguna() { return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna'); }
    public function tugas()    { return $this->belongsTo(Tugas::class, 'id_tugas', 'id_tugas'); }
}
