// ============================================================
// FILE: src/types/trainer.ts
// LOKASI: frontend/src/types/trainer.ts
// ============================================================
// FIX: Mengganti semua penggunaan any[] dengan interface yang
// proper agar TypeScript bisa menangkap error lebih awal.
// ============================================================

export interface Course {
  id_kursus:     number;
  id_trainer:    number;
  id_cabang:     number;
  judul_kursus:  string;
  deskripsi:     string | null;
  gambar_kursus: string | null;
  status:        'draft' | 'publish';
  dibuat_pada:   string;
}

export interface Material {
  id_materi:    number;
  id_kursus:    number;
  judul_materi: string;
  tipe_materi:  'video' | 'pdf' | 'dokumen';
  file_materi:  string | null;
  urutan:       number;
  dibuat_pada:  string;
}

export interface Assignment {
  id_tugas:       number;
  id_kursus:      number;
  judul_tugas:    string;
  deskripsi:      string | null;
  deadline:       string | null;
  nilai_maksimal: number;
  dibuat_pada:    string;
}

export interface Peserta {
  id_pengguna:   number;
  nama:          string;
  email:         string;
  nomor_hp:      string | null;
  status:        'pending' | 'aktif' | 'ditolak';
  id_cabang:     number;
}

export interface PesertaProgress {
  id:            number;
  nama:          string;
  course:        string;
  progress:      number;
  tugas_selesai: number;
  total_tugas:   number;
}

export interface Feedback {
  id:       number;
  peserta:  string;
  pesan:    string;
  tanggal:  string;
  tipe:     'positif' | 'negatif' | 'netral';
}

export interface User {
  id_pengguna: number;
  nama:        string;
  username:    string;
  email:       string | null;
  id_role:     number;
  id_cabang:   number;
  status:      string;
}
