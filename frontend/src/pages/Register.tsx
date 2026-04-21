import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, School, MapPin, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate  = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [focused, setFocused] = useState<string | null>(null);
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    nama: '', email: '', sekolah: '', cabang: '', password: '', konfirmasi: '',
  });

  // ── Star canvas animation ──────────────────────────────────────────────────
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

    const COUNT = 90;
    const stars = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 3.5 + 1.0,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.3,
      da:    (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.alpha += s.da;
        if (s.alpha <= 0.05 || s.alpha >= 1) s.da *= -1;

        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -5) s.x = canvas.width  + 5;
        if (s.x > canvas.width  + 5) s.x = -5;
        if (s.y < -5) s.y = canvas.height + 5;
        if (s.y > canvas.height + 5) s.y = -5;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 120, 190, ${s.alpha})`;
        ctx.fill();

        if (s.r > 2.5) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 120, 190, ${s.alpha * 0.15})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setError('');
    };

  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return s;
  };
  const strength      = pwStrength(form.password);
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'][strength];
  const pwMatch       = form.konfirmasi.length > 0 && form.password === form.konfirmasi;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi) { setError('Password tidak cocok.'); return; }
    if (form.password.length < 8)          { setError('Password minimal 8 karakter.'); return; }
    setLoading(true);
    // TODO: connect to API
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate('/login');
  };

  const inputCls = (field: string) =>
    `w-full pl-10 pr-3 py-3 rounded-xl border text-sm outline-none transition-all duration-200
    ${focused === field
      ? 'border-blue-500 ring-2 ring-blue-500/15 bg-white'
      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
    }`;

  const fields = [
    { key:'nama',    label:'Nama Lengkap',              Icon: User,   type:'text',  placeholder:'Budi Wibowo' },
    { key:'email',   label:'Email',                     Icon: Mail,   type:'email', placeholder:'email@sekolah.ac.id' },
    { key:'sekolah', label:'Asal Sekolah / Universitas', Icon: School, type:'text',  placeholder:'SMK Negeri 1 Surabaya' },
  ];

  const CABANG = ['Surabaya Pusat','Sidoarjo','Gresik','Malang','Lamongan','Mojokerto'];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes bgFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
        .slide-up  { animation: slideUp .5s cubic-bezier(.34,1.56,.64,1) both }
        .fade-in   { animation: fadeIn .4s ease both }
        .shake-err { animation: shake .4s ease }
        .delay-1   { animation-delay: .08s }
        .delay-2   { animation-delay: .16s }
        .delay-3   { animation-delay: .24s }
      `}</style>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[35%] bg-[#0f172a] flex-col justify-between p-10 relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"
          style={{ animation:'bgFloat 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"
          style={{ animation:'bgFloat 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/[0.03] pointer-events-none" />

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

        <div className="relative space-y-6 fade-in delay-1">
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              Mulai perjalanan<br />PKL kamu.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Daftarkan diri dan akses seluruh materi, tugas, dan laporan PKL di satu platform.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { icon:'🚀', label:'Onboarding mudah & cepat' },
              { icon:'📋', label:'Materi PKL lengkap & terstruktur' },
              { icon:'✅', label:'Pantau progres secara real-time' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center text-base shrink-0">
                  {f.icon}
                </div>
                <span className="text-slate-300 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs fade-in delay-2">
          © 2025 PT Indo Bismar Education. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 relative overflow-y-auto">

        {/* Dot pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize:'28px 28px' }} />

        {/* Star canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="w-full max-w-md relative py-8">

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
          <div className="mb-6 slide-up">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buat akun baru</h1>
            <p className="text-slate-500 text-sm mt-1">Isi data diri kamu untuk mendaftar PKL</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 space-y-4 slide-up delay-1">

            {error && (
              <div className="flex items-center gap-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 shake-err">
                <AlertCircle size={14} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Nama + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.slice(0, 2).map(({ key, label, Icon, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      <Icon size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === key ? 'text-blue-500' : 'text-slate-400'}`} />
                      <input type={type} required placeholder={placeholder}
                        value={(form as any)[key]}
                        onChange={set(key as any)}
                        onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                        className={inputCls(key)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sekolah */}
              {fields.slice(2).map(({ key, label, Icon, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <Icon size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === key ? 'text-blue-500' : 'text-slate-400'}`} />
                    <input type={type} required placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={set(key as any)}
                      onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                      className={inputCls(key)} />
                  </div>
                </div>
              ))}

              {/* Cabang */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Cabang Penempatan PKL</label>
                <div className="relative">
                  <MapPin size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 ${focused === 'cabang' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <select required value={form.cabang} onChange={set('cabang')}
                    onFocus={() => setFocused('cabang')} onBlur={() => setFocused(null)}
                    className={`${inputCls('cabang')} pr-8 appearance-none`}>
                    <option value="">Pilih cabang...</option>
                    {CABANG.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password + Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                      value={form.password} onChange={set('password')}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      className={`${inputCls('password')} pr-10`} />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(s => (
                          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= s ? strengthColor : 'bg-slate-100'}`} />
                        ))}
                      </div>
                      <p className={`text-[10px] font-bold ${['','text-red-500','text-amber-500','text-emerald-500','text-emerald-600'][strength]}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focused === 'konfirmasi' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <input type={showCpw ? 'text' : 'password'} required placeholder="••••••••"
                      value={form.konfirmasi} onChange={set('konfirmasi')}
                      onFocus={() => setFocused('konfirmasi')} onBlur={() => setFocused(null)}
                      className={`${inputCls('konfirmasi')} pr-10`} />
                    <button type="button" onClick={() => setShowCpw(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showCpw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.konfirmasi.length > 0 && (
                    <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold transition-colors ${pwMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                      <CheckCircle2 size={11} className={pwMatch ? 'opacity-100' : 'opacity-0'} />
                      {pwMatch ? 'Password cocok' : 'Password tidak cocok'}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white
                  bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30
                  hover:-translate-y-0.5 active:translate-y-0 active:shadow-md mt-1">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mendaftarkan...</>
                  : <>Daftar Sekarang <ArrowRight size={15} /></>
                }
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-500 mt-5 slide-up delay-2">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}