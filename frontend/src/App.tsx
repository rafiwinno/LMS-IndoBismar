import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Sidebar } from './components/admin/Sidebar';
import Header from './components/admin/Header';
import Login from './pages/admin/Login';

const Dashboard    = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Participants = lazy(() => import('./pages/admin/Participants').then(m => ({ default: m.Participants })));
const Courses      = lazy(() => import('./pages/admin/Courses').then(m => ({ default: m.Courses })));
const Exams        = lazy(() => import('./pages/admin/Exams').then(m => ({ default: m.Exams })));
const Trainers     = lazy(() => import('./pages/admin/Trainers').then(m => ({ default: m.Trainers })));
const Reports      = lazy(() => import('./pages/admin/Reports').then(m => ({ default: m.Reports })));
import { Toaster } from './components/admin/Toaster';
import { ConfirmDialog } from './components/admin/ConfirmDialog';
import { ToastProvider } from './lib/toast';
import { api } from './lib/api';
import { Upload, CheckCircle2, Clock, XCircle, LogOut, FileText, ClipboardList, ChevronLeft, Award, Download } from 'lucide-react';

// ─── Portal Peserta ────────────────────────────────────────────────────────────
function PesertaPortal({ user, onLogout, onUserUpdate }: { user: any; onLogout: () => void; onUserUpdate: (u: any) => void }) {
  const [activeTab, setActiveTab]   = useState<'dokumen' | 'tugas'>('dokumen');

  // Dokumen state
  const [suratSiswa, setSuratSiswa] = useState<File | null>(null);
  const [suratOrtu, setSuratOrtu]   = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const siswaRef = useRef<HTMLInputElement>(null);
  const ortuRef  = useRef<HTMLInputElement>(null);

  // Tugas state
  const [tugasList, setTugasList]       = useState<any[]>([]);
  const [tugasLoading, setTugasLoading] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<any | null>(null);
  const [jawaban, setJawaban]           = useState<File | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadMsg, setUploadMsg]       = useState('');
  const jawabanRef = useRef<HTMLInputElement>(null);

  const statusDokumen  = user.status_dokumen  ?? 'belum_upload';
  const catatanDokumen = user.catatan_dokumen ?? '';

  // Fetch tugas list
  useEffect(() => {
    if (activeTab !== 'tugas') return;
    setTugasLoading(true);
    api.getMyTugas()
      .then(res => setTugasList(res.data ?? []))
      .catch(() => {})
      .finally(() => setTugasLoading(false));
  }, [activeTab]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suratSiswa || !suratOrtu) { setError('Kedua file harus diisi.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('surat_siswa', suratSiswa);
      fd.append('surat_ortu',  suratOrtu);
      await api.uploadDokumen(fd);
      setSuccess('Dokumen berhasil diupload. Menunggu verifikasi dari admin cabang.');
      setSuratSiswa(null); setSuratOrtu(null);
      if (siswaRef.current) siswaRef.current.value = '';
      if (ortuRef.current)  ortuRef.current.value  = '';
      const fresh = await api.me();
      onUserUpdate(fresh);
    } catch (err: any) {
      setError(err.message || 'Upload gagal.');
    } finally { setLoading(false); }
  };

  const handleSubmitTugas = async () => {
    if (!jawaban || !selectedTugas) return;
    setUploading(true); setUploadMsg('');
    try {
      const fd = new FormData();
      fd.append('file_tugas', jawaban);
      await api.submitTugas(selectedTugas.id, fd);
      setUploadMsg('Tugas berhasil dikumpulkan!');
      setJawaban(null);
      if (jawabanRef.current) jawabanRef.current.value = '';
      // Refresh tugas detail
      const res = await api.getMyTugas();
      const updated = (res.data ?? []).find((t: any) => t.id === selectedTugas.id);
      if (updated) { setSelectedTugas(updated); setTugasList(res.data); }
    } catch (err: any) {
      setUploadMsg(err.message || 'Upload gagal.');
    } finally { setUploading(false); }
  };

  // ── Dokumen tab ───────────────────────────────────────────────────────
  const showForm = statusDokumen === 'belum_upload' || statusDokumen === 'ditolak';

  const DokumenField = ({ label, file, inputRef, onChange, hint }: { label: string; file: File | null; inputRef: React.RefObject<HTMLInputElement>; onChange: (f: File) => void; hint: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/10'}`}>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
        {file
          ? <><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /><span className="text-sm text-emerald-300 truncate">{file.name}</span></>
          : <><Upload className="w-5 h-5 text-slate-400 shrink-0" /><div><p className="text-sm text-slate-300">{hint}</p><p className="text-xs text-slate-500">Format PDF, maks 5MB</p></div></>
        }
      </label>
    </div>
  );

  const renderStatusDokumen = () => {
    const configs: Record<string, { icon: React.ReactNode; bg: string; border: string; title: string; desc: string }> = {
      menunggu:     { icon: <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />,    bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  title: 'Dokumen Sedang Diverifikasi',  desc: 'Dokumen Anda sedang ditinjau oleh admin cabang.' },
      disetujui:    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', title: 'Dokumen Disetujui', desc: 'Dokumen Anda telah diverifikasi. Akun Anda sudah aktif.' },
      ditolak:      { icon: <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />,     bg: 'bg-red-500/10',    border: 'border-red-500/30',    title: 'Dokumen Ditolak',  desc: catatanDokumen ? `Catatan: ${catatanDokumen}` : 'Silakan upload ulang.' },
      belum_upload: { icon: <FileText className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />,   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   title: 'Dokumen Belum Diupload', desc: 'Upload dokumen persyaratan PKL Anda.' },
    };
    const cfg = configs[statusDokumen] ?? configs.belum_upload;
    return (
      <div className={`flex items-start gap-3 p-4 ${cfg.bg} border ${cfg.border} rounded-xl`}>
        {cfg.icon}
        <div>
          <p className="font-semibold text-white text-sm">{cfg.title}</p>
          <p className="text-slate-400 text-xs mt-0.5">{cfg.desc}</p>
        </div>
      </div>
    );
  };

  // ── Tugas detail view ─────────────────────────────────────────────────
  if (selectedTugas) {
    const fmt = (d: string) => new Date(d).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    return (
      <div className="min-h-screen bg-[#0a0c10] font-sans">
        <header className="h-14 bg-[#0f1117] border-b border-white/8 flex items-center justify-between px-5 sticky top-0 z-10">
          <button onClick={() => { setSelectedTugas(null); setJawaban(null); setUploadMsg(''); }}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Kembali ke daftar tugas
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* Info Card */}
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-sm mb-1">{selectedTugas.kursus}</p>
                <h1 className="text-2xl font-bold text-white">{selectedTugas.judul}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Deadline: <strong className="text-white">{fmt(selectedTugas.deadline)}</strong></span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Nilai Maksimal: <strong className="text-white">{selectedTugas.nilai_maksimal}</strong></span>
                </div>
              </div>
              {selectedTugas.sudah_kumpul && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold whitespace-nowrap shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dikumpulkan
                </span>
              )}
            </div>

            {selectedTugas.deskripsi && (
              <>
                <div className="border-t border-white/8 my-4" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Tugas</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{selectedTugas.deskripsi}</p>
                </div>
              </>
            )}

            {selectedTugas.file_soal_url && (
              <>
                <div className="border-t border-white/8 my-4" />
                <a href={selectedTugas.file_soal_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors">
                  <Download className="w-4 h-4" /> Download Soal PDF
                </a>
              </>
            )}
          </div>

          {/* Status Pengumpulan */}
          {selectedTugas.sudah_kumpul && (
            <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-semibold text-white mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Status Pengumpulan
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Tanggal Kumpul</p>
                  <p className="text-white font-medium text-sm">{fmt(selectedTugas.tanggal_kumpul)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Nilai</p>
                  <p className={`font-medium text-sm ${selectedTugas.nilai !== null ? 'text-white' : 'text-slate-500'}`}>
                    {selectedTugas.nilai !== null ? `${selectedTugas.nilai} / ${selectedTugas.nilai_maksimal}` : 'Belum dinilai'}
                  </p>
                </div>
              </div>
              {selectedTugas.feedback && (
                <div className="mt-3 bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Feedback Trainer</p>
                  <p className="text-slate-200 text-sm">{selectedTugas.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Jawaban */}
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
            <h2 className="flex items-center gap-2 font-semibold text-white mb-4">
              <Upload className="w-5 h-5 text-red-400" />
              {selectedTugas.sudah_kumpul ? 'Ganti File Tugas' : 'Kumpulkan Tugas'}
            </h2>

            {uploadMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${uploadMsg.includes('berhasil') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {uploadMsg}
              </div>
            )}

            <label className={`flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${jawaban ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/15 hover:border-white/30 bg-white/3'}`}>
              <input ref={jawabanRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden"
                onChange={e => setJawaban(e.target.files?.[0] ?? null)} />
              {jawaban
                ? <><CheckCircle2 className="w-6 h-6 text-emerald-400" /><span className="text-sm text-emerald-300">{jawaban.name}</span></>
                : <><FileText className="w-6 h-6 text-slate-500" /><span className="text-sm text-slate-400">Klik untuk pilih file</span><span className="text-xs text-slate-600">PDF, DOC, DOCX, JPG, PNG — Maks. 5MB</span></>
              }
            </label>

            {jawaban && (
              <button onClick={handleSubmitTugas} disabled={uploading}
                className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? 'Mengupload...' : 'Kumpulkan Tugas'}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── Main portal (list view) ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0c10] font-sans">
      <header className="h-14 bg-[#0f1117] border-b border-white/8 flex items-center justify-between px-5 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">IB</div>
          <span className="text-white font-semibold text-sm">LMS Indo Bismar</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden sm:block">{user.nama}</span>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/8 px-5">
        <div className="max-w-2xl mx-auto flex gap-1">
          {([['dokumen', 'Dokumen PKL', <FileText className="w-4 h-4" />], ['tugas', 'Tugas Saya', <ClipboardList className="w-4 h-4" />]] as const).map(([tab, label, icon]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* ── Dokumen Tab ── */}
        {activeTab === 'dokumen' && <>
          <div>
            <h1 className="text-xl font-bold text-white">Upload Dokumen PKL</h1>
            <p className="text-slate-400 text-sm mt-1">Halo, <span className="text-white font-medium">{user.nama}</span>. Upload dokumen persyaratan PKL Anda.</p>
          </div>

          {renderStatusDokumen()}

          {showForm && (
            <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Upload Dokumen Persyaratan</h2>
              {error   && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}
              <form onSubmit={handleUpload} className="space-y-4">
                <DokumenField label="Surat Pernyataan Siswa PKL" file={suratSiswa} inputRef={siswaRef} onChange={setSuratSiswa} hint="Upload surat pernyataan siswa PKL" />
                <DokumenField label="Surat Pernyataan Orang Tua" file={suratOrtu} inputRef={ortuRef} onChange={setSuratOrtu} hint="Upload surat pernyataan orang tua" />
                <button type="submit" disabled={loading || !suratSiswa || !suratOrtu}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  {loading ? 'Mengupload...' : 'Upload Dokumen'}
                </button>
              </form>
            </div>
          )}
        </>}

        {/* ── Tugas Tab ── */}
        {activeTab === 'tugas' && <>
          <div>
            <h1 className="text-xl font-bold text-white">Tugas Saya</h1>
            <p className="text-slate-400 text-sm mt-1">Daftar tugas dari kursus yang Anda ikuti.</p>
          </div>

          {tugasLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : tugasList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Belum ada tugas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tugasList.map(t => {
                const isLate = new Date(t.deadline) < new Date() && !t.sudah_kumpul;
                return (
                  <button key={t.id} onClick={() => { setSelectedTugas(t); setUploadMsg(''); }}
                    className="w-full text-left bg-[#161b22] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs mb-1">{t.kursus}</p>
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{t.judul}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Maks: {t.nilai_maksimal}</span>
                        </div>
                      </div>
                      <div className="shrink-0 mt-1">
                        {t.sudah_kumpul ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Dikumpulkan
                          </span>
                        ) : isLate ? (
                          <span className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">Terlambat</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium">Belum</span>
                        )}
                      </div>
                    </div>
                    {t.sudah_kumpul && t.nilai !== null && (
                      <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2 text-xs text-slate-400">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        Nilai: <span className="text-white font-semibold">{t.nilai}</span> / {t.nilai_maksimal}
                        {t.feedback && <span className="ml-2 text-slate-500">· {t.feedback}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>}
      </main>
    </div>
  );
}

// ─── App Utama ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cachedUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const [user, setUser] = useState<any>(cachedUser);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    // Verifikasi token di background — tidak memblokir render
    api.me()
      .then((userData: any) => {
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
      });
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const handleUserUpdate = (userData: any) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };


  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Peserta (id_role=4) diarahkan ke portal upload dokumen
  if (user.id_role === 4) {
    return (
      <ToastProvider>
        <Toaster />
        <PesertaPortal user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      </ToastProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':    return <Dashboard />;
      case 'participants': return <Participants />;
      case 'courses':      return <Courses />;
      case 'exams':        return <Exams />;
      case 'trainers':     return <Trainers />;
      case 'reports':      return <Reports />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            <h2 className="text-2xl font-semibold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
            </h2>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0c10] font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <Toaster />
      <ConfirmDialog />
      <div id="no-print">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
          user={user}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div id="no-print">
          <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="flex justify-center items-center py-32"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
