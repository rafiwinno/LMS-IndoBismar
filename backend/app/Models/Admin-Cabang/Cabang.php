<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Cabang extends Model {
    protected $table = 'cabang';
    protected $primaryKey = 'id_cabang';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;
    protected $fillable = ['nama_cabang', 'alamat', 'kota'];
    public function pengguna() { return $this->hasMany(Pengguna::class, 'id_cabang', 'id_cabang'); }
    public function kursus()   { return $this->hasMany(Kursus::class, 'id_cabang', 'id_cabang'); }
}
