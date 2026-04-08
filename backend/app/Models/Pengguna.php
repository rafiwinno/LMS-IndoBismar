<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table      = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    public $incrementing  = true;
    protected $keyType    = 'int';
    public $timestamps    = false;

    protected $fillable = [
        'nama',
        'username',
        'email',
        'password',
        'nomor_hp',
        'id_role',
        'id_cabang',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    public function cabang()
    {
        return $this->belongsTo(Cabang::class, 'id_cabang', 'id_cabang');
    }

    public function dataPkl()
    {
        return $this->hasOne(DataPesertaPkl::class, 'id_pengguna', 'id_pengguna');
    }

    public function pesertaKursus()
    {
        return $this->hasMany(PesertaKursus::class, 'id_pengguna', 'id_pengguna');
    }

    // Kursus yang diajar trainer ini
    public function kursus()
    {
        return $this->hasMany(Kursus::class, 'id_trainer', 'id_pengguna');
    }

    // Jadwal trainer
    public function jadwal()
    {
        return $this->hasMany(JadwalTrainer::class, 'id_trainer', 'id_pengguna');
    }

    public function penilaianPkl()
    {
        return $this->hasOne(PenilaianPkl::class, 'id_pengguna', 'id_pengguna');
    }
}
