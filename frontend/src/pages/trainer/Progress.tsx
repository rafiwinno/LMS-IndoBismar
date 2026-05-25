import { useEffect, useState } from 'react';
import {
  Search, Eye, Mail, MapPin, BookOpen, Edit2, X,
  UserPlus, UserMinus, Download, Users, Phone, GraduationCap, ChevronDown,
} from 'lucide-react';
import api from '../../api/axiosInstance';

interface CourseProgress {
  id: number;
  id_kursus: number;
  course: string;
  progress: number;
  materi_selesai: number;
  total_materi: number;
  tugas_selesai: number;
  total_tugas: number;
  kuis_selesai: number;
  total_kuis: number;
}

interface PesertaRow {
  id: number;
  nama: string;
  email: string;
  nomor_hp: string | null;
  status: string;
  asal_sekolah: string | null;
  jurusan: string | null;
  enrolled_courses: number;
  progress: number;
  courses: CourseProgress[];
}

interface TrainerCourse {
  id_kursus: number;
  judul_kursus: string;
  status: string;
}

function initials(nama: string) {
  return nama.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function progressColor(p: number) {
  return p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-400';
}

function progressText(p: number) {
  return p >= 75
    ? 'text-green-600 dark:text-green-400'
    : p >= 50
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400';
}

function exportCsv(data: PesertaRow[]) {
  const headers = ['Nama', 'Email', 'No. HP', 'Sekolah', 'Jurusan', 'Kursus', 'Progress (%)'];
  const rows = data.map((p) => [
    `"${p.nama}"`, `"${p.email}"`, p.nomor_hp ?? '-',
    `"${p.asal_sekolah ?? '-'}"`, `"${p.jurusan ?? '-'}"`,
    p.enrolled_courses, p.progress,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'peserta.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function TrainerProgress() {
  const [peserta, setPeserta] = useState<PesertaRow[]>([]);
  const [trainerCourses, setTrainerCourses] = useState<TrainerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [detail, setDetail] = useState<PesertaRow | null>(null);
  const [editData, setEditData] = useState<PesertaRow | null>(null);
  const [editForm, setEditForm] = useState({ nama: '', nomor_hp: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [enrollDropdownOpen, setEnrollDropdownOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    sub?: string;
    onConfirm: () => void;
  } | null>(null);

  const buildMerged = async (searchQuery: string, bust = false): Promise<PesertaRow[]> => {
    const [pesertaRes, progressRes] = await Promise.all([
      api.get('/trainer/peserta/semua', { params: { search: searchQuery } }),
      api.get('/trainer/peserta/progress', { params: { per_page: 200, bust: bust ? 1 : undefined } }),
    ]);

    const allPeserta: any[] = pesertaRes.data.data ?? [];
    const progressRows: CourseProgress[] = progressRes.data.data ?? [];

    const progressMap = new Map<number, CourseProgress[]>();
    for (const row of progressRows) {
      if (!progressMap.has(row.id)) progressMap.set(row.id, []);
      progressMap.get(row.id)!.push(row);
    }

    return allPeserta.map((p) => {
      const courses = progressMap.get(p.id) ?? [];
      const avgProgress =
        courses.length > 0
          ? Math.round(courses.reduce((sum, c) => sum + (c.progress ?? 0), 0) / courses.length)
          : 0;
      return { ...p, enrolled_courses: courses.length, progress: avgProgress, courses };
    });
  };

  const fetchData = async (searchQuery = '', bust = false) => {
    setLoading(true);
    try {
      const merged = await buildMerged(searchQuery, bust);
      setPeserta(merged);
      return merged;
    } catch {
      setPeserta([]);
      return [] as PesertaRow[];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchData(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api
      .get('/trainer/courses')
      .then((res) => setTrainerCourses(Array.isArray(res.data) ? res.data : (res.data.data ?? [])))
      .catch(() => {});
  }, []);

  const openDetail = (p: PesertaRow) => {
    setDetail(p);
    setSelectedCourseId('');
    setEnrollDropdownOpen(false);
  };

  const openEdit = (p: PesertaRow) => {
    setEditData(p);
    setEditForm({ nama: p.nama, nomor_hp: p.nomor_hp ?? '' });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setSaving(true);
    setEditError('');
    try {
      await api.put(`/trainer/peserta/${editData.id}`, {
        nama: editForm.nama,
        nomor_hp: editForm.nomor_hp || null,
      });
      setEditData(null);
      fetchData(search);
    } catch (e: any) {
      setEditError(e.response?.data?.message ?? 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async () => {
    if (!detail || !selectedCourseId) return;
    setEnrolling(true);
    try {
      await api.post(`/trainer/courses/${selectedCourseId}/enroll`, { id_pengguna: detail.id });
      setSelectedCourseId('');
      setEnrollDropdownOpen(false);
      const merged = await buildMerged(search, true);
      setPeserta(merged);
      const fresh = merged.find((p) => p.id === detail.id);
      if (fresh) setDetail(fresh);
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Gagal mendaftarkan.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = (courseId: number, courseName: string) => {
    if (!detail) return;
    setConfirmDialog({
      message: `Keluarkan ${detail.nama} dari kursus ini?`,
      sub: `Kursus: ${courseName}`,
      onConfirm: async () => {
        try {
          await api.delete(`/trainer/courses/${courseId}/peserta/${detail.id}`);
          const merged = await buildMerged(search, true);
          setPeserta(merged);
          const fresh = merged.find((p) => p.id === detail.id);
          if (fresh) setDetail(fresh);
        } catch (e: any) {
          alert(e.response?.data?.message ?? 'Gagal mengeluarkan peserta.');
        }
      },
    });
  };

  const enrollableCourses = trainerCourses.filter(
    (c) => !detail?.courses.some((dc) => dc.id_kursus === c.id_kursus)
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama, email, sekolah..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-1 bg-gray-200 dark:bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Grid
            </button>
          </div>
          {!loading && peserta.length > 0 && (
            <button
              onClick={() => exportCsv(peserta)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4">Kontak & Sekolah</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {peserta.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 dark:text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      Tidak ada peserta ditemukan
                    </td>
                  </tr>
                ) : (
                  peserta.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <span className="text-red-600 dark:text-red-400 font-bold text-sm">{initials(p.nama)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{p.nama}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{p.jurusan ?? '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                            {p.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                            {p.asal_sekolah ?? '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-45">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{p.enrolled_courses} Kursus</span>
                            <span className={`font-semibold ${progressText(p.progress)}`}>{p.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progressColor(p.progress)}`} style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(p)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                            title="Detail & Kursus"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-200 dark:border-white/10">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total {peserta.length} peserta</span>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {peserta.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              Tidak ada peserta ditemukan
            </div>
          ) : (
            peserta.map((p) => (
              <div key={p.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">{initials(p.nama)}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700'}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5">{p.nama}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />{p.asal_sekolah ?? '-'}
                </p>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Mail className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-white/8 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <BookOpen className="w-3.5 h-3.5 text-red-400" />
                      {p.enrolled_courses} Kursus
                    </span>
                    <span className={`font-semibold ${progressText(p.progress)}`}>{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full">
                    <div className={`h-full rounded-full ${progressColor(p.progress)}`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openDetail(p)}
                    className="flex-1 py-1.5 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 py-1.5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── DETAIL MODAL ────────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">

            {/* Header: avatar + name + stats */}
            <div className="p-6 border-b dark:border-white/10">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold text-xl">{initials(detail.nama)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{detail.nama}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{detail.email}</p>
                    <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${detail.status === 'aktif' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}`}>
                      {detail.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Kursus',        value: detail.enrolled_courses,                                              plain: true },
                  { label: 'Rata-rata',     value: `${detail.progress}%`,                                               plain: false },
                  { label: 'Tugas Selesai', value: detail.courses.reduce((a, c) => a + (c.tugas_selesai ?? 0), 0),      plain: true },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${s.plain ? 'text-gray-900 dark:text-white' : progressText(detail.progress)}`}>
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Info row with icons */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/8 space-y-2.5">
                {detail.nomor_hp && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{detail.nomor_hp}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {detail.asal_sekolah ?? '-'}
                    {detail.jurusan ? <span className="text-gray-400"> — {detail.jurusan}</span> : null}
                  </span>
                </div>
              </div>

              {/* Courses */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kursus Terdaftar</h4>
                  {detail.courses.length > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{detail.courses.length} kursus</span>
                  )}
                </div>

                {/* Enroll form */}
                {enrollableCourses.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {/* Custom dropdown */}
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setEnrollDropdownOpen((o) => !o)}
                        className="w-full flex items-center justify-between gap-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0d0f14] outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        <span className={selectedCourseId ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                          {selectedCourseId
                            ? (enrollableCourses.find((c) => c.id_kursus === selectedCourseId)?.judul_kursus ?? 'Pilih kursus')
                            : 'Pilih kursus untuk didaftarkan'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${enrollDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {enrollDropdownOpen && (
                        <>
                          {/* backdrop to close on outside click */}
                          <div className="fixed inset-0 z-10" onClick={() => setEnrollDropdownOpen(false)} />
                          <ul className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {enrollableCourses.map((c) => (
                              <li key={c.id_kursus}>
                                <button
                                  type="button"
                                  onClick={() => { setSelectedCourseId(c.id_kursus); setEnrollDropdownOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${selectedCourseId === c.id_kursus ? 'text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10' : 'text-gray-800 dark:text-gray-200'}`}
                                >
                                  {c.judul_kursus}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleEnroll}
                      disabled={!selectedCourseId || enrolling}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      {enrolling ? 'Mendaftarkan...' : 'Daftarkan'}
                    </button>
                  </div>
                )}

                {detail.courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">Belum terdaftar di kursus manapun</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {detail.courses.map((c) => (
                      <li key={c.id_kursus} className="rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                        {/* Course header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/3">
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{c.course}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className={`text-sm font-bold ${progressText(c.progress ?? 0)}`}>
                              {c.progress ?? 0}%
                            </span>
                            <button
                              onClick={() => handleUnenroll(c.id_kursus, c.course)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Keluarkan dari kursus"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {/* Course progress body */}
                        <div className="px-4 pt-2 pb-3 space-y-2">
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full">
                            <div
                              className={`h-full rounded-full transition-all ${progressColor(c.progress ?? 0)}`}
                              style={{ width: `${c.progress ?? 0}%` }}
                            />
                          </div>
                          <div className="flex gap-5 text-xs text-gray-500 dark:text-gray-400">
                            <span>Materi <span className="font-semibold text-gray-700 dark:text-gray-300">{c.materi_selesai}/{c.total_materi}</span></span>
                            <span>Tugas <span className="font-semibold text-gray-700 dark:text-gray-300">{c.tugas_selesai}/{c.total_tugas}</span></span>
                            <span>Kuis <span className="font-semibold text-gray-700 dark:text-gray-300">{c.kuis_selesai}/{c.total_kuis}</span></span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ──────────────────────────────────────────── */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Peserta</h3>
              <button onClick={() => setEditData(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {editError && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 px-3 py-2 rounded-lg">
                  {editError}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={editForm.nama}
                  onChange={(e) => setEditForm((f) => ({ ...f, nama: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor HP</label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={editForm.nomor_hp}
                  onChange={(e) => setEditForm((f) => ({ ...f, nomor_hp: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button
                onClick={() => setEditData(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editForm.nama.trim()}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c2333] rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4">
              <p className="text-base font-semibold text-gray-900 dark:text-white">{confirmDialog.message}</p>
              {confirmDialog.sub && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{confirmDialog.sub}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Keluarkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
