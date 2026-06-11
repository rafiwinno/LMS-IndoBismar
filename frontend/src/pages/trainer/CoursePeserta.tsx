import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, TrendingUp, CheckSquare,
  UserPlus, UserMinus, Search, ChevronDown, Loader2,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { toast } from '../../lib/toast';
import { cardCls, thCls, trCls } from '../../lib/styles';

interface CourseInfo {
  id_kursus: number;
  judul_kursus: string;
  status: 'draft' | 'publish';
}

interface PesertaRow {
  id: number;
  nama: string;
  email: string;
  progress: number;
  materi_selesai: number;
  total_materi: number;
  tugas_selesai: number;
  total_tugas: number;
  kuis_selesai: number;
  total_kuis: number;
}

interface PesertaCabang {
  id: number;
  nama: string;
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

export default function TrainerCoursePeserta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [peserta, setPeserta] = useState<PesertaRow[]>([]);
  const [allCabang, setAllCabang] = useState<PesertaCabang[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    sub?: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchData = async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const [courseRes, progressRes, cabangRes] = await Promise.all([
        api.get(`/trainer/courses/${id}`),
        api.get('/trainer/peserta/progress', { params: { course_id: id, per_page: 200, bust: 1 } }),
        api.get('/trainer/peserta/semua'),
      ]);
      setCourse(courseRes.data);
      setPeserta(progressRes.data.data ?? []);
      setAllCabang(cabangRes.data.data ?? []);
    } catch (e: any) {
      if (e.response?.status === 403 || e.response?.status === 404) {
        navigate('/trainer/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleEnroll = async () => {
    if (!id || !selectedId) return;
    setEnrolling(true);
    try {
      await api.post(`/trainer/courses/${id}/enroll`, { id_pengguna: selectedId });
      setSelectedId('');
      setDropdownOpen(false);
      toast.success('Peserta berhasil didaftarkan.');
      await fetchData(true);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Gagal mendaftarkan peserta.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = (pesertaId: number, nama: string) => {
    if (!id) return;
    setConfirmDialog({
      message: `Keluarkan ${nama} dari kursus ini?`,
      sub: 'Progress peserta di kursus ini akan tetap tersimpan.',
      onConfirm: async () => {
        try {
          await api.delete(`/trainer/courses/${id}/peserta/${pesertaId}`);
          toast.success('Peserta berhasil dikeluarkan.');
          await fetchData(true);
        } catch (e: any) {
          toast.error(e.response?.data?.message ?? 'Gagal mengeluarkan peserta.');
        }
      },
    });
  };

  const enrollable = allCabang.filter((p) => !peserta.some((ep) => ep.id === p.id));
  const filteredEnrollable = enrollable.filter((p) =>
    p.nama.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          to="/trainer/courses"
          className="mt-1.5 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Course / Peserta</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course?.judul_kursus}</h1>
          <span className={`inline-flex items-center mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            course?.status === 'publish'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            {course?.status === 'publish' ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Peserta',  value: peserta.length,                                          icon: Users,       color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
          { label: 'Progres > 75%', value: peserta.filter((p) => (p.progress ?? 0) >= 75).length,   icon: TrendingUp,  color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
          { label: 'Progres < 50%', value: peserta.filter((p) => (p.progress ?? 0) < 50).length,    icon: TrendingUp,  color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
          { label: 'Tugas Selesai', value: peserta.reduce((a, p) => a + (p.tugas_selesai ?? 0), 0), icon: CheckSquare, color: 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400' },
        ].map((s) => (
          <div key={s.label} className={`${cardCls} p-5`}>
            <div className={`inline-flex p-2.5 rounded-lg ${s.color} mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className={`${cardCls} overflow-hidden`}>
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Daftar Peserta
            <span className="ml-2 text-xs font-normal text-gray-400">({peserta.length} terdaftar)</span>
          </p>

          {enrollable.length > 0 && (
            <div className="flex gap-2">
              {/* Custom searchable dropdown */}
              <div ref={dropdownRef} className="relative w-56">
                <button
                  type="button"
                  onClick={() => { setDropdownOpen((v) => !v); setDropdownSearch(''); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
                    ${dropdownOpen
                      ? 'border-red-500 ring-2 ring-red-500/30 bg-white dark:bg-[#0d0f14]'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0f14] hover:border-gray-300 dark:hover:border-white/20'}
                    ${selectedId ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  <span className="truncate">
                    {selectedId
                      ? (enrollable.find((p) => p.id === selectedId)?.nama ?? 'Pilih peserta')
                      : 'Pilih peserta'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/8">
                      <Search size={13} className="text-gray-400 shrink-0" />
                      <input
                        autoFocus
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        placeholder="Cari peserta..."
                        className="w-full text-sm bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                    <ul className="max-h-44 overflow-y-auto py-1">
                      {filteredEnrollable.length === 0 ? (
                        <li className="px-3 py-3 text-sm text-center text-gray-400 dark:text-gray-500">
                          Tidak ada peserta
                        </li>
                      ) : (
                        filteredEnrollable.map((p) => (
                          <li
                            key={p.id}
                            onClick={() => { setSelectedId(p.id); setDropdownOpen(false); }}
                            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors
                              ${selectedId === p.id
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            {p.nama}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={!selectedId || enrolling}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
              >
                <UserPlus size={15} />
                {enrolling ? 'Mendaftarkan...' : 'Daftarkan'}
              </button>
            </div>
          )}
        </div>

        {/* Table or empty */}
        {peserta.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada peserta terdaftar</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Gunakan dropdown di atas untuk mendaftarkan peserta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/4 border-b border-gray-200 dark:border-white/8">
                <tr>
                  <th className={thCls}>Peserta</th>
                  <th className={thCls}>Progres</th>
                  <th className={`${thCls} hidden sm:table-cell`}>Materi</th>
                  <th className={`${thCls} hidden sm:table-cell`}>Tugas</th>
                  <th className={`${thCls} hidden md:table-cell`}>Kuis</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {peserta.map((p) => (
                  <tr key={p.id} className={trCls}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                          {initials(p.nama)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{p.nama}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-32">
                        <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${progressColor(p.progress ?? 0)}`}
                            style={{ width: `${p.progress ?? 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold w-10 text-right shrink-0 ${progressText(p.progress ?? 0)}`}>
                          {p.progress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {p.materi_selesai}/{p.total_materi}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {p.tugas_selesai}/{p.total_tugas}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {p.kuis_selesai}/{p.total_kuis}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleUnenroll(p.id, p.nama)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Keluarkan dari kursus"
                      >
                        <UserMinus size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
