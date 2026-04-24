<?php

namespace App\Http\Controllers\Api\Trainer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Models\Trainer\Course;
use App\Models\Trainer\Material;
use App\Models\Trainer\Assignment;
use App\Models\Trainer\Submission;
use App\Models\Trainer\Quiz;
use App\Models\Trainer\Question;
use App\Models\AttemptKuis;
use App\Models\JawabanKuis;
use App\Models\PesertaKursus;
use App\Models\Pengguna;

class CourseController extends Controller
{
    // 1. List course milik trainer yang login
    public function index(Request $request)
    {
        $trainerId = $request->user()->id_pengguna;

        $courses = Cache::remember("trainer_courses_{$trainerId}", 60, function () use ($trainerId) {
            return Course::where('id_trainer', $trainerId)->get();
        });

        return response()->json($courses);
    }

    // 2. Buat course baru
    public function store(Request $request)
    {
        $request->validate([
            'judul_kursus'  => 'required|string|max:200',
            'deskripsi'     => 'nullable|string',
            'gambar_kursus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        $gambar = null;
        if ($request->hasFile('gambar_kursus')) {
            $gambar = $request->file('gambar_kursus')->store('kursus', 'public');
        }

        $course = Course::create([
            'id_trainer'    => $user->id_pengguna,
            'id_cabang'     => $user->id_cabang,
            'judul_kursus'  => $request->judul_kursus,
            'deskripsi'     => $request->deskripsi,
            'gambar_kursus' => $gambar,
            'status'        => 'draft',
        ]);

        Cache::forget("trainer_courses_{$user->id_pengguna}");

        return response()->json([
            'message' => 'Course berhasil dibuat',
            'data'    => $course,
        ], 201);
    }

    // 3. Detail course (dengan cek kepemilikan)
    public function show(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($course);
    }

    // 4. Update course (dengan validasi + cek kepemilikan)
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'judul_kursus'  => 'sometimes|required|string|max:200',
            'deskripsi'     => 'nullable|string',
            'gambar_kursus' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('gambar_kursus')) {
            // Hapus gambar lama
            if ($course->gambar_kursus) {
                Storage::disk('public')->delete($course->gambar_kursus);
            }
            $course->gambar_kursus = $request->file('gambar_kursus')->store('kursus', 'public');
        }

        $course->judul_kursus = $request->judul_kursus ?? $course->judul_kursus;
        $course->deskripsi    = $request->has('deskripsi') ? $request->deskripsi : $course->deskripsi;
        $course->save();

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");

        return response()->json([
            'message' => 'Course berhasil diupdate',
            'data'    => $course,
        ]);
    }

    // 5. Delete course (dengan cek kepemilikan + cascade)
    public function destroy(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hapus materi beserta file-nya
        Material::where('id_kursus', $id)->each(function ($material) {
            if ($material->file_materi && !filter_var($material->file_materi, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($material->file_materi);
            }
            $material->delete();
        });

        // Hapus submission beserta file-nya, lalu hapus tugas
        Assignment::where('id_kursus', $id)->each(function ($assignment) {
            Submission::where('id_tugas', $assignment->id_tugas)->each(function ($sub) {
                if ($sub->file_tugas) {
                    Storage::disk('public')->delete($sub->file_tugas);
                }
                $sub->delete();
            });
            if ($assignment->file_tugas) {
                Storage::disk('public')->delete($assignment->file_tugas);
            }
            $assignment->delete();
        });

        // Hapus jawaban, pilihan, attempt, lalu kuis
        Quiz::where('id_kursus', $id)->each(function ($quiz) {
            Question::where('id_kuis', $quiz->id_kuis)->each(function ($question) {
                JawabanKuis::where('id_pertanyaan', $question->id_pertanyaan)->delete();
                $question->pilihan()->delete();
                $question->delete();
            });
            AttemptKuis::where('id_kuis', $quiz->id_kuis)->delete();
            $quiz->delete();
        });

        // Hapus enrollment peserta
        PesertaKursus::where('id_kursus', $id)->delete();

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");
        $course->delete();

        return response()->json(['message' => 'Course berhasil dihapus']);
    }

    // 6. Daftar peserta yang enrolled ke course ini
    public function peserta(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $peserta = PesertaKursus::with('pengguna.dataPkl')
            ->where('id_kursus', $id)
            ->get()
            ->map(fn($pk) => [
                'id'             => $pk->pengguna->id_pengguna,
                'nama'           => $pk->pengguna->nama,
                'email'          => $pk->pengguna->email,
                'asal_sekolah'   => $pk->pengguna->dataPkl->asal_sekolah ?? null,
                'status'         => $pk->status,
                'tanggal_daftar' => $pk->tanggal_daftar,
            ]);

        return response()->json(['data' => $peserta]);
    }

    // 7. Enroll peserta ke course (trainer bisa enroll user di cabangnya)
    public function enroll(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'id_pengguna' => 'required|exists:pengguna,id_pengguna',
        ]);

        $peserta = Pengguna::where('id_pengguna', $request->id_pengguna)
            ->where('id_cabang', $request->user()->id_cabang)
            ->where('id_role', 4)
            ->first();

        if (!$peserta) {
            return response()->json(['message' => 'Peserta tidak ditemukan di cabang ini.'], 404);
        }

        $existing = PesertaKursus::where('id_kursus', $id)
            ->where('id_pengguna', $request->id_pengguna)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Peserta sudah terdaftar di kursus ini.'], 409);
        }

        PesertaKursus::create([
            'id_kursus'   => $id,
            'id_pengguna' => $request->id_pengguna,
            'status'      => 'belum_mulai',
        ]);

        return response()->json(['message' => 'Peserta berhasil didaftarkan ke kursus.'], 201);
    }

    // 8. Unenroll peserta dari course
    public function unenroll(Request $request, $id, $id_pengguna)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deleted = PesertaKursus::where('id_kursus', $id)
            ->where('id_pengguna', $id_pengguna)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Peserta tidak terdaftar di kursus ini.'], 404);
        }

        return response()->json(['message' => 'Peserta berhasil dikeluarkan dari kursus.']);
    }

    // 6. Publish course (dengan cek kepemilikan)
    public function publish(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->update(['status' => 'publish']);

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");

        return response()->json([
            'message' => 'Course berhasil dipublish',
            'data'    => $course,
        ]);
    }

    // 7. Unpublish course (kembalikan ke draft)
    public function unpublish(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        if ($course->id_trainer !== $request->user()->id_pengguna) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->update(['status' => 'draft']);

        Cache::forget("trainer_courses_{$request->user()->id_pengguna}");

        return response()->json([
            'message' => 'Course berhasil dikembalikan ke draft',
            'data'    => $course,
        ]);
    }
}