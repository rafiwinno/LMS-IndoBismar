import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginPeserta, loginStaff } from '../api/authApi';
import { getDashboardPath } from './types';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'peserta' | 'staff'>('peserta');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'peserta') {
        res = await loginPeserta({ email: form.email, password: form.password });
      } else {
        res = await loginStaff({ username: form.username, password: form.password });
      }
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const roleMap: Record<number, 'user' | 'trainer' | 'admin' | 'superadmin'> = {
        1: 'superadmin', 2: 'admin', 3: 'trainer', 4: 'user',
      };
      navigate(getDashboardPath(roleMap[user.id_role] ?? 'user'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
            IB
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">LMS Indo Bismar</h1>
            <p className="text-xs text-slate-500">Learning Management System</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-1">Selamat datang</h2>
        <p className="text-slate-500 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan</p>

        {/* Tab */}
        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          {(['peserta', 'staff'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'peserta' ? 'Peserta' : 'Staff / Trainer'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {mode === 'peserta' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="username Anda"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
}