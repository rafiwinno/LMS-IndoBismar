## Cara Menjalankan Aplikasi

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Tools yang Digunakan

1. Core Framework & Language
   - React 18 — library UI utama
   - TypeScript — bahasa pemrograman (superset JavaScript dengan static typing)
   - Vite — build tool & dev server yang cepat

2. Styling
   - Tailwind CSS v4 — utility-first CSS framework
   - tailwind-merge — untuk menggabungkan class Tailwind secara conditional
   - clsx — helper untuk conditional class names

3. Routing
   - React Router DOM v6 — client-side routing / navigasi halaman

4. Data Visualization
   - Recharts — library chart/grafik berbasis React (kemungkinan dipakai untuk dashboard LMS)

5. Icons
   - Lucide React — library ikon SVG

6. Tooling & Dev
   - Vite Plugin React (@vitejs/plugin-react) — integrasi React dengan Vite
   - TypeScript Compiler (tsc) — untuk type checking saat build

## Icon

Navigasi & Layout
| Ikon | Nama | Dipakai di |
|------|------|-----------|
| 🔲 | `LayoutDashboard` | Sidebar - menu Dashboard |
| 📖 | `BookOpen` | Sidebar - Courses, Dashboard |
| ✅ | `CheckSquare` | Sidebar - Tugas & Kuis |
| 🏆 | `Award` | Sidebar - Nilai, Dashboard |
| 👤 | `User` | Sidebar - Profil |
| ☰ | `Menu` | Header - hamburger menu |
| ← | `ChevronLeft` | Tombol back |
| ✕ | `X` | Tutup sidebar |
| 🚪 | `LogOut` | Tombol keluar |

Status & Feedback
| Ikon | Nama | Dipakai di |
|------|------|-----------|
| ✅ | `CheckCircle` | Status selesai |
| ⭕ | `Circle` | Status belum |
| ⚠️ | `AlertCircle` | Peringatan |
| ⚠️ | `AlertTriangle` | Warning |
| 📈 | `TrendingUp` | Grafik nilai |

**Form & Auth**
| Ikon | Nama | Dipakai di |
|------|------|-----------|
| ✉️ | `Mail` | Input email |
| 🔒 | `Lock` | Input password |
| 🔑 | `LogIn` | Tombol login |
| 👁️ | `UserCircle` | Avatar header |
| 📷 | `Camera` | Upload foto profil |

**Konten & Info**
| Ikon | Nama | Dipakai di |
|------|------|-----------|
| ▶️ | `PlayCircle` | Materi video |
| 📄 | `FileText` | Dokumen/tugas |
| ⬇️ | `Download` | Unduh file |
| 🔍 | `Search` | Kolom pencarian |
| ⏱️ | `Clock` | Durasi/deadline |
| 📅 | `Calendar` | Tanggal |
| 🔔 | `Bell` | Notifikasi |
| 🏫 | `School` | Nama sekolah |
| 📍 | `MapPin` | Lokasi/cabang |
| 🔽 | `Filter` | Filter course |

---

## Cara pakainya di halaman baru Anda:

1. Import di bagian atas file\*\*

```tsx
import { BookOpen, CheckCircle, Clock } from "lucide-react";
```

2. Pakai di JSX seperti komponen biasa\*\*

```tsx
<BookOpen size={20} />
```

3. Tambahkan warna & styling via Tailwind (sesuai pola project ini)\*\*

```tsx
<BookOpen size={20} className="text-blue-600" />
<CheckCircle size={24} className="text-emerald-600" />
<Clock size={16} className="text-slate-400" />
```

**Contoh nyata dari project ini** — ini persis cara Sidebar.tsx memakainya:

```tsx
import { LayoutDashboard, BookOpen, Award } from "lucide-react";

export default function MyPage() {
  return (
    <div className="flex items-center gap-3 p-4">
      <LayoutDashboard size={20} className="text-blue-400" />
      <span>Dashboard</span>
    </div>
  );
}
```

**Ukuran yang dipakai konsisten di project ini:**

- `size={16}` → ikon kecil (label, badge)
- `size={20}` → ikon navigasi sidebar
- `size={24}` → ikon card/stats di Dashboard
