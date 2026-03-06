import React, { useState } from 'react';
import { api } from '../lib/api';
import { User, Shield, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-lg"><User className="w-5 h-5 text-blue-400" /></div>
        <div>
          <h2 className="text-lg font-semibold text-white">Masuk sebagai Peserta</h2>
          <p className="text-xs text-slate-400">Gunakan email dan password Anda</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@sekolah.com" required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10" />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
          {loading ? 'Masuk...' : 'Masuk'}
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

// ─── Admin Login (username + password) ───────────────────────────────────────
function AdminLoginForm({ onLogin, onBack }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.loginAdmin(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Username atau password salah');
    } finally { setLoading(false); }
  };

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

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="username admin" required
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all pr-10" />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors">
          {loading ? 'Masuk...' : 'Masuk sebagai Admin'}
        </button>
      </form>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
function RegisterForm({ onBack }: any) {
  const [form, setForm] = useState({ nama: '', username: '', email: '', password: '', password_confirmation: '', nomor_hp: '', asal_sekolah: '', jurusan: '', id_cabang: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError('Password tidak sama'); return; }
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
        <UserPlus className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Pendaftaran Berhasil!</h3>
      <p className="text-slate-400 text-sm mb-6">Akun Anda menunggu verifikasi admin. Hubungi admin cabang untuk aktivasi.</p>
      <button onClick={onBack} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        Kembali ke Login
      </button>
    </div>
  );

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50 max-h-[80vh] overflow-y-auto">
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
          { key: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda' },
          { key: 'username', label: 'Username', type: 'text', placeholder: 'username unik' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
          { key: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: '08xxxxxxxxxx' },
          { key: 'asal_sekolah', label: 'Asal Sekolah', type: 'text', placeholder: 'SMKN 1 ...' },
          { key: 'jurusan', label: 'Jurusan', type: 'text', placeholder: 'Teknik Informatika' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            <input type={type} placeholder={placeholder} value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <input type="password" placeholder="Min. 8 karakter" value={form.password} required
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi Password</label>
          <input type="password" placeholder="Ulangi password" value={form.password_confirmation} required
            onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors mt-2">
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
