<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Trainer\Course;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table      = 'pengguna';
    protected $primaryKey = 'id_pengguna';
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
        'remember_token',
    ];

    // FIX: ganti id_pengguna → id_trainer
    public function courses()
    {
        return $this->hasMany(Course::class, 'id_trainer', 'id_pengguna');
    }
}
