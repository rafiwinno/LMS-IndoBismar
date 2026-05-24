<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table      = 'audit_logs';
    public    $timestamps = false;

    protected $fillable = [
        'user_id', 'action', 'entity_type', 'entity_id',
        'old_values', 'new_values', 'ip_address',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(Pengguna::class, 'user_id', 'id_pengguna');
    }

    public static function log(
        int    $userId,
        string $action,
        string $entityType,
        int    $entityId,
        array  $newValues = [],
        array  $oldValues = [],
        string $ipAddress = ''
    ): void {
        static::create([
            'user_id'     => $userId,
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'old_values'  => $oldValues ?: null,
            'new_values'  => $newValues ?: null,
            'ip_address'  => $ipAddress ?: null,
        ]);
    }
}
