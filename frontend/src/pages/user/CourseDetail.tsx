import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PlayCircle, FileText, CheckCircle, Circle,
  ChevronLeft, ChevronDown, ChevronRight,
  BookOpen, Award, Clock, AlertCircle, ClipboardList, Upload,
} from 'lucide-react';
import API from '../../api/api';

interface Materi {
  id_materi: number;
  judul_materi: string;
  tipe_materi: 'video' | 'pdf';
  file_materi: string;
  sub_bab: string | null;
  urutan: number;
  status_progress: string;
}

interface KuisItem {
  id_kuis: number;
  judul_kuis: string;
  waktu_selesai: string;
  skor: number | null;
  status_attempt: 'sudah' | 'belum';
}

interface TugasItem {
  id_tugas: number;
  judul_tugas: string;
  deskripsi: string | null;
  deadline: string;
  nilai: number | null;
  status_pengumpulan: 'sudah' | 'belum';
}

interface Kursus {
  id_kursus: number;
  judul_kursus: string;
  deskripsi: string;
  nama_trainer: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kursus, setKursus] = useState<Kursus | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [kuisList, setKuisList] = useState<KuisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeMateri, setActiveMateri] = useState<Materi | null>(null);
  const [openBab, setOpenBab] = useState<Record<string, boolean>>({});
  const [markingDone, setMarkingDone] = useState(false);
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [uploadingTugas, setUploadingTugas] = useState<number | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Record<number, File>>({});
  const [uploadMsg, setUploadMsg] = useState<Record<number, { ok: boolean; msg: string }>>({});

  const fetchData = () => {
    setLoading(true);
    setFetchError('');
    Promise.all([
      API.get(`/user/kursus/${id}`),
      API.get('/user/tugas'),
    ]).then(([kursusRes, tugasRes]) => {
        setKursus(kursusRes.data.kursus);
        setMateri(kursusRes.data.materi);
        setKuisList(kursusRes.data.kuis ?? []);
        const babKeys: Record<string, boolean> = {};
        kursusRes.data.materi.forEach((m: Materi) => {
          const key = m.sub_bab ?? 'Materi Lainnya';
          babKeys[key] = true;
        });
        setOpenBab(babKeys);
        const allTugas: TugasItem[] = tugasRes.data.data ?? [];
        setTugasList(allTugas.filter((t: TugasItem & { id_kursus: number }) => t.id_kursus === Number(id)));
      })
      .catch(err => {
        setFetchError(err.response?.data?.message || 'Gagal memuat detail kursus. Coba refresh halaman.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleUploadTugas = async (id_tugas: number) => {
    const file = uploadFiles[id_tugas];
    if (!file) return;
    setUploadingTugas(id_tugas);
    setUploadMsg(m => ({ ...m, [id_tugas]: { ok: false, msg: '' } }));
    try {
      const fd = new FormData();
      fd.append('file_tugas', file);
      await API.post(`/user/tugas/${id_tugas}/kumpul`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg(m => ({ ...m, [id_tugas]: { ok: true, msg: 'Tugas berhasil dikumpulkan!' } }));
      setUploadFiles(f => { const n = { ...f }; delete n[id_tugas]; return n; });
      fetchData();
    } catch (err: any) {
      setUploadMsg(m => ({ ...m, [id_tugas]: { ok: false, msg: err.response?.data?.message || 'Gagal mengumpulkan.' } }));
    } finally {
      setUploadingTugas(null);
    }
  };

  const grouped = materi.reduce((acc, item) => {
    const key = item.sub_bab ?? 'Materi Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Materi[]>);

  const handleMarkDone = async () => {
    if (!activeMateri) return;
    setMarkingDone(true);
    try {
      await API.post(`/user/kursus/${id}/materi/${activeMateri.id_materi}/progress`);
      setMateri(prev => prev.map(m =>
        m.id_materi === activeMateri.id_materi
          ? { ...m, status_progress: 'selesai' }
          : m
      ));
      setActiveMateri(prev => prev ? { ...prev, status_progress: 'selesai' } : null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menandai materi selesai.');
    } finally {
      setMarkingDone(false);
    }
  };

  if (loading) return (
    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
      Memuat detail kursus...
    </div>
  );

  if (fetchError) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-medium">{fetchError}</p>
      <button onClick={fetchData} className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline">Coba lagi</button>
    </div>
  );

  if (!kursus) return (
    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
      Kursus tidak ditemukan.
    </div>
  );

  const renderEmbed = (item: Materi) => {
    if (item.tipe_materi === 'video') {
      const ytId = getYouTubeId(item.file_materi);
      if (ytId) {
        return (
          <iframe
            key={item.id_materi}
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full aspect-video rounded-xl bg-gray-100 dark:bg-white/5"
            allowFullScreen
          />
        );
      }
      return (
        <a
          href={item.file_materi}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
        >
          <PlayCircle size={16} /> Buka Video
        </a>
      );
    }

    return (
      <iframe
        key={item.id_materi}
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(item.file_materi)}&embedded=true`}
        className="w-full h-[500px] rounded-xl bg-gray-100 dark:bg-white/5"
      />
    );
  };

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Kembali ke Daftar Kursus
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-white/8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {kursus.judul_kursus}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{kursus.deskripsi}</p>
        {kursus.nama_trainer && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Trainer: <span className="font-medium text-gray-600 dark:text-gray-300">{kursus.nama_trainer}</span>
          </p>
        )}
      </div>

      {/* Dua Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar Kiri */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/8">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Materi Pembelajaran
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/8">
              {Object.entries(grouped).map(([bab, items]) => (
                <div key={bab}>
                  <button
                    onClick={() => setOpenBab(prev => ({ ...prev, [bab]: !prev[bab] }))}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {bab}
                    </span>
                    {openBab[bab]
                      ? <ChevronDown size={14} className="text-gray-400" />
                      : <ChevronRight size={14} className="text-gray-400" />
                    }
                  </button>

                  {openBab[bab] && items.map(item => (
                    <button
                      key={item.id_materi}
                      onClick={() => setActiveMateri(item)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                        activeMateri?.id_materi === item.id_materi
                          ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {item.status_progress === 'selesai' ? (
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          activeMateri?.id_materi === item.id_materi
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {item.judul_materi}
                        </p>
                      </div>
                      {item.tipe_materi === 'video'
                        ? <PlayCircle size={14} className="text-gray-400 shrink-0" />
                        : <FileText size={14} className="text-gray-400 shrink-0" />
                      }
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Kanan */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden min-h-[400px]">
            {!activeMateri ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                  <BookOpen size={32} className="text-gray-300 dark:text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Pilih materi untuk mulai belajar
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Klik salah satu materi di sebelah kiri
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                      {activeMateri.sub_bab}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {activeMateri.judul_materi}
                    </h3>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    activeMateri.tipe_materi === 'video'
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {activeMateri.tipe_materi === 'video'
                      ? <><PlayCircle size={12} /> Video</>
                      : <><FileText size={12} /> PDF</>
                    }
                  </span>
                </div>

                {renderEmbed(activeMateri)}

                <div className="flex items-center gap-3 pt-2">
                  {activeMateri.status_progress === 'selesai' ? (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={16} /> Sudah Selesai
                    </span>
                  ) : (
                    <button
                      onClick={handleMarkDone}
                      disabled={markingDone}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {markingDone ? 'Menyimpan...' : <><CheckCircle size={16} /> Tandai Selesai</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Tugas */}
      {tugasList.length > 0 && (
        <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-indigo-500" /> Tugas
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/8">
            {tugasList.map(t => (
              <div key={t.id_tugas} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{t.judul_tugas}</p>
                    {t.deskripsi && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.deskripsi}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                      <Clock size={12} />
                      Deadline: {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {t.status_pengumpulan === 'sudah' ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle size={12} /> Dikumpulkan
                        </span>
                        {t.nilai !== null && <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Nilai: {t.nilai}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                          <Upload size={12} />
                          {uploadFiles[t.id_tugas] ? uploadFiles[t.id_tugas].name.slice(0, 14) + '…' : 'Pilih File'}
                          <input type="file" className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                            onChange={e => { const f = e.target.files?.[0]; if (f) setUploadFiles(prev => ({ ...prev, [t.id_tugas]: f })); }} />
                        </label>
                        <button
                          disabled={!uploadFiles[t.id_tugas] || uploadingTugas === t.id_tugas}
                          onClick={() => handleUploadTugas(t.id_tugas)}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                          {uploadingTugas === t.id_tugas ? 'Mengirim...' : 'Kumpulkan'}
                        </button>
                      </div>
                    )}
                    {uploadMsg[t.id_tugas]?.msg && (
                      <p className={`text-xs mt-1 ${uploadMsg[t.id_tugas].ok ? 'text-emerald-600' : 'text-red-500'}`}>
                        {uploadMsg[t.id_tugas].msg}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Kuis */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award size={20} className="text-red-500" />
            Kuis Terkait
          </h2>
        </div>

        {kuisList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Belum ada kuis untuk kursus ini.
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kuisList.map(kuis => (
              <div
                key={kuis.id_kuis}
                className="rounded-xl border border-gray-200 dark:border-white/8 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                    {kuis.judul_kuis}
                  </p>
                  {kuis.status_attempt === 'sudah' ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={11} /> Selesai
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <AlertCircle size={11} /> Belum
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Clock size={12} />
                  Deadline: {new Date(kuis.waktu_selesai).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>

                {kuis.status_attempt === 'sudah' ? (
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {kuis.skor} <span className="text-sm font-normal text-gray-400">/ 100</span>
                  </p>
                ) : (
                  <button
                    onClick={() => navigate(`/tasks/quiz/${kuis.id_kuis}`, {
                      state: { fromCourse: id }
                    })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Mulai Kuis
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}