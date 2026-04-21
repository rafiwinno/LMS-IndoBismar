<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table      = 'notifikasi';
    protected $primaryKey = 'id_notifikasi';
    public    $timestamps = false;

    protected $fillable = [
        'id_penerima',
        'judul',
        'pesan',
        'tipe',
        'id_referensi',
        'dibaca',
        'dibuat_pada',
    ];
}