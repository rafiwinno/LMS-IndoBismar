<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table    = 'activity_logs';
    protected $fillable = [
        'user_id', 'action', 'target_type', 'target_id',
        'target_label', 'changes', 'ip_address',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'id_pengguna');
    }
}
