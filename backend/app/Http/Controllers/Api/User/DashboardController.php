<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $id_pengguna = $request->user()->id_pengguna;

        // Total kursus yang tersedia
        $totalKursus = DB::table('kursus')->count();

        // Total kuis yang tersedia
        $totalKuis = DB::table('kuis')->count();

        // Kuis yang sudah dikerjakan peserta
        $kuisSelesai = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->count();

        // Kuis yang belum dikerjakan
        $kuisBelum = $totalKuis - $kuisSelesai;

        // Nilai rata-rata dari attempt kuis
        $nilaiRata = DB::table('attempt_kuis')
            ->where('id_pengguna', $id_pengguna)
            ->avg('skor');

        return response()->json([
            'total_kursus'  => $totalKursus,
            'total_kuis'    => $totalKuis,
            'kuis_selesai'  => $kuisSelesai,
            'kuis_belum'    => $kuisBelum < 0 ? 0 : $kuisBelum,
            'nilai_rata_rata' => $nilaiRata ? round($nilaiRata, 2) : 0,
        ]);
    }
}