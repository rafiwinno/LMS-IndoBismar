# LMS Indo Bismar — Laravel Backend

Backend API untuk LMS Indo Bismar, dibuat dengan **Laravel + Sanctum** dan **MySQL**.

---

## 🚀 Setup di Laragon (Step by Step)

### 1. Install Laravel baru
```bash
# Di folder Laragon/www
composer create-project laravel/laravel lms-backend
cd lms-backend
```

### 2. Copy file-file dari folder ini
Salin semua file berikut ke project Laravel lo:

| File / Folder dari sini | Tujuan di project Laravel |
|---|---|
| `routes/api.php` | `routes/api.php` |
| `app/Http/Controllers/Api/*` | `app/Http/Controllers/Api/` |
| `app/Models/*` | `app/Models/` |
| `database/migrations/*.php` | `database/migrations/` |
| `database/migrations/DatabaseSeeder.php` | `database/seeders/DatabaseSeeder.php` |
| `config/cors.php` | `config/cors.php` |
| `.env.example` | `.env` (rename) |

### 3. Install Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 4. Setup database
- Buat database `lms_pkl_v2` di phpMyAdmin Laragon
- Import file SQL `lms_pkl_v2.sql` yang sudah ada
- Edit `.env` — pastikan `DB_DATABASE=lms_pkl_v2`

### 5. Generate key & jalankan migration
```bash
php artisan key:generate
php artisan migrate          # membuat tabel jadwal_trainer + kolom deadline
php artisan db:seed          # insert role, cabang, dan admin default
php artisan storage:link     # untuk akses file upload
```

### 6. Pastikan `bootstrap/app.php` ada Sanctum middleware
Di Laravel 11+, buka `bootstrap/app.php` dan pastikan ada:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

### 7. Jalankan server
```bash
php artisan serve
# Atau akses via Laragon: http://lms-backend.test
```

---

## 🔗 Setup Frontend (React)

Di project React lo, buat file `src/lib/api.ts`:

```typescript
const API_BASE = 'http://lms-backend.test/api'; // atau http://127.0.0.1:8000/api

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

// Contoh login
export async function login(email: string, password: string) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', data.token);
  return data;
}
```

---

## 📋 API Endpoints Lengkap

### Auth
| Method | URL | Keterangan |
|--------|-----|------------|
| POST | `/api/auth/login` | Login, dapat token |
| POST | `/api/auth/register` | Daftar peserta baru |
| POST | `/api/auth/logout` | Logout (butuh token) |
| GET  | `/api/auth/me` | Data user login |

### Peserta
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/peserta` | List peserta (search, filter, paginate) |
| POST   | `/api/peserta` | Tambah peserta |
| GET    | `/api/peserta/{id}` | Detail peserta |
| PUT    | `/api/peserta/{id}` | Update peserta |
| DELETE | `/api/peserta/{id}` | Hapus peserta |
| PATCH  | `/api/peserta/{id}/status` | Aktifkan/tolak |

### Kursus
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/kursus` | List kursus |
| POST   | `/api/kursus` | Buat kursus |
| GET    | `/api/kursus/{id}` | Detail + materi + tugas |
| PUT    | `/api/kursus/{id}` | Update kursus |
| DELETE | `/api/kursus/{id}` | Hapus kursus |
| PATCH  | `/api/kursus/{id}/status` | Toggle draft/publish |
| GET    | `/api/kursus/{id}/peserta` | Peserta di kursus ini |
| POST   | `/api/kursus/{id}/enroll` | Daftarkan peserta |

### Materi
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/materi` | List materi (filter by kursus) |
| POST   | `/api/materi` | Upload materi (multipart/form-data) |
| GET    | `/api/materi/{id}` | Detail materi |
| PUT    | `/api/materi/{id}` | Update materi |
| DELETE | `/api/materi/{id}` | Hapus materi |
| POST   | `/api/materi/{id}/progress` | Update progress peserta |

### Tugas
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/tugas` | List tugas |
| POST   | `/api/tugas` | Buat tugas |
| GET    | `/api/tugas/{id}` | Detail tugas |
| PUT    | `/api/tugas/{id}` | Update tugas |
| DELETE | `/api/tugas/{id}` | Hapus tugas |
| GET    | `/api/tugas/{id}/submissions` | Daftar pengumpulan |
| POST   | `/api/tugas/{id}/submit` | Peserta kumpulkan tugas |
| PATCH  | `/api/tugas/submissions/{id}/grade` | Trainer kasih nilai |

### Kuis / Ujian
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/kuis` | List kuis |
| POST   | `/api/kuis` | Buat kuis + pertanyaan |
| GET    | `/api/kuis/{id}` | Detail kuis + soal |
| PUT    | `/api/kuis/{id}` | Update kuis |
| DELETE | `/api/kuis/{id}` | Hapus kuis |
| POST   | `/api/kuis/{id}/start` | Mulai attempt |
| POST   | `/api/kuis/{id}/submit` | Submit jawaban |
| GET    | `/api/kuis/{id}/results` | Hasil semua peserta |

### Trainer
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/trainer` | List trainer |
| GET    | `/api/trainer/{id}` | Detail trainer |
| PUT    | `/api/trainer/{id}` | Update trainer |
| GET    | `/api/trainer/jadwal/all` | Semua jadwal |
| POST   | `/api/trainer/jadwal` | Tambah jadwal |
| PUT    | `/api/trainer/jadwal/{id}` | Edit jadwal |
| DELETE | `/api/trainer/jadwal/{id}` | Hapus jadwal |

### Dashboard & Laporan
| Method | URL | Keterangan |
|--------|-----|------------|
| GET    | `/api/dashboard` | Stats + chart data |
| GET    | `/api/laporan/dashboard` | Chart enrollment vs completion |
| GET    | `/api/laporan/peserta` | Laporan peserta |
| GET    | `/api/laporan/kursus` | Laporan kursus |
| GET    | `/api/laporan/tugas` | Laporan tugas |
| GET    | `/api/laporan/trainer` | Laporan trainer |

---

## 🔑 Default Login (setelah seed)
```
Email    : admin@indobismar.com
Password : password
```

---

## 📝 Catatan Penting

1. **Tabel `jadwal_trainer`** — tidak ada di SQL original, dibuat via migration baru.
2. **Kolom `deadline`** di tabel `tugas` — juga ditambahkan via migration.
3. **File upload** disimpan di `storage/app/public/` — pastikan sudah `php artisan storage:link`.
4. **Auth wajib** untuk semua endpoint kecuali `/auth/login` dan `/auth/register`.
