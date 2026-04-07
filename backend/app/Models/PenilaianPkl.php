<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PenilaianPkl extends Model {
    protected $table = 'penilaian_pkl';
    protected $primaryKey = 'id_penilaian';
    public $timestamps = false;
    protected $fillable = ['id_pengguna', 'nilai_teknis', 'nilai_non_teknis', 'nilai_akhir', 'catatan', 'dinilai_oleh', 'tanggal_penilaian'];
}
