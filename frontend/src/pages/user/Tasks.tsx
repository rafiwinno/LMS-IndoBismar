import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react';
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
  const [filter, setFilter] = useState('semua');
  const location = useLocation();

  const fetchKuis = () => {
    setLoading(true);
    API.get('/user/kuis')
      .then(res => setKuisList(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKuis();
  }, [location.key]); // refresh setiap kali navigasi ke halaman ini

  const filtered = kuisList.filter(k => {
    if (filter === 'belum') return k.status_attempt === 'belum';
    if (filter === 'selesai') return k.status_attempt === 'sudah';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tugas & Kuis</h1>
          <p className="text-slate-500 text-sm mt-1">Kerjakan kuis dari trainer Anda</p>
        </div>
        <div className="flex gap-2">
          {['semua', 'belum', 'selesai'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === f
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'semua' ? 'Semua' : f === 'belum' ? 'Belum Selesai' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Memuat kuis...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-12">Tidak ada kuis ditemukan.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Kuis</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Batas Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((kuis) => (
                  <tr key={kuis.id_kuis} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <FileText size={18} />
                        </div>
                        <p className="font-semibold text-slate-900">{kuis.judul_kuis}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{kuis.judul_kursus}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={14} />
                        <span>{new Date(kuis.waktu_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {kuis.status_attempt === 'sudah' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          <AlertCircle size={14} /> Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {kuis.status_attempt === 'sudah' ? (
                        <span className="text-sm font-bold text-emerald-600">
                          Nilai: {kuis.skor ?? '-'}
                        </span>
                      ) : (
                        <Link
                          to={`/tasks/quiz/${kuis.id_kuis}`}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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