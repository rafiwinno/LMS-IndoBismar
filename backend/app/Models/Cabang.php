<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cabang extends Model
{
    protected $table      = 'cabang';
    protected $primaryKey = 'id_cabang';
    public $incrementing  = true;
    protected $keyType    = 'int';
    public $timestamps    = false;

    protected $fillable = [
        'nama_cabang',
        'kode',
        'kota',
        'alamat',
        'telepon',
        'status',
    ];

    /**
     * Semua pengguna yang terdaftar di cabang ini.
     */
    public function pengguna()
    {
        return $this->hasMany(Pengguna::class, 'id_cabang', 'id_cabang');
    }
}
