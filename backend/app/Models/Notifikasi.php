<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table      = 'notifikasi';
    protected $primaryKey = 'id_notif';
    public $timestamps    = false;

    protected $fillable = [
        'id_penerima', 'judul', 'pesan', 'tipe', 'id_referensi', 'dibaca',
    ];

    protected $casts = [
        'dibaca'     => 'boolean',
        'dibuat_pada' => 'datetime',
    ];

    public function penerima() { return $this->belongsTo(Pengguna::class, 'id_penerima', 'id_pengguna'); }
}
