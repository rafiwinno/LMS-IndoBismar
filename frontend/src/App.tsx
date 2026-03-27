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
import { Upload, CheckCircle2, Clock, XCircle, LogOut, FileText } from 'lucide-react';

// ─── Portal Peserta ────────────────────────────────────────────────────────────
function PesertaPortal({ user, onLogout, onUserUpdate }: { user: any; onLogout: () => void; onUserUpdate: (u: any) => void }) {
  const [suratSiswa, setSuratSiswa] = useState<File | null>(null);
  const [suratOrtu, setSuratOrtu]   = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const siswaRef = useRef<HTMLInputElement>(null);
  const ortuRef  = useRef<HTMLInputElement>(null);

  const statusDokumen   = user.status_dokumen   ?? 'belum_upload';
  const catatanDokumen  = user.catatan_dokumen  ?? '';

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
      setSuratSiswa(null);
      setSuratOrtu(null);
      if (siswaRef.current) siswaRef.current.value = '';
      if (ortuRef.current)  ortuRef.current.value  = '';
      // Refresh data user agar status_dokumen terupdate
      const fresh = await api.me();
      onUserUpdate(fresh);
    } catch (err: any) {
      setError(err.message || 'Upload gagal.');
    } finally { setLoading(false); }
  };

  const FileField = ({ label, file, inputRef, onChange, hint }: { label: string; file: File | null; inputRef: React.RefObject<HTMLInputElement>; onChange: (f: File) => void; hint: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]); }} />
        {file ? (
          <><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><span className="text-sm text-emerald-700 truncate">{file.name}</span></>
        ) : (
          <><Upload className="w-5 h-5 text-slate-400 shrink-0" /><div><p className="text-sm text-slate-600">{hint}</p><p className="text-xs text-slate-400">Format PDF, maks 5MB</p></div></>
        )}
      </label>
    </div>
  );

  const renderStatus = () => {
    if (statusDokumen === 'menunggu') return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Dokumen Sedang Diverifikasi</p>
          <p className="text-amber-700 text-xs mt-0.5">Dokumen Anda sedang ditinjau oleh admin cabang. Harap tunggu.</p>
        </div>
      </div>
    );
    if (statusDokumen === 'disetujui') return (
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-emerald-800 text-sm">Dokumen Disetujui</p>
          <p className="text-emerald-700 text-xs mt-0.5">Dokumen Anda telah diverifikasi. Akun Anda sudah aktif.</p>
        </div>
      </div>
    );
    if (statusDokumen === 'ditolak') return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-red-800 text-sm">Dokumen Ditolak</p>
          {catatanDokumen && <p className="text-red-700 text-xs mt-0.5">Catatan admin: {catatanDokumen}</p>}
          <p className="text-red-600 text-xs mt-1">Silakan upload ulang dokumen yang benar di bawah ini.</p>
        </div>
      </div>
    );
    return (
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <FileText className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">Dokumen Belum Diupload</p>
          <p className="text-blue-700 text-xs mt-0.5">Silakan upload dokumen persyaratan PKL Anda untuk melanjutkan proses verifikasi.</p>
        </div>
      </div>
    );
  };

  const showForm = statusDokumen === 'belum_upload' || statusDokumen === 'ditolak';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="h-16 bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">IB</div>
          <span className="text-white font-semibold text-sm">LMS Indo Bismar</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{user.nama}</p>
            <p className="text-slate-400 text-xs">Peserta PKL</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Dokumen PKL</h1>
          <p className="text-slate-500 text-sm mt-1">Halo, <span className="font-medium text-slate-700">{user.nama}</span>. Upload dokumen persyaratan PKL Anda di bawah ini.</p>
        </div>

        {/* Status */}
        {renderStatus()}

        {/* Form Upload */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Upload Dokumen Persyaratan</h2>

            {error   && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{success}</div>}

            <form onSubmit={handleUpload} className="space-y-4">
              <FileField
                label="Surat Pernyataan Siswa PKL"
                file={suratSiswa}
                inputRef={siswaRef}
                onChange={setSuratSiswa}
                hint="Upload surat pernyataan siswa PKL"
              />
              <FileField
                label="Surat Pernyataan Orang Tua"
                file={suratOrtu}
                inputRef={ortuRef}
                onChange={setSuratOrtu}
                hint="Upload surat pernyataan orang tua"
              />
              <button type="submit" disabled={loading || !suratSiswa || !suratOrtu}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                {loading ? 'Mengupload...' : 'Upload Dokumen'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── App Utama ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }
    // Verifikasi token ke server agar session yang expired/invalid tidak lolos
    api.me()
      .then((userData: any) => {
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      })
      .finally(() => setChecking(false));
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

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

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
