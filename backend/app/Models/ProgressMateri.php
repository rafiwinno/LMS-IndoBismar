<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProgressMateri extends Model {
    protected $table = 'progress_materi';
    protected $primaryKey = 'id_progress';
    public $timestamps = false;
    protected $fillable = ['id_pengguna', 'id_materi', 'status', 'waktu_update'];
}
