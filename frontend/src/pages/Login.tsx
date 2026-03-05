import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { saveUser, getDashboardPath, User } from '../pages/types';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ============================================================
    // SIMULASI LOGIN - ganti bagian ini dengan API call ke Laravel
    // Contoh nanti: const res = await fetch('/api/login', {...})
    // ============================================================
    const dummyUsers: User[] = [
      { id: 1, name: 'Budi Wibowo',   email: 'user@lms.com',       role: 'user'       },
      { id: 2, name: 'Ahmad Admin',   email: 'admin@lms.com',      role: 'admin'      },
      { id: 3, name: 'Citra Trainer', email: 'trainer@lms.com',    role: 'trainer'    },
      { id: 4, name: 'Super Admin',   email: 'superadmin@lms.com', role: 'superadmin' },
    ];

    const found = dummyUsers.find(u => u.email === email);

    if (!found || password !== '123456') {
      setError('Email atau password salah.');
      return;
    }

    // Simpan user ke localStorage
    saveUser(found);

    // Redirect ke dashboard sesuai role
    navigate(getDashboardPath(found.role));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            IB
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">LMS PT Indo Bismar</h1>
          <p className="text-slate-400 text-sm">Masuk untuk mengakses materi PKL Anda</p>
        </div>

        <div className="p-8">
          {/* Akun demo untuk testing - hapus saat production */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">Akun Demo (password: 123456)</p>
            <p>👤 user@lms.com</p>
            <p>🛠️ admin@lms.com</p>
            <p>👨‍🏫 trainer@lms.com</p>
            <p>⚙️ superadmin@lms.com</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  placeholder="email@sekolah.ac.id"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">Lupa password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
