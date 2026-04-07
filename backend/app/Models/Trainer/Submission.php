<?php

namespace App\Models\Trainer;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Submission extends Model
{
    protected $table      = 'pengumpulan_tugas';
    protected $primaryKey = 'id_pengumpulan';
    public $timestamps    = false;

    protected $fillable = [
        'id_tugas',
        'id_pengguna',
        'file_tugas',
        'tanggal_kumpul',
        'nilai',
        'feedback',
    ];

    public function peserta()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }

    public function tugas()
    {
        return $this->belongsTo(Assignment::class, 'id_tugas', 'id_tugas');
    }
}
