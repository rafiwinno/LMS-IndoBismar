# LOGBOOK KEGIATAN MAGANG / PKL
**PT. Indo Bismar – LMS IndoBismar (Modul Admin Cabang)**

Nama: Hardy Gustino | NIM: [NIM] | Periode: 2 Maret – 2 Juni 2025
Program Studi Informatika – UPN "Veteran" Jawa Timur

---

## MINGGU KE-1 | 3 – 8 Maret 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 3 Mar 2025 | Senin | 08.00 | 16.00 | Pengenalan lingkungan kerja, orientasi tim, dan penjelasan struktur organisasi PT. Indo Bismar |
| 2 | 4 Mar 2025 | Selasa | 08.00 | 16.00 | Pengenalan alur kerja divisi, perkenalan dengan tools dan sistem yang digunakan di perusahaan |
| 3 | 5 Mar 2025 | Rabu | 08.00 | 16.00 | Menerima dan mempelajari project brief LMS-IndoBismar, memahami scope dan tujuan proyek |
| 4 | 6 Mar 2025 | Kamis | 08.00 | 16.00 | Diskusi lanjutan terkait project brief, identifikasi kebutuhan sistem dan pembagian tanggung jawab |
| 5 | 7 Mar 2025 | Jumat | 08.00 | 16.00 | Penyusunan rencana kerja awal berdasarkan project brief, persiapan environment pengembangan |
| 6 | 8 Mar 2025 | Sabtu | 08.00 | 13.00 | Finalisasi pemahaman project brief, diskusi teknis stack yang akan digunakan (Laravel + React) |

---

## MINGGU KE-2 | 10 – 15 Maret 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 10 Mar 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur autentikasi Admin Cabang, perancangan alur login dua faktor dengan OTP via email |
| 2 | 11 Mar 2025 | Selasa | 08.00 | 16.00 | Perancangan struktur endpoint autentikasi: login admin, verify-otp, refresh token, dan logout |
| 3 | 12 Mar 2025 | Rabu | 08.00 | 16.00 | Implementasi endpoint POST /auth/login-admin: validasi kredensial username/password dan generate OTP |
| 4 | 13 Mar 2025 | Kamis | 08.00 | 16.00 | Implementasi pengiriman OTP via email, endpoint POST /auth/verify-otp, dan mekanisme expiry OTP |
| 5 | 14 Mar 2025 | Jumat | 08.00 | 16.00 | Implementasi token refresh 2 jam, endpoint logout single sesi dan logout semua perangkat |
| 6 | 15 Mar 2025 | Sabtu | 08.00 | 13.00 | Testing seluruh alur autentikasi OTP, penyesuaian response format dan penanganan error |

---

## MINGGU KE-3 | 17 – 22 Maret 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 17 Mar 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan Dashboard Admin Cabang, perancangan endpoint GET /dashboard dan struktur KPI Cards |
| 2 | 18 Mar 2025 | Selasa | 08.00 | 16.00 | Perancangan struktur data 5 KPI Cards: total peserta, total kursus, total materi, total tugas, rata-rata nilai kuis |
| 3 | 19 Mar 2025 | Rabu | – | – | – |
| 4 | 20 Mar 2025 | Kamis | – | – | – |
| 5 | 21 Mar 2025 | Jumat | – | – | – |
| 6 | 22 Mar 2025 | Sabtu | – | – | – |

---

## MINGGU KE-4 | 24 – 29 Maret 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 24 Mar 2025 | Senin | – | – | – |
| 2 | 25 Mar 2025 | Selasa | – | – | – |
| 3 | 26 Mar 2025 | Rabu | 08.00 | 16.00 | Implementasi query agregasi data dashboard: total peserta aktif, kursus aktif, materi, dan rata-rata nilai kuis |
| 4 | 27 Mar 2025 | Kamis | 08.00 | 16.00 | Pengembangan grafik tren penyelesaian kuis mingguan (7 hari) dan grafik tingkat penyelesaian kursus |
| 5 | 28 Mar 2025 | Jumat | 08.00 | 16.00 | Implementasi grafik akses materi harian dan activity feed terbaru: submit tugas, kuis selesai, upload dokumen |
| 6 | 29 Mar 2025 | Sabtu | 08.00 | 13.00 | Testing menyeluruh modul Dashboard, finalisasi format respons API dan dokumentasi endpoint dashboard |

---

## MINGGU KE-5 | 31 Maret – 5 April 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 31 Mar 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Peserta, perancangan endpoint GET/POST /peserta dan struktur data |
| 2 | 1 Apr 2025 | Selasa | 08.00 | 16.00 | Implementasi tabel daftar peserta dengan pagination dan filter status (semua/pending) |
| 3 | 2 Apr 2025 | Rabu | 08.00 | 16.00 | Pengembangan fitur pencarian peserta berdasarkan nama, email, dan asal sekolah dengan debounce 300ms |
| 4 | 3 Apr 2025 | Kamis | 08.00 | 16.00 | Implementasi form tambah peserta: nama, tanggal lahir, email, nomor HP, asal sekolah, jurusan, periode PKL |
| 5 | 4 Apr 2025 | Jumat | 08.00 | 16.00 | Pengembangan fitur edit peserta dengan prefill data dan endpoint PUT /peserta/{id} |
| 6 | 5 Apr 2025 | Sabtu | 08.00 | 13.00 | Implementasi hapus peserta (soft delete) dengan konfirmasi dialog dan proteksi double-click |

---

## MINGGU KE-6 | 7 – 12 April 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 7 Apr 2025 | Senin | 08.00 | 16.00 | Implementasi update status peserta: pending → aktif/ditolak dengan endpoint PATCH /peserta/{id}/status |
| 2 | 8 Apr 2025 | Selasa | 08.00 | 16.00 | Pengembangan alur verifikasi dokumen PKL peserta (surat siswa dan surat ortu) dengan endpoint PATCH /peserta/{id}/verifikasi-dokumen |
| 3 | 9 Apr 2025 | Rabu | 08.00 | 16.00 | Implementasi secure document viewer untuk review file PDF dokumen PKL dengan kontrol akses berbasis cabang |
| 4 | 10 Apr 2025 | Kamis | 08.00 | 16.00 | Implementasi bulk import peserta dari CSV: generate username otomatis dari nama depan dan password dari tanggal lahir |
| 5 | 11 Apr 2025 | Jumat | 08.00 | 16.00 | Pengembangan download template CSV dan laporan hasil import dengan detail sukses/gagal per baris data |
| 6 | 12 Apr 2025 | Sabtu | 08.00 | 13.00 | Testing menyeluruh fitur Manajemen Peserta, finalisasi modul dan dokumentasi endpoint peserta |

---

## MINGGU KE-7 | 14 – 19 April 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 14 Apr 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Kursus, perancangan endpoint GET/POST /kursus dan struktur data |
| 2 | 15 Apr 2025 | Selasa | 08.00 | 16.00 | Implementasi daftar kursus per cabang dengan informasi nama, deskripsi, trainer pengempu, dan status |
| 3 | 16 Apr 2025 | Rabu | 08.00 | 16.00 | Pengembangan form tambah kursus: nama, deskripsi, pilihan trainer dalam cabang, status (draft/aktif/nonaktif) |
| 4 | 17 Apr 2025 | Kamis | 08.00 | 16.00 | Implementasi fitur edit kursus dengan concurrency control (timestamp checking) dan validasi trainer satu cabang |
| 5 | 18 Apr 2025 | Jumat | 08.00 | 16.00 | Pengembangan manajemen enrollment: daftarkan/keluarkan peserta dari kursus via endpoint POST/DELETE /kursus/{id}/enroll |
| 6 | 19 Apr 2025 | Sabtu | 08.00 | 13.00 | Testing fitur Manajemen Kursus, perbaikan bug dan edge case, finalisasi modul dan review kode |

---

## MINGGU KE-8 | 21 – 26 April 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 21 Apr 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Materi, perancangan endpoint GET/POST /materi dan tipe konten yang didukung |
| 2 | 22 Apr 2025 | Selasa | 08.00 | 16.00 | Implementasi daftar materi per kursus dengan filter kursus, pencarian, dan informasi ukuran file |
| 3 | 23 Apr 2025 | Rabu | 08.00 | 16.00 | Pengembangan form upload materi tipe file (PDF, PPT, DOC, XLS) dengan validasi MIME type berbasis magic bytes |
| 4 | 24 Apr 2025 | Kamis | 08.00 | 16.00 | Implementasi materi tipe YouTube: ekstraksi video ID dari URL dan tampilan embed preview di frontend |
| 5 | 25 Apr 2025 | Jumat | 08.00 | 16.00 | Pengembangan materi tipe Google Drive link dan fitur hapus materi dengan konfirmasi |
| 6 | 26 Apr 2025 | Sabtu | 08.00 | 13.00 | Testing fitur Manajemen Materi, validasi keamanan upload file, finalisasi modul dan dokumentasi endpoint |

---

## MINGGU KE-9 | 28 April – 3 Mei 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 28 Apr 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Tugas, perancangan endpoint GET/POST /tugas dan alur pengumpulan |
| 2 | 29 Apr 2025 | Selasa | 08.00 | 16.00 | Implementasi daftar tugas per kursus dengan deadline tracking dan indikator status Aktif/Selesai |
| 3 | 30 Apr 2025 | Rabu | 08.00 | 16.00 | Pengembangan form tambah/edit tugas dengan validasi deadline harus di masa depan |
| 4 | 1 Mei 2025 | Kamis | – | – | – |
| 5 | 2 Mei 2025 | Jumat | 08.00 | 16.00 | Implementasi panel pengumpulan tugas peserta: lihat file submission, tanggal pengumpulan, dan status nilai |
| 6 | 3 Mei 2025 | Sabtu | 08.00 | 13.00 | Pengembangan fitur penilaian tugas: input nilai numerik dan feedback, endpoint PATCH /tugas/submissions/{id}/grade |

---

## MINGGU KE-10 | 5 – 10 Mei 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 5 Mei 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Kuis, perancangan endpoint GET/POST /kuis dan tipe soal yang didukung |
| 2 | 6 Mei 2025 | Selasa | 08.00 | 16.00 | Implementasi daftar kuis per kursus dengan informasi waktu mulai/selesai dan jumlah soal |
| 3 | 7 Mei 2025 | Rabu | 08.00 | 16.00 | Pengembangan form buat kuis dengan pengaturan waktu mulai/selesai menggunakan komponen custom TimePickerRoll |
| 4 | 8 Mei 2025 | Kamis | 08.00 | 16.00 | Implementasi question builder: soal pilihan ganda (4 opsi, min. 1 jawaban benar) dan soal esai dengan bobot nilai |
| 5 | 9 Mei 2025 | Jumat | 08.00 | 16.00 | Pengembangan fitur hasil kuis: daftar peserta dengan skor, detail jawaban per attempt, dan rekap nilai |
| 6 | 10 Mei 2025 | Sabtu | 08.00 | 13.00 | Implementasi penilaian soal esai: tampil jawaban peserta, input nilai, endpoint PATCH /kuis/attempts/{id}/grade-essay |

---

## MINGGU KE-11 | 12 – 17 Mei 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 12 Mei 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Trainer, perancangan endpoint GET/POST /trainer dan struktur jadwal |
| 2 | 13 Mei 2025 | Selasa | 08.00 | 16.00 | Implementasi daftar trainer per cabang dengan pencarian, filter status, dan indikator kursus yang diajar |
| 3 | 14 Mei 2025 | Rabu | 08.00 | 16.00 | Pengembangan form tambah/edit trainer: nama, email, nomor HP, status aktif/nonaktif, dan validasi data |
| 4 | 15 Mei 2025 | Kamis | 08.00 | 16.00 | Implementasi modal detail trainer: informasi lengkap, daftar kursus yang diajar, dan riwayat jadwal |
| 5 | 16 Mei 2025 | Jumat | 08.00 | 16.00 | Pengembangan fitur Jadwal Trainer: buat/edit/hapus jadwal dengan tanggal, waktu, ruang, dan tipe Online/Offline |
| 6 | 17 Mei 2025 | Sabtu | 08.00 | 13.00 | Testing seluruh fitur Manajemen Trainer dan Jadwal, perbaikan bug, finalisasi modul dan dokumentasi endpoint |

---

## MINGGU KE-12 | 19 – 24 Mei 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 19 Mei 2025 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Laporan, perancangan 4 tab: Peserta, Kursus, Kuis, Trainer dengan endpoint GET /laporan |
| 2 | 20 Mei 2025 | Selasa | 08.00 | 16.00 | Implementasi dashboard chart laporan: grafik pertumbuhan peserta 12 bulan dan grafik penyelesaian kursus bulanan |
| 3 | 21 Mei 2025 | Rabu | 08.00 | 16.00 | Pengembangan laporan Peserta: progress kursus, status dokumen, dan ekspor CSV sesuai filter aktif |
| 4 | 22 Mei 2025 | Kamis | 08.00 | 16.00 | Implementasi laporan Kursus, Kuis, dan Trainer dengan statistik completion rate, rata-rata skor, dan ekspor CSV |
| 5 | 23 Mei 2025 | Jumat | 08.00 | 16.00 | Pengembangan sistem notifikasi: GET /notifikasi, tandai dibaca satu/semua, dan badge jumlah notifikasi belum dibaca |
| 6 | 24 Mei 2025 | Sabtu | 08.00 | 13.00 | Integrasi frontend-backend seluruh modul Admin Cabang: validasi alur data dan konsistensi tampilan antarmuka |

---

## MINGGU KE-13 | 26 – 31 Mei 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 26 Mei 2025 | Senin | 08.00 | 16.00 | Pengujian end-to-end seluruh alur Admin Cabang: dari login OTP hingga operasi laporan dan notifikasi |
| 2 | 27 Mei 2025 | Selasa | 08.00 | 16.00 | Audit keamanan autentikasi OTP, validasi middleware role, dan proteksi isolasi data berbasis cabang |
| 3 | 28 Mei 2025 | Rabu | 08.00 | 16.00 | Audit input validation: SQL injection, XSS, mass assignment, dan validasi MIME type pada upload file materi/dokumen |
| 4 | 29 Mei 2025 | Kamis | – | – | – |
| 5 | 30 Mei 2025 | Jumat | 08.00 | 16.00 | Perbaikan bug hasil audit, optimasi query N+1, eager loading, dan performa auto-refresh dashboard 30 detik |
| 6 | 31 Mei 2025 | Sabtu | 08.00 | 13.00 | Finalisasi seluruh modul Admin Cabang, penyusunan laporan akhir magang dan dokumentasi teknis |

---

## MINGGU KE-14 | 2 Juni 2025

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 2 Jun 2025 | Senin | 08.00 | 16.00 | Hari terakhir magang: pengumpulan berkas administrasi, perpisahan resmi dengan seluruh tim PT. Indo Bismar |
