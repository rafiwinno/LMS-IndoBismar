import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users, Building2, Download, TrendingUp,
  RefreshCw, ChevronLeft, ChevronRight,
  Activity, BarChart2, Calendar, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api, { dashboardService } from "../../services/api";
import { DashboardData } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BranchBreakdown { id: number; nama_cabang: string; kota: string; total_logins: number; unique_users: number; }
interface RecapData {
  period: { start: string; end: string; days: number };
  summary: { total_logins: number; unique_users: number };
  daily_chart: { date: string; day: string; active_users: number }[];
  branch_breakdown: BranchBreakdown[];
}
interface Branch { id: number; nama_cabang: string; kota: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toInputDate = (d: Date) => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const MONTHS     = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const monthStart = (y: number, m: number) => toInputDate(new Date(y, m, 1));
const monthEnd   = (y: number, m: number) => toInputDate(new Date(y, m+1, 0));
const PRESETS    = [{ label: '7 Hari', days: 7 }, { label: 'Bulan Ini', days: 0 }];
const COLORS     = ['#2563eb','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777','#0d9488'];

function exportCSV(recap: RecapData) {
  const rows = [`Rekap Login,,`,`Periode,${recap.period.start} - ${recap.period.end},`,
    `Total Login,${recap.summary.total_logins},`,`User Unik,${recap.summary.unique_users},`,
    ``,`Tanggal,Hari,Jumlah Login`];
  recap.daily_chart.forEach(r => rows.push(`${r.date},${r.day},${r.active_users}`));
  rows.push(``,`Cabang,Kota,Total Login,User Unik`);
  recap.branch_breakdown.forEach(b => rows.push(`"${b.nama_cabang}","${b.kota}",${b.total_logins},${b.unique_users}`));
  const blob = new Blob(['\uFEFF'+rows.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `rekap-login_${recap.period.start}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Dark mode watcher ────────────────────────────────────────────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const raf   = useRef(0);

  useEffect(() => {
    const from = start.current;
    const to   = value;
    const t0   = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
      else start.current = to;
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display.toLocaleString('id-ID')}</>;
}

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Skel({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-muted rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full"
        style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)', animation:'shimmer 1.5s infinite' }} />
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const TTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl text-xs border border-slate-700"
      style={{ animation: 'tipFade .12s ease' }}>
      <p className="text-slate-400 text-[10px] mb-1">{label}</p>
      <p className="font-black text-base leading-tight">{payload[0].value.toLocaleString('id-ID')}</p>
      <p className="text-slate-400 text-[10px] mt-0.5">login</p>
    </div>
  );
};

// ─── Refresh indicator ────────────────────────────────────────────────────────
function RefreshBadge({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted font-medium">
      <RefreshCw size={10} className="animate-spin" /> Memperbarui...
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconBg, iconColor, title, sub, right }: {
  icon: any; iconBg: string; iconColor: string; title: string; sub: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${iconBg} border flex items-center justify-center shrink-0`}>
          <Icon size={15} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-bold text-primary leading-tight">{title}</p>
          <p className="text-[11px] text-muted mt-0.5">{sub}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const isDark = useIsDark();

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const todayDate = new Date();
  const firstDay  = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

  const [branches,       setBranches]      = useState<Branch[]>([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const [startDate,      setStartDate]     = useState(() => toInputDate(firstDay));
  const [endDate,        setEndDate]       = useState(() => toInputDate(todayDate));
  const [recap,          setRecap]         = useState<RecapData | null>(null);
  const [recapLoading,   setRecapLoading]  = useState(false);
  const [recapError,     setRecapError]    = useState('');
  const [activePreset,   setActivePreset]  = useState(1);
  const [lastUpdated,    setLastUpdated]   = useState<Date | null>(null);

  const today = new Date();
  const [sm, setSm] = useState(today.getMonth());  const [sy, setSy] = useState(today.getFullYear());
  const [em, setEm] = useState(today.getMonth());  const [ey, setEy] = useState(today.getFullYear());

  // ── Chart colors (react to dark mode) ───────────────────────────────────────
  const gridStroke   = isDark ? '#1e293b' : '#f1f5f9';
  const cursorStroke = isDark ? '#334155' : '#e2e8f0';
  const axisColor    = '#94a3b8';

  const changeStart = (d: number) => {
    let m = sm+d, y = sy;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setSm(m); setSy(y);
    const s = monthStart(y, m); setStartDate(s); setActivePreset(-1); fetchRecap(s, endDate, selectedCabang);
  };
  const changeEnd = (d: number) => {
    let m = em+d, y = ey;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setEm(m); setEy(y);
    const e = monthEnd(y, m); setEndDate(e); setActivePreset(-1); fetchRecap(startDate, e, selectedCabang);
  };

  useEffect(() => {
    dashboardService.getData().then(d => { setData(d); setLastUpdated(new Date()); })
      .catch(() => setError('Gagal memuat data.')).finally(() => setLoading(false));
  }, []);
  useEffect(() => { api.get('/superadmin/branches').then(r => setBranches(r.data)).catch(() => {}); }, []);

  const fetchRecap = useCallback(async (start: string, end: string, cab: string) => {
    setRecapLoading(true); setRecapError('');
    try {
      const p: Record<string,string> = { start, end };
      if (cab) p.cabang_id = cab;
      const res = await api.get('/superadmin/dashboard/login-recap', { params: p });
      setRecap(res.data); setLastUpdated(new Date());
    } catch { setRecapError('Gagal memuat rekap.'); }
    finally { setRecapLoading(false); }
  }, []);

  useEffect(() => { fetchRecap(toInputDate(firstDay), toInputDate(todayDate), ''); }, []);

  const applyPreset = (i: number) => {
    setActivePreset(i);
    const end   = new Date();
    const start = PRESETS[i].days === 0
      ? new Date(end.getFullYear(), end.getMonth(), 1)
      : new Date(Date.now() - (PRESETS[i].days-1)*86400000);
    const s = toInputDate(start), e = toInputDate(end);
    setStartDate(s); setEndDate(e); fetchRecap(s, e, selectedCabang);
  };

  const weekData  = data?.weekly_chart.map(i => ({ name: i.day, active: i.active_users })) ?? [];
  const dailyData = recap?.daily_chart.map(r => ({ name: r.date, active: r.active_users })) ?? [];
  const peakWeek  = weekData.length  ? Math.max(...weekData.map(d => d.active))  : 0;
  const peakDaily = dailyData.length ? Math.max(...dailyData.map(d => d.active)) : 0;

  const avgDaily  = recap && recap.period.days > 0
    ? Math.round(recap.summary.total_logins / recap.period.days) : 0;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <style>{`
        @keyframes shimmer { to { transform: translateX(200%) } }
        @keyframes tipFade { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
        @keyframes countUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">National Dashboard</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-muted">Ringkasan aktivitas PT Indo Bismar Education</p>
            {lastUpdated && (
              <span className="text-[10px] text-muted font-medium">
                · Diperbarui {lastUpdated.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-label bg-card border border-theme rounded-xl px-3.5 py-2 shadow-card shrink-0">
          <Calendar size={13} className="text-muted" />
          <span className="font-medium">
            {todayDate.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: 'Total Pengguna', sub: 'akun terdaftar',
            val: data?.stats.total_active_users ?? 0,
            icon: Users,
            iconBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            trend: '+12% bulan ini', trendUp: true,
          },
          {
            label: 'Cabang Aktif', sub: 'lokasi operasional',
            val: data?.stats.total_branches ?? 0,
            icon: Building2,
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            trend: 'Tersebar di 8 kota', trendUp: true,
          },
        ].map(s => (
          <div key={s.label}
            className="bg-card rounded-xl border border-theme shadow-card p-5 flex items-center justify-between group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-primary mt-1.5 tracking-tight" style={{ animation: 'countUp .4s ease' }}>
                {loading ? <Skel className="w-16 h-8 inline-block" /> : <AnimatedNumber value={s.val} />}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-muted">{s.sub}</p>
                {!loading && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight size={10} />{s.trend}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${s.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <s.icon size={22} className={s.iconColor} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly Chart ── */}
      <div className="bg-card rounded-xl border border-theme shadow-card overflow-hidden">
        <SectionHeader
          icon={Activity}
          iconBg="bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Aktivitas Login Mingguan" sub="7 hari terakhir"
          right={
            !loading && weekData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 text-xs bg-muted border border-theme rounded-lg px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-label text-[11px]">Puncak:</span>
                  <span className="font-bold text-primary">{peakWeek.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : null
          }
        />
        <div className="px-4 py-5">
          {loading ? <Skel className="h-[210px]" /> : (
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top:8, right:5, left:-28, bottom:0 }}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#2563eb" stopOpacity={isDark ? 0.3 : 0.18} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: axisColor, fontSize:11, fontWeight:600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: axisColor, fontSize:10 }} allowDecimals={false} />
                  <Tooltip content={<TTip />} cursor={{ stroke: cursorStroke, strokeWidth:1.5 }} />
                  <Area type="monotone" dataKey="active" stroke="#2563eb" strokeWidth={2.5}
                    fillOpacity={1} fill="url(#wg)"
                    dot={{ r:4, fill:'#2563eb', stroke: isDark ? '#161b22' : '#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#2563eb', stroke: isDark ? '#161b22' : '#fff', strokeWidth:2.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Rekap Section ── */}
      <div className="bg-card rounded-xl border border-theme shadow-card overflow-hidden">

        {/* Controls */}
        <SectionHeader
          icon={TrendingUp}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20"
          iconColor="text-indigo-600 dark:text-indigo-400"
          title="Rekap Login Per Periode" sub="Filter berdasarkan rentang bulan & cabang"
          right={
            recap ? (
              <button onClick={() => exportCSV(recap)}
                className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0">
                <Download size={12} /> Export CSV
              </button>
            ) : null
          }
        />

        {/* Filter bar */}
        <div className="px-6 py-3.5 border-b border-theme bg-muted flex flex-wrap gap-3 items-end">
          {/* Presets */}
          <div className="flex gap-1.5">
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => applyPreset(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  activePreset === i
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : 'bg-card border-theme text-label hover:text-primary hover:bg-muted'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-muted hidden sm:block border-r border-theme" />

          {/* Dari */}
          <div>
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Dari</p>
            <div className="flex items-center border border-theme rounded-lg overflow-hidden bg-card shadow-sm">
              <button onClick={() => changeStart(-1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                <ChevronLeft size={13} className="text-muted" />
              </button>
              <span className="text-xs font-bold text-primary w-20 text-center">{MONTHS[sm]} {sy}</span>
              <button onClick={() => changeStart(1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                <ChevronRight size={13} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Sampai */}
          <div>
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Sampai</p>
            <div className="flex items-center border border-theme rounded-lg overflow-hidden bg-card shadow-sm">
              <button onClick={() => changeEnd(-1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                <ChevronLeft size={13} className="text-muted" />
              </button>
              <span className="text-xs font-bold text-primary w-20 text-center">{MONTHS[em]} {ey}</span>
              <button onClick={() => changeEnd(1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                <ChevronRight size={13} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Cabang */}
          <div>
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Cabang</p>
            <select value={selectedCabang}
              onChange={e => { setSelectedCabang(e.target.value); fetchRecap(startDate, endDate, e.target.value); }}
              className="text-xs font-semibold border border-theme rounded-lg px-3 py-1.5 bg-card text-secondary focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm h-[32px]">
              <option value="">Semua Cabang</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nama_cabang}</option>)}
            </select>
          </div>

          <RefreshBadge loading={recapLoading} />
        </div>

        {recapError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">{recapError}</div>
        )}

        {/* Skeleton while first load */}
        {recapLoading && !recap && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i) => <Skel key={i} className="h-20" />)}</div>
            <Skel className="h-[190px]" />
          </div>
        )}

        {recap && (
          <div className="p-6 space-y-6">

            {/* KPI mini-cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:'Periode',     val: recap.period.start, val2: `– ${recap.period.end}`, sub: `${recap.period.days} hari`,
                  color:'text-primary',                  bg:'bg-muted' },
                { label:'Total Login', val: recap.summary.total_logins.toLocaleString('id-ID'), val2:'', sub:'kali login',
                  color:'text-blue-600 dark:text-blue-400',    bg:'bg-blue-50/60 dark:bg-blue-500/10' },
                { label:'User Unik',   val: recap.summary.unique_users.toLocaleString('id-ID'), val2:'', sub:'akun berbeda',
                  color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50/60 dark:bg-emerald-500/10' },
                { label:'Rata-rata',   val: avgDaily.toLocaleString('id-ID'), val2:'', sub:'login / hari',
                  color:'text-indigo-600 dark:text-indigo-400',  bg:'bg-indigo-50/60 dark:bg-indigo-500/10' },
              ].map(c => (
                <div key={c.label}
                  className={`rounded-xl border border-theme ${c.bg} p-4 hover:brightness-95 transition-all`}>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{c.label}</p>
                  <p className={`text-lg font-black mt-1.5 leading-none ${c.color}`}>{c.val}</p>
                  {c.val2 && <p className="text-[11px] font-semibold text-label mt-0.5">{c.val2}</p>}
                  <p className="text-[10px] text-muted mt-1.5 font-medium">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Daily chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={12} className="text-indigo-500 dark:text-indigo-400" />
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Login Per Hari</p>
                </div>
                {dailyData.length > 0 && (
                  <span className="text-[11px] text-muted">
                    Puncak: <span className="font-black text-primary">{peakDaily.toLocaleString('id-ID')}</span>
                  </span>
                )}
              </div>
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top:8, right:5, left:-28, bottom:0 }}>
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#4f46e5" stopOpacity={isDark ? 0.3 : 0.2} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: axisColor, fontSize:10 }}
                      interval={dailyData.length > 14 ? Math.floor(dailyData.length/7) : 0} dy={6} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: axisColor, fontSize:10 }} allowDecimals={false} />
                    <Tooltip content={<TTip />} cursor={{ stroke: cursorStroke, strokeWidth:1.5 }} />
                    <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={2.5}
                      fillOpacity={1} fill="url(#rg)"
                      dot={dailyData.length <= 14 ? { r:3, fill:'#4f46e5', stroke: isDark ? '#161b22' : '#fff', strokeWidth:2 } : false}
                      activeDot={{ r:5, fill:'#4f46e5', stroke: isDark ? '#161b22' : '#fff', strokeWidth:2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch breakdown */}
            {recap.branch_breakdown.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={12} className="text-muted" />
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Breakdown Per Cabang</p>
                  </div>
                  <span className="text-[10px] text-muted font-medium">{recap.branch_breakdown.length} cabang</span>
                </div>

                <div className="rounded-xl border border-theme overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 bg-muted border-b border-theme">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Cabang</span>
                    <span className="text-[9px] font-bold text-muted uppercase tracking-widest text-right w-12">Login</span>
                    <span className="text-[9px] font-bold text-muted uppercase tracking-widest text-right w-10">Share</span>
                  </div>

                  <div className="divide-theme">
                    {recap.branch_breakdown.map((b, i) => {
                      const pct   = recap.summary.total_logins > 0
                        ? Math.round((b.total_logins / recap.summary.total_logins) * 100) : 0;
                      const maxVal = Math.max(...recap.branch_breakdown.map(x => x.total_logins));
                      const barW  = maxVal > 0 ? (b.total_logins / maxVal) * 100 : 0;
                      const color = COLORS[i % COLORS.length];
                      return (
                        <div key={b.id} className="group px-4 py-3 hover:bg-muted transition-colors border-b border-theme last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                                style={{ background: color }} />
                              <span className="text-xs font-semibold text-secondary truncate">{b.nama_cabang}</span>
                              <span className="text-[10px] text-muted shrink-0">{b.kota}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <span className="text-xs font-black text-primary w-12 text-right tabular-nums">
                                {b.total_logins.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[11px] font-bold text-label w-10 text-right tabular-nums">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width:`${barW}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer total */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2.5 bg-muted border-t border-theme">
                    <span className="text-[10px] font-bold text-label uppercase tracking-wider">Total</span>
                    <span className="text-xs font-black text-primary w-12 text-right tabular-nums">
                      {recap.summary.total_logins.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] font-bold text-muted w-10 text-right">100%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
