<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TugasController extends Controller
{
    // Semua tugas dari kursus yang diikuti peserta
    public function index(Request $request)
    {
        $id_pengguna = $request->id_pengguna;

        $tugas = DB::table('tugas')
            ->join('peserta_kursus', 'tugas.id_kursus', '=', 'peserta_kursus.id_kursus')
            ->join('kursus', 'tugas.id_kursus', '=', 'kursus.id_kursus')
            ->leftJoin('pengumpulan_tugas', function ($join) use ($id_pengguna) {
                $join->on('pengumpulan_tugas.id_tugas', '=', 'tugas.id_tugas')
                     ->where('pengumpulan_tugas.id_pengguna', '=', $id_pengguna);
            })
            ->where('peserta_kursus.id_pengguna', $id_pengguna)
            ->select(
                'tugas.id_tugas',
                'tugas.judul_tugas',
                'tugas.deskripsi',
                'tugas.deadline',
                'tugas.nilai_maksimal',
                'kursus.judul_kursus',
                'pengumpulan_tugas.id_pengumpulan',
                'pengumpulan_tugas.nilai',
                DB::raw('CASE WHEN pengumpulan_tugas.id_pengumpulan IS NOT NULL THEN "sudah" ELSE "belum" END as status_pengumpulan')
            )
            ->get();

        return response()->json(['data' => $tugas]);
    }

    // Detail satu tugas
    public function show($id_tugas)
    {
        $tugas = DB::table('tugas')
            ->join('kursus', 'tugas.id_kursus', '=', 'kursus.id_kursus')
            ->where('tugas.id_tugas', $id_tugas)
            ->select('tugas.*', 'kursus.judul_kursus')
            ->first();

        if (!$tugas) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        return response()->json(['data' => $tugas]);
    }
}