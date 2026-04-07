<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table      = 'pengguna';
    protected $primaryKey = 'id';
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

    // Relasi ke tabel cabang
    public function cabang()
    {
        return $this->belongsTo(Cabang::class, 'id_cabang', 'id');
    }
}
