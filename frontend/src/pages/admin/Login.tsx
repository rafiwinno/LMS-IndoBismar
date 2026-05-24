import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { User, Shield, UserPlus, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound, Building2 } from 'lucide-react';

interface Cabang {
  id_cabang: number;
  nama_cabang: string;
}

interface LoginProps {
  onLogin: (user: any) => void;
}

type Mode = 'main' | 'admin' | 'register';

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<Mode>('main');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <span className="text-white font-bold text-2xl">IB</span>
          </div>
          <h1 className="text-2xl font-bold text-white">LMS Indo Bismar</h1>
          <p className="text-slate-400 text-sm mt-1">Learning Management System</p>
        </div>

        {mode === 'main'     && <UserLoginForm    onLogin={onLogin} onSwitchAdmin={() => setMode('admin')} onSwitchRegister={() => setMode('register')} />}
        {mode === 'admin'    && <AdminLoginForm   onLogin={onLogin} onBack={() => setMode('main')} />}
        {mode === 'register' && <RegisterForm     onBack={() => setMode('main')} />}
      </div>
    </div>
  );
}

// ─── User Login ───────────────────────────────────────────────────────────────
function UserLoginForm({ onLogin, onSwitchAdmin, onSwitchRegister }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (seconds: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.login(email, password);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
      setPassword('');
      if (err.retryAfter) startCountdown(err.retryAfter);
    } finally { setLoading(false); }
  };

  const isLocked = countdown > 0;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-lg"><User className="w-5 h-5 text-blue-400" /></div>
        <div>
          <h2 className="text-lg font-semibold text-white">Masuk sebagai Peserta</h2>
          <p className="text-xs text-slate-400">Gunakan email dan password Anda</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
          {isLocked && <span className="font-semibold"> ({countdown}s)</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@sekolah.com" required disabled={isLocked}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLocked}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 disabled:opacity-50" />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading || isLocked}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
          {loading ? 'Masuk...' : isLocked ? `Tunggu ${countdown} detik...` : 'Masuk'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500">atau</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      <div className="space-y-3">
        <button onClick={onSwitchAdmin}
          className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-600">
          <Shield className="w-4 h-4 text-amber-400" />
          Login sebagai Admin
        </button>
        <button onClick={onSwitchRegister}
          className="w-full py-2.5 bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700">
          <UserPlus className="w-4 h-4" />
          Daftar Akun Baru
        </button>
      </div>
    </div>
  );
}

// ─── Admin Login (username + password + OTP) ─────────────────────────────────
function AdminLoginForm({ onLogin, onBack }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OTP state
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpUsername, setOtpUsername] = useState('');

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = (seconds: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.loginAdmin(username, password);

      if (data.requires_otp) {
        // Server meminta OTP — tampilkan form OTP
        setOtpUsername(username);
        setOtpMode(true);
        setPassword('');
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Username atau password salah');
      setPassword('');
      if (err.retryAfter) startCountdown(err.retryAfter);
    } finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.verifyAdminOtp(otpUsername, otpCode);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Kode OTP tidak valid');
      setOtpCode('');
      if (err.retryAfter) startCountdown(err.retryAfter);
    } finally { setLoading(false); }
  };

  const isLocked = countdown > 0;

  if (otpMode) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-600/20">
        <button onClick={() => { setOtpMode(false); setOtpCode(''); setError(''); }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/20 rounded-lg"><KeyRound className="w-5 h-5 text-amber-400" /></div>
          <div>
            <h2 className="text-lg font-semibold text-white">Verifikasi OTP</h2>
            <p className="text-xs text-slate-400">Kode 6 digit telah dikirim ke email Anda</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}{isLocked && <span className="font-semibold"> ({countdown}s)</span>}
          </div>
        )}

        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
          Masukkan kode OTP yang dikirim ke email akun <strong>{otpUsername}</strong>. Kode berlaku 10 menit.
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Kode OTP</label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
              value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000" required autoFocus disabled={isLocked}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50"
            />
          </div>
          <button type="submit" disabled={loading || isLocked || otpCode.length !== 6}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
            {loading ? 'Memverifikasi...' : isLocked ? `Tunggu ${countdown} detik...` : 'Verifikasi OTP'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-amber-600/20">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-lg"><Shield className="w-5 h-5 text-amber-400" /></div>
        <div>
          <h2 className="text-lg font-semibold text-white">Login Admin</h2>
          <p className="text-xs text-slate-400">Khusus Admin Cabang & Admin Pusat</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
          {isLocked && <span className="font-semibold"> ({countdown}s)</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="username admin" required disabled={isLocked}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all disabled:opacity-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLocked}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all pr-10 disabled:opacity-50" />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading || isLocked}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
          {loading ? 'Masuk...' : isLocked ? `Tunggu ${countdown} detik...` : 'Masuk sebagai Admin'}
        </button>
      </form>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
function RegisterForm({ onBack }: any) {
  const [form, setForm] = useState({ nama: '', username: '', email: '', password: '', password_confirmation: '', nomor_hp: '', asal_sekolah: '', jurusan: '', id_cabang: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cabangList, setCabangList] = useState<Cabang[]>([]);
  const [loadingCabang, setLoadingCabang] = useState(true);

  useEffect(() => {
    api.getCabang()
      .then((data: { data: Cabang[] }) => {
        const list = data.data ?? [];
        setCabangList(list);
        if (list.length > 0) setForm(f => ({ ...f, id_cabang: list[0].id_cabang }));
      })
      .catch(() => {})
      .finally(() => setLoadingCabang(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError('Password tidak sama'); return; }
    if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('Password harus mengandung minimal 1 huruf besar dan 1 angka');
      return;
    }
    if (form.id_cabang === 0) { setError('Pilih cabang terlebih dahulu'); return; }
    setLoading(true); setError('');
    try {
      await api.register(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-600/20 text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Pendaftaran Berhasil!</h3>
      <p className="text-slate-400 text-sm mb-2">Akun Anda telah terdaftar. Silakan login dan upload dokumen persyaratan PKL Anda.</p>
      <p className="text-slate-500 text-xs mb-6">Dokumen akan diverifikasi oleh admin cabang setelah diupload.</p>
      <button onClick={onBack} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        Kembali ke Login
      </button>
    </div>
  );

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50 max-h-[85vh] overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-600/20 rounded-lg"><UserPlus className="w-5 h-5 text-green-400" /></div>
        <div>
          <h2 className="text-lg font-semibold text-white">Daftar Akun Baru</h2>
          <p className="text-xs text-slate-400">Untuk peserta PKL Indo Bismar</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda', required: true },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'username unik', required: true },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com', required: true },
          { key: 'nomor_hp', label: 'Nomor HP', type: 'tel', placeholder: '08xxxxxxxxxx', required: false },
          { key: 'asal_sekolah', label: 'Asal Sekolah', type: 'text', placeholder: 'SMKN 1 ...', required: false },
          { key: 'jurusan', label: 'Jurusan', type: 'text', placeholder: 'Teknik Informatika', required: false },
        ].map(({ key, label, type, placeholder, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            <input type={type} placeholder={placeholder} value={(form as any)[key]} required={required}
              onChange={e => setForm(f => ({ ...f, [key]: key === 'nomor_hp' ? e.target.value.replace(/\D/g, '') : e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Cabang
          </label>
          {loadingCabang ? (
            <div className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-500 text-sm">
              Memuat daftar cabang...
            </div>
          ) : cabangList.length === 0 ? (
            <div className="w-full px-4 py-2.5 bg-red-900/20 border border-red-600/40 rounded-lg text-red-400 text-sm">
              Tidak ada cabang tersedia. Hubungi admin.
            </div>
          ) : (
            <select
              value={form.id_cabang}
              onChange={e => setForm(f => ({ ...f, id_cabang: Number(e.target.value) }))}
              required
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {cabangList.map(c => (
                <option key={c.id_cabang} value={c.id_cabang} className="bg-slate-800">
                  {c.nama_cabang}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input type="password" placeholder="Min. 8 karakter, 1 huruf besar, 1 angka" value={form.password} required
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi Password</label>
          <input type="password" placeholder="Ulangi password" value={form.password_confirmation} required
            onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>

        <button type="submit" disabled={loading || cabangList.length === 0}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors mt-2">
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
