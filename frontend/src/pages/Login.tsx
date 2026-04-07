import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { saveUser, getDashboardPath } from './types';
import api from '../services/api';

export default function Login() {
  const navigate   = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState<'username'|'password'|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars
    const COUNT = 120;
    const stars = Array.from({ length: COUNT }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 3.5 + 1.0,       // radius 0.3–1.9
      vx:   (Math.random() - 0.5) * 0.3,    // drift x
      vy:   (Math.random() - 0.5) * 0.3,    // drift y
      alpha: Math.random() * 0.5 + 0.3,
      da:   (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1), // twinkle speed
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        // Twinkle
        s.alpha += s.da;
        if (s.alpha <= 0.05 || s.alpha >= 1) s.da *= -1;

        // Drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = canvas.width  + 5;
        if (s.x > canvas.width  + 5) s.x = -5;
        if (s.y < -5) s.y = canvas.height + 5;
        if (s.y > canvas.height + 5) s.y = -5;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 130, 200, ${s.alpha * 0.6})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('lms_token', token);
      saveUser(user);
      window.location.href = getDashboardPath(user.role);
    } catch (err: any) {
      const s = err.response?.status;
      setError(
        s === 401 ? 'Username atau password salah.' :
        s === 403 ? 'Akun tidak aktif. Hubungi administrator.' :
        'Terjadi kesalahan. Coba beberapa saat lagi.'
      );
      setPassword('');
      setTimeout(() => document.getElementById('pw-input')?.focus(), 50);
    } finally { setLoading(false); }
  };

  const inputCls = (field: 'username'|'password') =>
    `w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-all duration-200
    ${focused === field
      ? 'border-blue-500 ring-3 ring-blue-500/15 bg-white'
      : error
        ? 'border-slate-200 bg-slate-50/50'
        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
    }`;

  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes bgFloat   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
        .slide-up   { animation: slideUp .5s cubic-bezier(.34,1.56,.64,1) both }
        .fade-in    { animation: fadeIn .4s ease both }
        .shake-err  { animation: shake .4s ease }
        .delay-1    { animation-delay: .1s }
        .delay-2    { animation-delay: .2s }
        .delay-3    { animation-delay: .3s }
      `}</style>

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#0f172a] flex-col justify-between p-10 relative overflow-hidden shrink-0">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" style={{ animation:'bgFloat 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" style={{ animation:'bgFloat 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/3 pointer-events-none" />

        {/* Logo */}
        <div className="relative fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-white font-black text-sm tracking-widest">IB</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Indo Bismar</p>
              <p className="text-blue-400/60 text-[10px] uppercase tracking-widest font-medium">Education LMS</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6 fade-in delay-1">
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              Selamat datang<br />kembali.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Platform PKL digital untuk mengakses materi, tugas, dan progres pelatihan Anda.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-2.5">
            {[
              { icon:'📚', label:'Materi PKL terstruktur' },
              { icon:'📊', label:'Pantau progres real-time' },
              { icon:'🔐', label:'Akses aman & terenkripsi' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-base shrink-0">
                  {f.icon}
                </div>
                <span className="text-slate-300 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-slate-600 text-xs fade-in delay-2">
          © 2025 PT Indo Bismar Education. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">

        {/* Subtle bg pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize:'28px 28px' }} />

        {/* Star canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="w-full max-w-sm relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 slide-up">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-widest">IB</span>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm">Indo Bismar</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Education LMS</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 slide-up">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke akun</h1>
            <p className="text-slate-500 text-sm mt-1">Gunakan username dan password Anda</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 space-y-4 slide-up delay-1">

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 shake-err">
                <AlertCircle size={14} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused==='username' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    type="text" required autoFocus
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    className={inputCls('username')}
                    placeholder="username123"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused==='password' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    id="pw-input"
                    type={showPw ? 'text' : 'password'} required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className={inputCls('password')}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || !username || !password}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white
                  bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5
                  active:translate-y-0 active:shadow-md mt-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                ) : (
                  <>Masuk <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-slate-500 mt-5 slide-up delay-2">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
              Daftar sekarang
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}