<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $table      = 'otp_codes';
    public    $timestamps = false;

    protected $fillable = [
        'user_id', 'code', 'expires_at', 'used', 'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];
}
