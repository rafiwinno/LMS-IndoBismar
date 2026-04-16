import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Eye, EyeOff, ArrowLeft, CheckCircle2, BookOpen, Award, Users, GraduationCap } from 'lucide-react';
import API from '../api/api';
import { saveToken, saveUser } from './types';
import logoBismar from '../assets/logo-bismar.png';

type Mode = 'main' | 'admin' | 'trainer' | 'register';

export default function Login() {
  const [mode, setMode] = useState<Mode>('main');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('lms_dark') === 'true';
    document.documentElement.classList.remove('dark');
    return () => {
      if (stored) document.documentElement.classList.add('dark');
    };
  }, []);

  const handleLogin = (user: any, token: string) => {
    saveToken(token);
    const idRole = user.id_role;
    saveUser({
      id:    user.id_pengguna,
      nama:  user.nama,
      email: user.email,
      role:  idRole === 1 ? 'superadmin' : idRole === 2 ? 'admin' : idRole === 3 ? 'trainer' : 'user',
    });
    if (idRole === 1)      navigate('/superadmin/dashboard', { replace: true });
    else if (idRole === 2) navigate('/admin/dashboard',      { replace: true });
    else if (idRole === 3) navigate('/trainer/dashboard',    { replace: true });
    else                   navigate('/dashboard',            { replace: true });
  };

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Left brand panel (desktop only) ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 shrink-0 bg-red-600 flex-col relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-red-800/40" />
        <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-40 h-40 rounded-full bg-red-500/30" />

        <div className="relative flex flex-col h-full p-10">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <img src={logoBismar} alt="PT Indo Bismar" className="w-11 h-11 rounded-xl shadow object-cover" />
            <div>
              <p className="text-white font-bold text-base leading-none">Indo Bismar</p>
              <p className="text-red-200 text-xs mt-0.5">Learning Management System</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-16 mb-auto">
            <h2 className="text-white text-[2.1rem] font-bold leading-tight tracking-tight">
              Platform<br />Pelatihan Digital<br />Terpadu
            </h2>
            <p className="text-red-200 text-sm leading-relaxed mt-4 max-w-[280px]">
              Kelola pembelajaran PKL Anda dengan efisien. Akses materi, ikuti evaluasi, dan raih sertifikasi dalam satu platform.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 mb-10">
            {[
              { icon: BookOpen, label: 'Materi pelatihan terstruktur' },
              { icon: Award,    label: 'Evaluasi & sertifikasi digital' },
              { icon: Users,    label: 'Monitoring progress real-time' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-red-300/80 text-xs border-t border-white/15 pt-4">
            © {new Date().getFullYear()} PT Indo Bismar. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────── */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-y-auto">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
          <img src={logoBismar} alt="PT Indo Bismar" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Indo Bismar</p>
            <p className="text-gray-400 text-xs mt-0.5">Learning Management System</p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            {mode === 'main'     && <UserLoginForm    onLogin={handleLogin} onSwitchAdmin={() => setMode('admin')} onSwitchTrainer={() => setMode('trainer')} onSwitchRegister={() => setMode('register')} />}
            {mode === 'admin'    && <AdminLoginForm   onLogin={handleLogin} onBack={() => setMode('main')} />}
            {mode === 'trainer'  && <TrainerLoginForm onLogin={handleLogin} onBack={() => setMode('main')} />}
            {mode === 'register' && <RegisterForm     onBack={() => setMode('main')} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared input classes ─────────────────────────────────────────────────────
const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50';

// ─── User Login ───────────────────────────────────────────────────────────────
function UserLoginForm({ onLogin, onSwitchAdmin, onSwitchTrainer, onSwitchRegister }: any) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; setError(''); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/login/peserta', { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah');
      setPassword('');
      if (err.response?.data?.retry_after) startCountdown(err.response.data.retry_after);
    } finally { setLoading(false); }
  };

  const isLocked = countdown > 0;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang</h1>
        <p className="text-gray-500 text-sm mt-1">Masuk ke akun peserta Anda</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
          <span className="text-red-500 text-base leading-none mt-0.5">!</span>
          <p className="text-red-600 text-sm">
            {error}{isLocked && <span className="font-semibold"> Coba lagi dalam {countdown} detik.</span>}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@sekolah.com" required disabled={isLocked}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password" required disabled={isLocked}
              className={inputCls + ' pr-10'}
            />
            <button
              type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading || isLocked}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
        >
          {loading ? 'Masuk...' : isLocked ? `Tunggu ${countdown} detik...` : 'Masuk'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">atau</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onSwitchAdmin}
          className="w-full py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
        >
          <Shield className="w-4 h-4 text-amber-500" />
          Masuk sebagai Admin
        </button>
        <button
          onClick={onSwitchTrainer}
          className="w-full py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
        >
          <GraduationCap className="w-4 h-4 text-green-500" />
          Masuk sebagai Trainer
        </button>
        <button
          onClick={onSwitchRegister}
          className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Belum punya akun? Daftar sekarang
        </button>
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLoginForm({ onLogin, onBack }: any) {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; setError(''); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/login/staff', { username, password });
      onLogin(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username atau password salah');
      setUsername(''); setPassword('');
      if (err.response?.data?.retry_after) startCountdown(err.response.data.retry_after);
    } finally { setLoading(false); }
  };

  const isLocked = countdown > 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="mb-7">
        <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mb-4">
          <Shield className="w-5 h-5 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Portal Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Khusus Admin Cabang &amp; Admin Pusat</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
          <span className="text-red-500 text-base leading-none mt-0.5">!</span>
          <p className="text-red-600 text-sm">
            {error}{isLocked && <span className="font-semibold"> Coba lagi dalam {countdown} detik.</span>}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Masukkan username" required disabled={isLocked}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password" required disabled={isLocked}
              className={inputCls + ' pr-10'}
            />
            <button
              type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading || isLocked}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
        >
          {loading ? 'Masuk...' : isLocked ? `Tunggu ${countdown} detik...` : 'Masuk sebagai Admin'}
        </button>
      </form>
    </div>
  );
}

// ─── Trainer Login ────────────────────────────────────────────────────────────
function TrainerLoginForm({ onLogin, onBack }: any) {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; setError(''); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await API.post('/login/staff', { username, password });
      onLogin(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username atau password salah');
      setUsername(''); setPassword('');
      if (err.response?.data?.retry_after) startCountdown(err.response.data.retry_after);
    } finally { setLoading(false); }
  };

  const isLocked = countdown > 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="mb-7">
        <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mb-4">
          <GraduationCap className="w-5 h-5 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Portal Trainer</h1>
        <p className="text-gray-500 text-sm mt-1">Khusus Trainer Indo Bismar</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
          <span className="text-red-500 text-base leading-none mt-0.5">!</span>
          <p className="text-red-600 text-sm">
            {error}{isLocked && <span className="font-semibold"> Coba lagi dalam {countdown} detik.</span>}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Masukkan username" required disabled={isLocked}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password" required disabled={isLocked}
              className={inputCls + ' pr-10'}
            />
            <button
              type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading || isLocked}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
        >
          {loading ? 'Masuk...' : isLocked ? `Tunggu ${countdown} detik...` : 'Masuk sebagai Trainer'}
        </button>
      </form>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
function RegisterForm({ onBack }: any) {
  const [form, setForm] = useState({
    nama: '', username: '', email: '', password: '', password_confirmation: '',
    nomor_hp: '', asal_sekolah: '', jurusan: '', id_cabang: 1,
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError('Password tidak sama'); return; }
    setLoading(true); setError('');
    try {
      await API.post('/register', form);
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        const messages = Object.entries(data.errors as Record<string, string[]>)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join(' | ');
        setError(messages);
      } else {
        setError(data?.message || 'Registrasi gagal');
      }
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
      <p className="text-gray-500 text-sm mb-1.5">Akun Anda telah terdaftar. Silakan login dan upload dokumen persyaratan PKL Anda.</p>
      <p className="text-gray-400 text-xs mb-7">Dokumen akan diverifikasi oleh admin cabang setelah diupload.</p>
      <button
        onClick={onBack}
        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Kembali ke Halaman Login
      </button>
    </div>
  );

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="mb-6">
        <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center mb-4">
          <UserPlus className="w-5 h-5 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
        <p className="text-gray-500 text-sm mt-1">Untuk peserta PKL Indo Bismar</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'nama',         label: 'Nama Lengkap',  type: 'text',  placeholder: 'Nama lengkap',       colSpan: 2 },
            { key: 'username',     label: 'Username',      type: 'text',  placeholder: 'Username unik',       colSpan: 1 },
            { key: 'nomor_hp',     label: 'Nomor HP',      type: 'tel',   placeholder: '08xxxxxxxxxx',        colSpan: 1 },
            { key: 'email',        label: 'Email',         type: 'email', placeholder: 'email@example.com',   colSpan: 2 },
            { key: 'asal_sekolah', label: 'Asal Sekolah',  type: 'text',  placeholder: 'SMKN 1 ...',          colSpan: 1 },
            { key: 'jurusan',      label: 'Jurusan',       type: 'text',  placeholder: 'Teknik Informatika',  colSpan: 1 },
          ].map(({ key, label, type, placeholder, colSpan }) => (
            <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type} placeholder={placeholder} value={(form as any)[key]} required
                onChange={e => setForm(f => ({ ...f, [key]: key === 'nomor_hp' ? e.target.value.replace(/\D/g, '') : e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} placeholder="Min. 8 karakter" value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={inputCls + ' pr-10'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'} placeholder="Ulangi password" value={form.password_confirmation} required
                onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                className={inputCls + ' pr-10'}
              />
              <button type="button" onClick={() => setShowConf(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
