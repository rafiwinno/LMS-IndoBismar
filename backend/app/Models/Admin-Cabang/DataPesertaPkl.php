<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DataPesertaPkl extends Model {
    protected $table = 'data_peserta_pkl';
    protected $primaryKey = 'id_data';
    public $timestamps = false;
    protected $fillable = ['id_pengguna', 'asal_sekolah', 'jurusan', 'periode_mulai', 'periode_selesai'];
    public function pengguna() { return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna'); }
}
