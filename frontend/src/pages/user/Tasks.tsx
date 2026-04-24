import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, Clock, Search } from 'lucide-react';
import API from '../../api/api';

interface Kuis {
  id_kuis: number;
  judul_kuis: string;
  judul_kursus: string;
  waktu_mulai: string;
  waktu_selesai: string;
  skor: number | null;
  status_attempt: string;
}

export default function Tasks() {
  const [kuisList, setKuisList] = useState<Kuis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('semua');
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get('search')?.toLowerCase().trim() ?? '';

  const fetchKuis = () => {
    setLoading(true);
    API.get('/user/kuis')
      .then(res => setKuisList(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKuis(); }, [location.key]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value.trim();
      navigate(query ? `/tasks?search=${encodeURIComponent(query)}` : '/tasks');
    }
  };

  const filtered = kuisList.filter(k => {
    const matchSearch = searchQuery
      ? k.judul_kuis.toLowerCase().includes(searchQuery) || k.judul_kursus.toLowerCase().includes(searchQuery)
      : true;
    const matchStatus =
      filter === 'belum'   ? k.status_attempt === 'belum' :
      filter === 'selesai' ? k.status_attempt === 'sudah' : true;
    return matchSearch && matchStatus;
  });

  if (error) return <div className="text-center text-red-500 py-12">Gagal memuat kuis. Silakan refresh halaman.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kuis</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {searchQuery
              ? <>Hasil pencarian: <span className="font-semibold text-red-600 dark:text-red-400">"{searchQuery}"</span></>
              : 'Kerjakan kuis dari trainer Anda'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['semua', 'belum', 'selesai'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                  : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/8 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {f === 'semua' ? 'Semua' : f === 'belum' ? 'Belum Selesai' : 'Selesai'}
            </button>
          ))}

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/8 rounded-lg text-gray-500 dark:text-gray-400 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all w-52">
            <Search size={16} className="flex-shrink-0" />
            <input
              type="text"
              defaultValue={searchQuery}
              placeholder="Cari kuis..."
              className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              onKeyDown={handleSearch}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">Memuat kuis...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          {searchQuery ? `Tidak ada kuis yang cocok dengan "${searchQuery}".` : 'Tidak ada kuis ditemukan.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/8">
                <tr>
                  <th className="px-6 py-4">Nama Kuis</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Batas Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                {filtered.map((kuis) => (
                  <tr key={kuis.id_kuis} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <FileText size={18} />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{kuis.judul_kuis}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{kuis.judul_kursus}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Clock size={14} />
                        <span>{new Date(kuis.waktu_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {kuis.status_attempt === 'sudah' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          <AlertCircle size={14} /> Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {kuis.status_attempt === 'sudah' ? (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Nilai: {kuis.skor ?? '-'}
                        </span>
                      ) : (
                        <Link
                          to={`/tasks/quiz/${kuis.id_kuis}`}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Kerjakan
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}