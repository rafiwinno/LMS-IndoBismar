import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, Clock, Search, Upload, Star, HelpCircle } from 'lucide-react';
import API from '../../api/api';

interface Tugas {
  id_tugas: number; judul_tugas: string; deskripsi: string | null;
  judul_kursus: string; deadline: string; nilai_maksimal: number;
  id_pengumpulan: number | null; nilai: number | null;
  status_pengumpulan: 'sudah' | 'belum';
}

interface Kuis {
  id_kuis: number; judul_kuis: string; judul_kursus: string;
  waktu_mulai: string; waktu_selesai: string;
  skor: number | null; status_attempt: string;
}

export default function Tasks() {
  const [tab, setTab]               = useState<'tugas' | 'kuis'>('tugas');
  const [tugasList, setTugasList]   = useState<Tugas[]>([]);
  const [kuisList, setKuisList]     = useState<Kuis[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('semua');
  const [search, setSearch]         = useState('');
  const location  = useLocation();
  const navigate  = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [error, setError]           = useState('');
  const [uploading, setUploading]   = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchAll = () => {
    setLoading(true);
    setError('');
    Promise.all([
      API.get('/user/tugas'),
      API.get('/user/kuis'),
    ])
      .then(([t, k]) => {
        setTugasList(t.data.data ?? []);
        setKuisList(k.data.data ?? []);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Gagal memuat data. Coba refresh halaman.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [location.key]);

  const handleUpload = async (id_tugas: number) => {
    if (!uploadFile) return;
    setUploadError(''); setUploadSuccess('');
    setUploading(id_tugas);
    try {
      const fd = new FormData();
      fd.append('file_tugas', uploadFile);
      await API.post(`/user/tugas/${id_tugas}/kumpul`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess('Tugas berhasil dikumpulkan!');
      setUploadFile(null);
      fetchAll();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Gagal mengumpulkan tugas.');
    } finally {
      setUploading(null);
    }
  };

  // Filter & search helpers
  const filteredTugas = tugasList.filter(t => {
    const matchSearch = search
      ? t.judul_tugas.toLowerCase().includes(search) || t.judul_kursus.toLowerCase().includes(search)
      : true;
    const matchFilter =
      filter === 'belum'   ? t.status_pengumpulan === 'belum' :
      filter === 'selesai' ? t.status_pengumpulan === 'sudah' : true;
    return matchSearch && matchFilter;
  });

  const filteredKuis = kuisList.filter(k => {
    const matchSearch = search
      ? k.judul_kuis.toLowerCase().includes(search) || k.judul_kursus.toLowerCase().includes(search)
      : true;
    const matchFilter =
      filter === 'belum'   ? k.status_attempt === 'belum' :
      filter === 'selesai' ? k.status_attempt === 'sudah' : true;
    return matchSearch && matchFilter;
  });

  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={fetchAll} className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline">Coba lagi</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tugas & Kuis</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kerjakan tugas dan kuis dari trainer Anda</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['semua', 'belum', 'selesai'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/8 hover:bg-gray-50'}`}>
              {f === 'semua' ? 'Semua' : f === 'belum' ? 'Belum Selesai' : 'Selesai'}
            </button>
          ))}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#161b27] border border-gray-200 dark:border-white/8 rounded-lg w-44">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input ref={searchRef} type="text" placeholder="Cari..." defaultValue={search}
              className="bg-transparent outline-none w-full text-sm text-gray-900 dark:text-white placeholder-gray-400"
              onChange={e => setSearch(e.target.value.toLowerCase())} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-gray-100 dark:bg-white/6 p-1 rounded-xl gap-1">
        {[{ key: 'tugas', label: 'Tugas', icon: FileText }, { key: 'kuis', label: 'Kuis', icon: HelpCircle }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white dark:bg-[#161b27] text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Memuat...</div>
      ) : tab === 'tugas' ? (
        /* ── TUGAS TAB ── */
        filteredTugas.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Tidak ada tugas ditemukan.</div>
        ) : (
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/8">
                  <tr>
                    <th className="px-6 py-4">Tugas</th>
                    <th className="px-6 py-4">Kursus</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                  {filteredTugas.map(t => (
                    <tr key={t.id_tugas} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{t.judul_tugas}</p>
                            {t.deskripsi && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.deskripsi}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{t.judul_kursus}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Clock size={13} />
                          <span className="text-sm">{new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {t.status_pengumpulan === 'sudah' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle size={13} /> Dikumpulkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                            <AlertCircle size={13} /> Belum
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.status_pengumpulan === 'sudah' ? (
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {t.nilai !== null ? `Nilai: ${t.nilai}` : '✓ Dikumpulkan'}
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                              <Upload size={13} />
                              {uploadFile && uploading === null ? uploadFile.name.slice(0, 12) + '...' : 'Pilih File'}
                              <input type="file" className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                                onChange={e => { setUploadFile(e.target.files?.[0] || null); setUploadError(''); setUploadSuccess(''); }} />
                            </label>
                            <button
                              disabled={!uploadFile || uploading === t.id_tugas}
                              onClick={() => handleUpload(t.id_tugas)}
                              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                              {uploading === t.id_tugas ? 'Mengirim...' : 'Kumpulkan'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(uploadError || uploadSuccess) && (
              <div className={`px-6 py-3 text-sm border-t border-gray-100 dark:border-white/8 ${uploadError ? 'text-red-500' : 'text-emerald-600'}`}>
                {uploadError || uploadSuccess}
              </div>
            )}
          </div>
        )
      ) : (
        /* ── KUIS TAB ── */
        filteredKuis.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Tidak ada kuis ditemukan.</div>
        ) : (
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/8">
                  <tr>
                    <th className="px-6 py-4">Kuis</th>
                    <th className="px-6 py-4">Kursus</th>
                    <th className="px-6 py-4">Batas Waktu</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                  {filteredKuis.map(k => (
                    <tr key={k.id_kuis} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <HelpCircle size={16} />
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">{k.judul_kuis}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">{k.judul_kursus}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Clock size={13} />
                          <span>{new Date(k.waktu_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {k.status_attempt === 'sudah' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle size={13} /> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                            <AlertCircle size={13} /> Belum
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {k.status_attempt === 'sudah' ? (
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Nilai: {k.skor ?? '-'}</span>
                        ) : (
                          <Link to={`/tasks/quiz/${k.id_kuis}`}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
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
        )
      )}
    </div>
  );
}
