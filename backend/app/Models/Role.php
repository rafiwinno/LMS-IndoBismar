<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Role extends Model {
    protected $table = 'role';
    protected $primaryKey = 'id_role';
    public $timestamps = false;
    protected $fillable = ['nama_role'];
}
