import { useEffect, useMemo, useState } from 'react';
import { Users, TrendingUp, CheckSquare, AlertCircle, BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import type { PesertaProgress } from '../types/trainer';
import { cardCls, thCls, trCls } from '../../lib/styles';

export default function TrainerProgress() {
  const [searchParams] = useSearchParams();
  const [peserta, setPeserta] = useState<PesertaProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const courseParam = searchParams.get('course');
  const [selectedCourse, setSelectedCourse] = useState<number | 'all'>(
    courseParam ? Number(courseParam) : 'all'
  );

  useEffect(() => {
    api.get('/trainer/peserta/progress')
      .then((res) => {
        setPeserta(res.data.data ?? res.data);
        setApiError(false);
      })
      .catch(() => {
        setApiError(true);
        setPeserta([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive unique courses from fetched data
  const courses = useMemo(() => {
    const map = new Map<number, string>();
    peserta.forEach((p) => map.set(p.id_kursus, p.course));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [peserta]);

  const filtered = useMemo(
    () => selectedCourse === 'all' ? peserta : peserta.filter((p) => p.id_kursus === selectedCourse),
    [peserta, selectedCourse],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progres Peserta</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pantau perkembangan belajar seluruh peserta PKL</p>
        </div>

        {/* Course filter */}
        {!loading && courses.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <BookOpen size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 min-w-44"
            >
              <option value="all">Semua Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {apiError && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Gagal memuat data progres peserta. Coba refresh halaman atau hubungi administrator.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className={`${cardCls} p-5 animate-pulse`}>
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/8 mb-3" />
              <div className="h-7 w-12 bg-gray-200 dark:bg-white/8 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-white/5 rounded" />
            </div>
          ))
        ) : (
          [
            { label: 'Total Peserta',  value: filtered.length,                                              icon: Users,       color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
            { label: 'Progres > 75%', value: filtered.filter((p) => (p.progress ?? 0) >= 75).length,       icon: TrendingUp,  color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
            { label: 'Progres < 50%', value: filtered.filter((p) => (p.progress ?? 0) < 50).length,        icon: TrendingUp,  color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
            { label: 'Tugas Selesai', value: filtered.reduce((a, p) => a + (p.tugas_selesai ?? 0), 0),     icon: CheckSquare, color: 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400' },
          ].map((s) => (
            <div key={s.label} className={`${cardCls} p-5`}>
              <div className={`inline-flex p-2.5 rounded-lg ${s.color} mb-3`}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))
        )}
      </div>

      {loading ? (
        <div className={`${cardCls} p-8 text-center text-gray-400 dark:text-gray-500`}>
          Memuat data...
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <Users size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {apiError
              ? 'Data tidak dapat dimuat dari server'
              : selectedCourse !== 'all'
              ? 'Belum ada peserta di course ini'
              : 'Belum ada data progres peserta'}
          </p>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/4 border-b border-gray-200 dark:border-white/8">
              <tr>
                <th className={thCls}>Nama Peserta</th>
                <th className={`${thCls} hidden md:table-cell`}>Course</th>
                <th className={thCls}>Progres</th>
                <th className={`${thCls} hidden md:table-cell`}>Tugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/6">
              {filtered.map((p) => (
                <tr key={`${p.id}-${p.id_kursus}`} className={trCls}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {(p.nama?.[0] ?? '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{p.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{p.course}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-full h-2 min-w-16">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (p.progress ?? 0) >= 75 ? 'bg-green-500' :
                            (p.progress ?? 0) >= 50 ? 'bg-amber-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${p.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-10 text-right">
                        {p.progress ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-gray-500 dark:text-gray-400">
                      {p.tugas_selesai ?? 0}/{p.total_tugas ?? 0} selesai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
