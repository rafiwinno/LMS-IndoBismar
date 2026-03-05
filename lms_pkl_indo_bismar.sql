-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 05 Mar 2026 pada 03.58
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_pkl_indo_bismar`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `berita`
--

CREATE TABLE `berita` (
  `id` bigint(20) NOT NULL,
  `judul` varchar(200) DEFAULT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `isi` text DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `penulis_id` bigint(20) NOT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cabang`
--

CREATE TABLE `cabang` (
  `id` bigint(20) NOT NULL,
  `nama_cabang` varchar(100) NOT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `dokumen_verifikasi`
--

CREATE TABLE `dokumen_verifikasi` (
  `id` bigint(20) NOT NULL,
  `pengguna_id` bigint(20) NOT NULL,
  `surat_orang_tua` varchar(255) DEFAULT NULL,
  `surat_siswa` varchar(255) DEFAULT NULL,
  `status` enum('pending','disetujui','ditolak') DEFAULT 'pending',
  `diverifikasi_oleh` bigint(20) DEFAULT NULL,
  `waktu_verifikasi` timestamp NULL DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jawaban_peserta`
--

CREATE TABLE `jawaban_peserta` (
  `id` bigint(20) NOT NULL,
  `pengguna_id` bigint(20) NOT NULL,
  `pertanyaan_id` bigint(20) NOT NULL,
  `pilihan_id` bigint(20) NOT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kuis`
--

CREATE TABLE `kuis` (
  `id` bigint(20) NOT NULL,
  `kursus_id` bigint(20) NOT NULL,
  `judul` varchar(150) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kursus`
--

CREATE TABLE `kursus` (
  `id` bigint(20) NOT NULL,
  `judul` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `cabang_id` bigint(20) NOT NULL,
  `trainer_id` bigint(20) NOT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `materi`
--

CREATE TABLE `materi` (
  `id` bigint(20) NOT NULL,
  `kursus_id` bigint(20) NOT NULL,
  `judul` varchar(150) DEFAULT NULL,
  `file_materi` varchar(255) DEFAULT NULL,
  `tipe` enum('video','pdf','dokumen') DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengguna`
--

CREATE TABLE `pengguna` (
  `id` bigint(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` bigint(20) NOT NULL,
  `cabang_id` bigint(20) DEFAULT NULL,
  `asal_instansi` varchar(150) DEFAULT NULL,
  `status` enum('pending','aktif','ditolak') DEFAULT 'pending',
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp(),
  `diperbarui_pada` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pengumpulan_tugas`
--

CREATE TABLE `pengumpulan_tugas` (
  `id` bigint(20) NOT NULL,
  `tugas_id` bigint(20) NOT NULL,
  `pengguna_id` bigint(20) NOT NULL,
  `file_jawaban` varchar(255) DEFAULT NULL,
  `nilai` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `penilaian_pkl`
--

CREATE TABLE `penilaian_pkl` (
  `id` bigint(20) NOT NULL,
  `peserta_id` bigint(20) NOT NULL,
  `trainer_id` bigint(20) NOT NULL,
  `nilai_teknis` int(11) DEFAULT NULL,
  `nilai_non_teknis` int(11) DEFAULT NULL,
  `nilai_akhir` int(11) DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pertanyaan`
--

CREATE TABLE `pertanyaan` (
  `id` bigint(20) NOT NULL,
  `kuis_id` bigint(20) NOT NULL,
  `teks_pertanyaan` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `peserta_kursus`
--

CREATE TABLE `peserta_kursus` (
  `id` bigint(20) NOT NULL,
  `kursus_id` bigint(20) NOT NULL,
  `pengguna_id` bigint(20) NOT NULL,
  `status` enum('belum_mulai','sedang_belajar','selesai') DEFAULT 'belum_mulai',
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pilihan_jawaban`
--

CREATE TABLE `pilihan_jawaban` (
  `id` bigint(20) NOT NULL,
  `pertanyaan_id` bigint(20) NOT NULL,
  `teks_pilihan` varchar(255) DEFAULT NULL,
  `benar` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `role`
--

CREATE TABLE `role` (
  `id` bigint(20) NOT NULL,
  `nama_role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `role`
--

INSERT INTO `role` (`id`, `nama_role`) VALUES
(1, 'superadmin'),
(2, 'admin'),
(3, 'trainer'),
(4, 'peserta');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tugas`
--

CREATE TABLE `tugas` (
  `id` bigint(20) NOT NULL,
  `kursus_id` bigint(20) NOT NULL,
  `judul` varchar(150) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `batas_pengumpulan` date DEFAULT NULL,
  `dibuat_pada` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `penulis_id` (`penulis_id`);

--
-- Indeks untuk tabel `cabang`
--
ALTER TABLE `cabang`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `dokumen_verifikasi`
--
ALTER TABLE `dokumen_verifikasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pengguna_id` (`pengguna_id`),
  ADD KEY `diverifikasi_oleh` (`diverifikasi_oleh`);

--
-- Indeks untuk tabel `jawaban_peserta`
--
ALTER TABLE `jawaban_peserta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pengguna_id` (`pengguna_id`),
  ADD KEY `pertanyaan_id` (`pertanyaan_id`),
  ADD KEY `pilihan_id` (`pilihan_id`);

--
-- Indeks untuk tabel `kuis`
--
ALTER TABLE `kuis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kursus_id` (`kursus_id`);

--
-- Indeks untuk tabel `kursus`
--
ALTER TABLE `kursus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cabang_id` (`cabang_id`),
  ADD KEY `trainer_id` (`trainer_id`);

--
-- Indeks untuk tabel `materi`
--
ALTER TABLE `materi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kursus_id` (`kursus_id`);

--
-- Indeks untuk tabel `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `cabang_id` (`cabang_id`);

--
-- Indeks untuk tabel `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tugas_id` (`tugas_id`),
  ADD KEY `pengguna_id` (`pengguna_id`);

--
-- Indeks untuk tabel `penilaian_pkl`
--
ALTER TABLE `penilaian_pkl`
  ADD PRIMARY KEY (`id`),
  ADD KEY `peserta_id` (`peserta_id`),
  ADD KEY `trainer_id` (`trainer_id`);

--
-- Indeks untuk tabel `pertanyaan`
--
ALTER TABLE `pertanyaan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kuis_id` (`kuis_id`);

--
-- Indeks untuk tabel `peserta_kursus`
--
ALTER TABLE `peserta_kursus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kursus_id` (`kursus_id`,`pengguna_id`),
  ADD KEY `pengguna_id` (`pengguna_id`);

--
-- Indeks untuk tabel `pilihan_jawaban`
--
ALTER TABLE `pilihan_jawaban`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pertanyaan_id` (`pertanyaan_id`);

--
-- Indeks untuk tabel `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `tugas`
--
ALTER TABLE `tugas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kursus_id` (`kursus_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `berita`
--
ALTER TABLE `berita`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `cabang`
--
ALTER TABLE `cabang`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `dokumen_verifikasi`
--
ALTER TABLE `dokumen_verifikasi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `jawaban_peserta`
--
ALTER TABLE `jawaban_peserta`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kuis`
--
ALTER TABLE `kuis`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kursus`
--
ALTER TABLE `kursus`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `materi`
--
ALTER TABLE `materi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `penilaian_pkl`
--
ALTER TABLE `penilaian_pkl`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pertanyaan`
--
ALTER TABLE `pertanyaan`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `peserta_kursus`
--
ALTER TABLE `peserta_kursus`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pilihan_jawaban`
--
ALTER TABLE `pilihan_jawaban`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `role`
--
ALTER TABLE `role`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `tugas`
--
ALTER TABLE `tugas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `berita`
--
ALTER TABLE `berita`
  ADD CONSTRAINT `berita_ibfk_1` FOREIGN KEY (`penulis_id`) REFERENCES `pengguna` (`id`);

--
-- Ketidakleluasaan untuk tabel `dokumen_verifikasi`
--
ALTER TABLE `dokumen_verifikasi`
  ADD CONSTRAINT `dokumen_verifikasi_ibfk_1` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`),
  ADD CONSTRAINT `dokumen_verifikasi_ibfk_2` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `pengguna` (`id`);

--
-- Ketidakleluasaan untuk tabel `jawaban_peserta`
--
ALTER TABLE `jawaban_peserta`
  ADD CONSTRAINT `jawaban_peserta_ibfk_1` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`),
  ADD CONSTRAINT `jawaban_peserta_ibfk_2` FOREIGN KEY (`pertanyaan_id`) REFERENCES `pertanyaan` (`id`),
  ADD CONSTRAINT `jawaban_peserta_ibfk_3` FOREIGN KEY (`pilihan_id`) REFERENCES `pilihan_jawaban` (`id`);

--
-- Ketidakleluasaan untuk tabel `kuis`
--
ALTER TABLE `kuis`
  ADD CONSTRAINT `kuis_ibfk_1` FOREIGN KEY (`kursus_id`) REFERENCES `kursus` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kursus`
--
ALTER TABLE `kursus`
  ADD CONSTRAINT `kursus_ibfk_1` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`),
  ADD CONSTRAINT `kursus_ibfk_2` FOREIGN KEY (`trainer_id`) REFERENCES `pengguna` (`id`);

--
-- Ketidakleluasaan untuk tabel `materi`
--
ALTER TABLE `materi`
  ADD CONSTRAINT `materi_ibfk_1` FOREIGN KEY (`kursus_id`) REFERENCES `kursus` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pengguna`
--
ALTER TABLE `pengguna`
  ADD CONSTRAINT `pengguna_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  ADD CONSTRAINT `pengguna_ibfk_2` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`);

--
-- Ketidakleluasaan untuk tabel `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD CONSTRAINT `pengumpulan_tugas_ibfk_1` FOREIGN KEY (`tugas_id`) REFERENCES `tugas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengumpulan_tugas_ibfk_2` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `penilaian_pkl`
--
ALTER TABLE `penilaian_pkl`
  ADD CONSTRAINT `penilaian_pkl_ibfk_1` FOREIGN KEY (`peserta_id`) REFERENCES `pengguna` (`id`),
  ADD CONSTRAINT `penilaian_pkl_ibfk_2` FOREIGN KEY (`trainer_id`) REFERENCES `pengguna` (`id`);

--
-- Ketidakleluasaan untuk tabel `pertanyaan`
--
ALTER TABLE `pertanyaan`
  ADD CONSTRAINT `pertanyaan_ibfk_1` FOREIGN KEY (`kuis_id`) REFERENCES `kuis` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `peserta_kursus`
--
ALTER TABLE `peserta_kursus`
  ADD CONSTRAINT `peserta_kursus_ibfk_1` FOREIGN KEY (`kursus_id`) REFERENCES `kursus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peserta_kursus_ibfk_2` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pilihan_jawaban`
--
ALTER TABLE `pilihan_jawaban`
  ADD CONSTRAINT `pilihan_jawaban_ibfk_1` FOREIGN KEY (`pertanyaan_id`) REFERENCES `pertanyaan` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tugas`
--
ALTER TABLE `tugas`
  ADD CONSTRAINT `tugas_ibfk_1` FOREIGN KEY (`kursus_id`) REFERENCES `kursus` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
