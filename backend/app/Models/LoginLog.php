<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    protected $table   = 'login_logs';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'logged_in_at',
        'logged_out_at',
    ];

    protected $casts = [
        'logged_in_at'  => 'datetime',
        'logged_out_at' => 'datetime',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'id_pengguna');
    }
}
