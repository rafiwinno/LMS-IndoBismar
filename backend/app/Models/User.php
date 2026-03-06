<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'username',
        'email',
        'password',
        'nomor_hp',
        'id_role',
        'id_cabang'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    public function courses()
    {
        return $this->hasMany(Course::class,'id_pengguna');
    }
}
