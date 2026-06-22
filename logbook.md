# LOGBOOK KEGIATAN MAGANG / PKL
**PT. Indo Bismar – LMS IndoBismar (Modul Admin Cabang)**

Nama: Hardy Gustino | NIM: [NIM] | Periode: 2 Maret – 2 Juni 2026
Program Studi Informatika – UPN "Veteran" Jawa Timur

---

## MINGGU KE-1 | 2 – 7 Maret 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 2 Mar 2026 | Senin | 08.00 | 16.00 | Pengenalan lingkungan kerja, orientasi tim, dan penjelasan struktur organisasi PT. Indo Bismar |
| 2 | 3 Mar 2026 | Selasa | 08.00 | 16.00 | Pengenalan alur kerja divisi, perkenalan dengan tools dan sistem yang digunakan di perusahaan |
| 3 | 4 Mar 2026 | Rabu | 08.00 | 16.00 | Menerima dan mempelajari project brief LMS-IndoBismar, memahami scope dan tujuan proyek |
| 4 | 5 Mar 2026 | Kamis | 08.00 | 16.00 | Diskusi lanjutan terkait project brief, identifikasi kebutuhan sistem dan pembagian tanggung jawab |
| 5 | 6 Mar 2026 | Jumat | 08.00 | 16.00 | Penyusunan rencana kerja awal berdasarkan project brief, persiapan environment pengembangan |
| 6 | 7 Mar 2026 | Sabtu | 08.00 | 13.00 | Finalisasi pemahaman project brief, diskusi teknis stack yang akan digunakan (Laravel + React) |

---

## MINGGU KE-2 | 9 – 14 Maret 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 9 Mar 2026 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur autentikasi Admin Cabang, perancangan alur login dua faktor dengan OTP via email |
| 2 | 10 Mar 2026 | Selasa | 08.00 | 16.00 | Perancangan struktur endpoint autentikasi: login admin, verify-otp, refresh token, dan logout |
| 3 | 11 Mar 2026 | Rabu | 08.00 | 16.00 | Implementasi endpoint POST /auth/login-admin: validasi kredensial username/password dan generate OTP |
| 4 | 12 Mar 2026 | Kamis | 08.00 | 16.00 | Implementasi pengiriman OTP via email, endpoint POST /auth/verify-otp, dan mekanisme expiry OTP |
| 5 | 13 Mar 2026 | Jumat | 08.00 | 16.00 | Implementasi token refresh 2 jam, endpoint logout single sesi dan logout semua perangkat |
| 6 | 14 Mar 2026 | Sabtu | 08.00 | 13.00 | Testing seluruh alur autentikasi OTP, penyesuaian response format dan penanganan error |

---

## MINGGU KE-3 | 16 – 21 Maret 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 16 Mar 2026 | Senin | 08.00 | 16.00 | Analisis kebutuhan Dashboard Admin Cabang, perancangan endpoint GET /dashboard dan struktur KPI Cards |
| 2 | 17 Mar 2026 | Selasa | 08.00 | 16.00 | Perancangan struktur data 5 KPI Cards: total peserta, total kursus, total materi, total tugas, rata-rata nilai kuis |
| 3 | 18 Mar 2026 | Rabu | 08.00 | 16.00 | Implementasi awal endpoint GET /dashboard: persiapan struktur controller, format respons JSON, dan setup query builder |
| 4 | 19 Mar 2026 | Kamis | – | – | – |
| 5 | 20 Mar 2026 | Jumat | – | – | – |
| 6 | 21 Mar 2026 | Sabtu | – | – | – |

---

## MINGGU KE-4 | 23 – 28 Maret 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 23 Mar 2026 | Senin | 08.00 | 16.00 | Implementasi query agregasi data dashboard: total peserta aktif, kursus aktif, materi, dan rata-rata nilai kuis |
| 2 | 24 Mar 2026 | Selasa | 08.00 | 16.00 | Pengembangan grafik tren penyelesaian kuis mingguan (7 hari) dan grafik tingkat penyelesaian kursus |
| 3 | 25 Mar 2026 | Rabu | 08.00 | 16.00 | Implementasi grafik akses materi harian dan activity feed terbaru: submit tugas, kuis selesai, upload dokumen |
| 4 | 26 Mar 2026 | Kamis | 08.00 | 16.00 | Testing menyeluruh modul Dashboard, finalisasi format respons API dan dokumentasi endpoint dashboard |
| 5 | 27 Mar 2026 | Jumat | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Peserta, perancangan endpoint GET/POST /peserta dan struktur data |
| 6 | 28 Mar 2026 | Sabtu | 08.00 | 13.00 | Implementasi tabel daftar peserta dengan pagination dan filter status (semua/pending) |

---

## MINGGU KE-5 | 30 Maret – 4 April 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 30 Mar 2026 | Senin | 08.00 | 16.00 | Pengembangan fitur pencarian peserta berdasarkan nama, email, dan asal sekolah dengan debounce 300ms |
| 2 | 31 Mar 2026 | Selasa | 08.00 | 16.00 | Implementasi form tambah peserta: nama, tanggal lahir, email, nomor HP, asal sekolah, jurusan, periode PKL |
| 3 | 1 Apr 2026 | Rabu | 08.00 | 16.00 | Pengembangan fitur edit peserta dengan prefill data dan endpoint PUT /peserta/{id} |
| 4 | 2 Apr 2026 | Kamis | 08.00 | 16.00 | Implementasi hapus peserta (soft delete) dengan konfirmasi dialog dan proteksi double-click |
| 5 | 3 Apr 2026 | Jumat | – | – | – |
| 6 | 4 Apr 2026 | Sabtu | 08.00 | 13.00 | Implementasi update status peserta: pending → aktif/ditolak dengan endpoint PATCH /peserta/{id}/status |

---

## MINGGU KE-6 | 6 – 11 April 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 6 Apr 2026 | Senin | 08.00 | 16.00 | Pengembangan alur verifikasi dokumen PKL peserta (surat siswa dan surat ortu) dengan endpoint PATCH /peserta/{id}/verifikasi-dokumen |
| 2 | 7 Apr 2026 | Selasa | 08.00 | 16.00 | Implementasi secure document viewer untuk review file PDF dokumen PKL dengan kontrol akses berbasis cabang |
| 3 | 8 Apr 2026 | Rabu | 08.00 | 16.00 | Implementasi bulk import peserta dari CSV: generate username otomatis dari nama depan dan password dari tanggal lahir |
| 4 | 9 Apr 2026 | Kamis | 08.00 | 16.00 | Pengembangan download template CSV dan laporan hasil import dengan detail sukses/gagal per baris data |
| 5 | 10 Apr 2026 | Jumat | 08.00 | 16.00 | Testing menyeluruh fitur Manajemen Peserta, finalisasi modul dan dokumentasi endpoint peserta |
| 6 | 11 Apr 2026 | Sabtu | 08.00 | 13.00 | Analisis kebutuhan fitur Manajemen Kursus, perancangan endpoint GET/POST /kursus dan struktur data |

---

## MINGGU KE-7 | 13 – 18 April 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 13 Apr 2026 | Senin | 08.00 | 16.00 | Implementasi daftar kursus per cabang dengan informasi nama, deskripsi, trainer pengempu, dan status |
| 2 | 14 Apr 2026 | Selasa | 08.00 | 16.00 | Pengembangan form tambah kursus: nama, deskripsi, pilihan trainer dalam cabang, status (draft/aktif/nonaktif) |
| 3 | 15 Apr 2026 | Rabu | 08.00 | 16.00 | Implementasi fitur edit kursus dengan concurrency control (timestamp checking) dan validasi trainer satu cabang |
| 4 | 16 Apr 2026 | Kamis | 08.00 | 16.00 | Pengembangan manajemen enrollment: daftarkan/keluarkan peserta dari kursus via endpoint POST/DELETE /kursus/{id}/enroll |
| 5 | 17 Apr 2026 | Jumat | 08.00 | 16.00 | Testing fitur Manajemen Kursus, perbaikan bug dan edge case, finalisasi modul dan review kode |
| 6 | 18 Apr 2026 | Sabtu | 08.00 | 13.00 | Analisis kebutuhan fitur Manajemen Materi, perancangan endpoint GET/POST /materi dan tipe konten yang didukung |

---

## MINGGU KE-8 | 20 – 25 April 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 20 Apr 2026 | Senin | 08.00 | 16.00 | Implementasi daftar materi per kursus dengan filter kursus, pencarian, dan informasi ukuran file |
| 2 | 21 Apr 2026 | Selasa | 08.00 | 16.00 | Pengembangan form upload materi tipe file (PDF, PPT, DOC, XLS) dengan validasi MIME type berbasis magic bytes |
| 3 | 22 Apr 2026 | Rabu | 08.00 | 16.00 | Implementasi materi tipe YouTube: ekstraksi video ID dari URL dan tampilan embed preview di frontend |
| 4 | 23 Apr 2026 | Kamis | 08.00 | 16.00 | Pengembangan materi tipe Google Drive link dan fitur hapus materi dengan konfirmasi |
| 5 | 24 Apr 2026 | Jumat | 08.00 | 16.00 | Testing fitur Manajemen Materi, validasi keamanan upload file, finalisasi modul dan dokumentasi endpoint |
| 6 | 25 Apr 2026 | Sabtu | 08.00 | 13.00 | Analisis kebutuhan fitur Manajemen Tugas, perancangan endpoint GET/POST /tugas dan alur pengumpulan |

---

## MINGGU KE-9 | 27 April – 2 Mei 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 27 Apr 2026 | Senin | – | – | – |
| 2 | 28 Apr 2026 | Selasa | 08.00 | 16.00 | Implementasi daftar tugas per kursus dengan deadline tracking dan indikator status Aktif/Selesai |
| 3 | 29 Apr 2026 | Rabu | 08.00 | 16.00 | Pengembangan form tambah/edit tugas dengan validasi deadline harus di masa depan |
| 4 | 30 Apr 2026 | Kamis | 08.00 | 16.00 | Implementasi panel pengumpulan tugas peserta: lihat file submission, tanggal pengumpulan, dan status nilai |
| 5 | 1 Mei 2026 | Jumat | – | – | – |
| 6 | 2 Mei 2026 | Sabtu | 08.00 | 13.00 | Pengembangan fitur penilaian tugas: input nilai numerik dan feedback, endpoint PATCH /tugas/submissions/{id}/grade |

---

## MINGGU KE-10 | 4 – 9 Mei 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 4 Mei 2026 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Kuis, perancangan endpoint GET/POST /kuis dan tipe soal yang didukung |
| 2 | 5 Mei 2026 | Selasa | 08.00 | 16.00 | Implementasi daftar kuis per kursus dengan informasi waktu mulai/selesai dan jumlah soal |
| 3 | 6 Mei 2026 | Rabu | 08.00 | 16.00 | Pengembangan form buat kuis dengan pengaturan waktu mulai/selesai menggunakan komponen custom TimePickerRoll |
| 4 | 7 Mei 2026 | Kamis | 08.00 | 16.00 | Implementasi question builder: soal pilihan ganda (4 opsi, min. 1 jawaban benar) dan soal esai dengan bobot nilai |
| 5 | 8 Mei 2026 | Jumat | 08.00 | 16.00 | Pengembangan fitur hasil kuis: daftar peserta dengan skor, detail jawaban per attempt, dan rekap nilai |
| 6 | 9 Mei 2026 | Sabtu | 08.00 | 13.00 | Implementasi penilaian soal esai: tampil jawaban peserta, input nilai, endpoint PATCH /kuis/attempts/{id}/grade-essay |

---

## MINGGU KE-11 | 11 – 16 Mei 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 11 Mei 2026 | Senin | 08.00 | 16.00 | Analisis kebutuhan fitur Manajemen Trainer, perancangan endpoint GET/POST /trainer dan struktur jadwal |
| 2 | 12 Mei 2026 | Selasa | 08.00 | 16.00 | Implementasi daftar trainer per cabang dengan pencarian, filter status, dan indikator kursus yang diajar |
| 3 | 13 Mei 2026 | Rabu | 08.00 | 16.00 | Pengembangan form tambah/edit trainer: nama, email, nomor HP, status aktif/nonaktif, dan validasi data |
| 4 | 14 Mei 2026 | Kamis | – | – | – |
| 5 | 15 Mei 2026 | Jumat | 08.00 | 16.00 | Implementasi modal detail trainer: informasi lengkap, daftar kursus yang diajar, dan riwayat jadwal |
| 6 | 16 Mei 2026 | Sabtu | 08.00 | 13.00 | Pengembangan fitur Jadwal Trainer: buat/edit/hapus jadwal dengan tanggal, waktu, ruang, dan tipe Online/Offline |

---

## MINGGU KE-12 | 18 – 23 Mei 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 18 Mei 2026 | Senin | 08.00 | 16.00 | Testing seluruh fitur Manajemen Trainer dan Jadwal, perbaikan bug, finalisasi modul dan dokumentasi endpoint |
| 2 | 19 Mei 2026 | Selasa | 08.00 | 16.00 | Analisis kebutuhan fitur Laporan, perancangan 4 tab: Peserta, Kursus, Kuis, Trainer dengan endpoint GET /laporan |
| 3 | 20 Mei 2026 | Rabu | 08.00 | 16.00 | Implementasi dashboard chart laporan: grafik pertumbuhan peserta 12 bulan dan grafik penyelesaian kursus bulanan |
| 4 | 21 Mei 2026 | Kamis | 08.00 | 16.00 | Pengembangan laporan Peserta: progress kursus, status dokumen, dan ekspor CSV sesuai filter aktif |
| 5 | 22 Mei 2026 | Jumat | 08.00 | 16.00 | Implementasi laporan Kursus, Kuis, dan Trainer dengan statistik completion rate, rata-rata skor, dan ekspor CSV |
| 6 | 23 Mei 2026 | Sabtu | 08.00 | 13.00 | Pengembangan sistem notifikasi: GET /notifikasi, tandai dibaca satu/semua, dan badge jumlah notifikasi belum dibaca |

---

## MINGGU KE-13 | 25 – 30 Mei 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 25 Mei 2026 | Senin | 08.00 | 16.00 | Integrasi frontend-backend seluruh modul Admin Cabang: validasi alur data dan konsistensi tampilan antarmuka |
| 2 | 26 Mei 2026 | Selasa | 08.00 | 16.00 | Pengujian end-to-end seluruh alur Admin Cabang: dari login OTP hingga operasi laporan dan notifikasi |
| 3 | 27 Mei 2026 | Rabu | – | – | – |
| 4 | 28 Mei 2026 | Kamis | 08.00 | 16.00 | Audit keamanan autentikasi OTP, validasi middleware role, dan proteksi isolasi data berbasis cabang |
| 5 | 29 Mei 2026 | Jumat | 08.00 | 16.00 | Audit input validation: SQL injection, XSS, mass assignment, dan validasi MIME type pada upload file materi/dokumen |
| 6 | 30 Mei 2026 | Sabtu | 08.00 | 13.00 | Perbaikan bug hasil audit, optimasi query N+1, eager loading, performa auto-refresh dashboard 30 detik, dan penyusunan laporan akhir magang |

---

## MINGGU KE-14 | 1 – 2 Juni 2026

| No | Tanggal | Hari | Jam Masuk | Jam Keluar | Kegiatan |
|----|---------|------|-----------|------------|----------|
| 1 | 1 Jun 2026 | Senin | – | – | – |
| 2 | 2 Jun 2026 | Selasa | 08.00 | 16.00 | Hari terakhir magang: finalisasi seluruh modul Admin Cabang, pengumpulan berkas administrasi, dan perpisahan resmi dengan seluruh tim PT. Indo Bismar |
