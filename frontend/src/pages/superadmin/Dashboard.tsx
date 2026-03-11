import { useEffect, useState, useCallback } from "react";
import { Users, Building2, Download, TrendingUp, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import api, { dashboardService } from "../../services/api";
import { DashboardData } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BranchBreakdown {
  id: number;
  nama_cabang: string;
  kota: string;
  total_logins: number;
  unique_users: number;
}

interface RecapData {
  period: { start: string; end: string; days: number };
  summary: { total_logins: number; unique_users: number };
  daily_chart: { date: string; day: string; active_users: number }[];
  branch_breakdown: BranchBreakdown[];
}

interface Branch { id: number; nama_cabang: string; kota: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

// Custom simple month-year picker state helpers
const monthStart = (year: number, month: number) =>
  toInputDate(new Date(year, month, 1));
const monthEnd = (year: number, month: number) =>
  toInputDate(new Date(year, month + 1, 0));

const PRESETS = [
  { label: '7 Hari',   days: 7 },
  { label: 'Bulan Ini', days: 0 },
];

const BRANCH_COLORS = [
  '#4f46e5','#0ea5e9','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#ec4899','#14b8a6',
];

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(recap: RecapData) {
  const rows: string[] = [];
  rows.push(`Rekap Login,,`);
  rows.push(`Periode,${recap.period.start} - ${recap.period.end},`);
  rows.push(`Total Login,${recap.summary.total_logins},`);
  rows.push(`User Unik,${recap.summary.unique_users},`);
  rows.push(``);
  rows.push(`Detail Per Hari,,`);
  rows.push(`Tanggal,Hari,Jumlah Login`);
  recap.daily_chart.forEach(r => rows.push(`${r.date},${r.day},${r.active_users}`));
  rows.push(``);
  rows.push(`Breakdown Per Cabang,,`);
  rows.push(`Cabang,Kota,Total Login,User Unik`);
  recap.branch_breakdown.forEach(b =>
    rows.push(`"${b.nama_cabang}","${b.kota}",${b.total_logins},${b.unique_users}`)
  );

  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `rekap-login_${recap.period.start.replace(/\//g,'-')}_${recap.period.end.replace(/\//g,'-')}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Recap state
  const [branches,      setBranches]      = useState<Branch[]>([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const [startDate,     setStartDate]     = useState(() => toInputDate(new Date(Date.now() - 6 * 86400000)));
  const [endDate,       setEndDate]       = useState(() => toInputDate(new Date()));
  const [recap,         setRecap]         = useState<RecapData | null>(null);
  const [recapLoading,  setRecapLoading]  = useState(false);
  const [recapError,    setRecapError]    = useState('');
  const [activePreset,  setActivePreset]  = useState<number>(0); // index of PRESETS

  // Simple month-year picker
  const today = new Date();
  const [startMonth, setStartMonth] = useState(today.getMonth() - 0);
  const [startYear,  setStartYear]  = useState(today.getFullYear());
  const [endMonth,   setEndMonth]   = useState(today.getMonth());
  const [endYear,    setEndYear]    = useState(today.getFullYear());

  const changeStartMonth = (delta: number) => {
    let m = startMonth + delta, y = startYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setStartMonth(m); setStartYear(y);
    const s = monthStart(y, m);
    const e = endDate;
    setStartDate(s); setActivePreset(-1);
    fetchRecap(s, e, selectedCabang);
  };

  const changeEndMonth = (delta: number) => {
    let m = endMonth + delta, y = endYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setEndMonth(m); setEndYear(y);
    const s = startDate;
    const e = monthEnd(y, m);
    setEndDate(e); setActivePreset(-1);
    fetchRecap(s, e, selectedCabang);
  };

  // Load main dashboard stats
  useEffect(() => {
    dashboardService.getData()
      .then(setData)
      .catch(() => setError('Gagal memuat data dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  // Load branch list for filter
  useEffect(() => {
    api.get('/superadmin/branches')
      .then(res => setBranches(res.data))
      .catch(() => {});
  }, []);

  // Load recap
  const fetchRecap = useCallback(async (start: string, end: string, cabangId: string) => {
    setRecapLoading(true);
    setRecapError('');
    try {
      const params: Record<string, string> = { start, end };
      if (cabangId) params.cabang_id = cabangId;
      const res = await api.get('/superadmin/dashboard/login-recap', { params });
      setRecap(res.data);
    } catch {
      setRecapError('Gagal memuat data rekap.');
    } finally {
      setRecapLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { fetchRecap(startDate, endDate, selectedCabang); }, []);

  const handleApply = () => {
    setActivePreset(-1);
    fetchRecap(startDate, endDate, selectedCabang);
  };

  const applyPreset = (idx: number) => {
    setActivePreset(idx);
    const preset = PRESETS[idx];
    const end   = new Date();
    let start: Date;
    if (preset.days === 0) {
      // Bulan ini
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else {
      start = new Date(Date.now() - (preset.days - 1) * 86400000);
    }
    const s = toInputDate(start);
    const e = toInputDate(end);
    setStartDate(s);
    setEndDate(e);
    fetchRecap(s, e, selectedCabang);
  };

  const chartData = data?.weekly_chart.map(item => ({
    name: item.day,
    active: item.active_users,
  })) ?? [];

  const recapChartData = recap?.daily_chart.map(r => ({
    name: r.date,
    active: r.active_users,
  })) ?? [];

  const maxBranchLogins = recap
    ? Math.max(...recap.branch_breakdown.map(b => b.total_logins), 1)
    : 1;

  const stats = [
    { name: "Total Active Users", value: data?.stats.total_active_users.toLocaleString('id-ID') ?? '—', icon: Users,     color: "text-blue-600",  bg: "bg-blue-100"  },
    { name: "Total Branches",     value: data ? String(data.stats.total_branches) : '—',                 icon: Building2, color: "text-blue-600",  bg: "bg-blue-100"  },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">National Dashboard</h2>
        <p className="text-slate-500 mt-1">Overview of Bismar Education across all branches.</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? <span className="inline-block w-20 h-8 bg-slate-100 animate-pulse rounded" /> : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">National Active Users (Weekly)</h3>
        {loading ? (
          <div className="h-[350px] bg-slate-50 animate-pulse rounded-lg" />
        ) : (
          <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#60a5fa" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── REKAP SECTION ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Rekap header + controls */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Rekap Login Per Periode
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">Jumlah user yang login dalam rentang tanggal tertentu</p>
            </div>
            {recap && (
              <button
                type="button"
                onClick={() => exportCSV(recap)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activePreset === i
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-4 items-end">

            {/* Dari bulan */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dari</label>
              <div className="flex items-center gap-1 border border-slate-300 rounded-lg px-2 py-2 bg-white">
                <button type="button" onClick={() => changeStartMonth(-1)} className="p-0.5 rounded hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-sm font-semibold text-slate-800 w-24 text-center select-none">
                  {MONTHS[startMonth]} {startYear}
                </span>
                <button type="button" onClick={() => changeStartMonth(1)} className="p-0.5 rounded hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Sampai bulan */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sampai</label>
              <div className="flex items-center gap-1 border border-slate-300 rounded-lg px-2 py-2 bg-white">
                <button type="button" onClick={() => changeEndMonth(-1)} className="p-0.5 rounded hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-sm font-semibold text-slate-800 w-24 text-center select-none">
                  {MONTHS[endMonth]} {endYear}
                </span>
                <button type="button" onClick={() => changeEndMonth(1)} className="p-0.5 rounded hover:bg-slate-100 transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Filter cabang */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cabang</label>
              <select
                value={selectedCabang}
                onChange={e => { setSelectedCabang(e.target.value); fetchRecap(startDate, endDate, e.target.value); }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white h-[38px]"
              >
                <option value="">Semua Cabang</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.nama_cabang}</option>
                ))}
              </select>
            </div>

            {recapLoading && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-500 pb-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memuat...
              </div>
            )}
          </div>
        </div>

        {recapError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{recapError}</div>
        )}

        {recapLoading && !recap && (
          <div className="p-6 space-y-4">
            <div className="h-6 w-48 bg-slate-100 animate-pulse rounded" />
            <div className="h-[250px] bg-slate-50 animate-pulse rounded-lg" />
          </div>
        )}

        {recap && (
          <div className="p-6 space-y-6">

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Periode',      value: `${recap.period.start} – ${recap.period.end}`, sub: `${recap.period.days} hari` },
                { label: 'Total Login',  value: recap.summary.total_logins.toLocaleString('id-ID'),  sub: 'kali login' },
                { label: 'User Unik',    value: recap.summary.unique_users.toLocaleString('id-ID'),  sub: 'user berbeda' },
                { label: 'Rata-rata',    value: recap.period.days > 0 ? Math.round(recap.summary.total_logins / recap.period.days).toLocaleString('id-ID') : '0', sub: 'login/hari' },
              ].map(card => (
                <div key={card.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1 truncate">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Daily chart */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Login Per Hari</h4>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recapChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="recapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false} tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      interval={recapChartData.length > 14 ? Math.floor(recapChartData.length / 7) : 0}
                      dy={8}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 12 }}
                      formatter={(v: number) => [`${v} login`, 'Jumlah Login']}
                    />
                    <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#recapGrad)" dot={recapChartData.length <= 14 ? { r: 3, fill: '#4f46e5' } : false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch breakdown */}
            {recap.branch_breakdown.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Breakdown Per Cabang</h4>

                {/* Bar chart */}
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recap.branch_breakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="nama_cabang" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: 12 }}
                        formatter={(v: number, name: string) => [v, name === 'total_logins' ? 'Total Login' : 'User Unik']}
                      />
                      <Bar dataKey="total_logins" radius={[4, 4, 0, 0]}>
                        {recap.branch_breakdown.map((_, i) => (
                          <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Cabang', 'Kota', 'Total Login', 'User Unik', 'Proporsi'].map((h, i) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-600 ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recap.branch_breakdown.map((b, i) => {
                        const pct = recap.summary.total_logins > 0
                          ? Math.round((b.total_logins / recap.summary.total_logins) * 100)
                          : 0;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BRANCH_COLORS[i % BRANCH_COLORS.length] }} />
                              {b.nama_cabang}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{b.kota}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">{b.total_logins.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{b.unique_users.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${pct}%`, background: BRANCH_COLORS[i % BRANCH_COLORS.length] }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-600">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{recap.summary.total_logins.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{recap.summary.unique_users.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}