<?php
// app/Models/Pengguna.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class Pengguna extends Authenticatable
{
    use HasApiTokens;

    protected $table      = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    public $timestamps    = false;

    protected $fillable = [
        'id_role', 'id_cabang', 'nama', 'username',
        'email', 'password', 'nomor_hp', 'status',
    ];

    protected $hidden = ['password'];

    // Auto-hash password setiap kali di-set
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::needsRehash($value)
            ? Hash::make($value)
            : $value;
    }

    public function role()          { return $this->belongsTo(Role::class, 'id_role', 'id_role'); }
    public function cabang()        { return $this->belongsTo(Cabang::class, 'id_cabang', 'id_cabang'); }
    public function dataPkl()       { return $this->hasOne(DataPesertaPkl::class, 'id_pengguna', 'id_pengguna'); }
    public function pesertaKursus() { return $this->hasMany(PesertaKursus::class, 'id_pengguna', 'id_pengguna'); }
    public function kursus()        { return $this->hasMany(Kursus::class, 'id_trainer', 'id_pengguna'); }
    public function jadwal()        { return $this->hasMany(JadwalTrainer::class, 'id_trainer', 'id_pengguna'); }
    public function penilaianPkl()  { return $this->hasOne(PenilaianPkl::class, 'id_pengguna', 'id_pengguna'); }
}