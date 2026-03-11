import React, { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { api } from '../../lib/api';

type TabKey = 'peserta' | 'kursus' | 'kuis' | 'trainer';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'peserta', label: 'Peserta' },
  { key: 'kursus',  label: 'Kursus' },
  { key: 'kuis',    label: 'Exams' },
  { key: 'trainer', label: 'Trainer' },
];

function csvDownload(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const content = [headers, ...rows]
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: 'text/csv' })),
    download: filename,
  });
  a.click();
}

const today = new Date().toISOString().slice(0, 10);

export function Reports() {
  const [chartData, setChartData]   = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [activeTab, setActiveTab]   = useState<TabKey>('peserta');
  const [tableData, setTableData]   = useState<Record<TabKey, any[]>>({ peserta: [], kursus: [], kuis: [], trainer: [] });
  const [loadingTable, setLoadingTable] = useState(false);
  const loadedRef = useRef(new Set<TabKey>());

  // Chart data
  useEffect(() => {
    api.getLaporan()
      .then(res => setChartData(res.data))
      .catch(() => {})
      .finally(() => setLoadingChart(false));
  }, []);

  // Table data — lazy per tab
  useEffect(() => {
    if (loadedRef.current.has(activeTab)) return;
    const fetchers: Record<TabKey, () => Promise<any>> = {
      peserta: () => api.getLaporanPeserta(),
      kursus:  () => api.getLaporanKursus(),
      kuis:    () => api.getLaporanKuis(),
      trainer: () => api.getLaporanTrainer(),
    };
    setLoadingTable(true);
    fetchers[activeTab]()
      .then(res => {
        setTableData(prev => ({ ...prev, [activeTab]: res.data }));
        loadedRef.current.add(activeTab);
      })
      .catch(() => {})
      .finally(() => setLoadingTable(false));
  }, [activeTab]);

  // Growth Trend — cumulative peserta
  let cum = 0;
  const growthData = chartData.map(d => ({ ...d, total: (cum += d.participants) }));

  const handleDownloadCSV = () => {
    const data = tableData[activeTab];
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    csvDownload(`laporan_${activeTab}_${today}.csv`, headers, data.map(r => headers.map(h => r[h])));
  };

  const handleExportExcel = () => {
    if (!chartData.length) return;
    csvDownload(`laporan_dashboard_${today}.csv`,
      ['Bulan', 'Peserta Baru', 'Kursus Selesai'],
      chartData.map(d => [d.name, d.participants, d.completions])
    );
  };

  const handleExportPDF = async () => {
    // Preload all tabs before printing
    const fetchers: Record<TabKey, () => Promise<any>> = {
      peserta: () => api.getLaporanPeserta(),
      kursus:  () => api.getLaporanKursus(),
      kuis:    () => api.getLaporanKuis(),
      trainer: () => api.getLaporanTrainer(),
    };
    const unloaded = (Object.keys(fetchers) as TabKey[]).filter(k => !loadedRef.current.has(k));
    if (unloaded.length > 0) {
      const results = await Promise.all(unloaded.map(k => fetchers[k]().then(res => ({ key: k, data: res.data }))));
      setTableData(prev => {
        const next = { ...prev };
        results.forEach(r => { next[r.key] = r.data; loadedRef.current.add(r.key); });
        return next;
      });
    }
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Branch Analytics & Reports</h2>
        <div className="flex space-x-3">
          <button onClick={handleExportExcel}
            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Export Excel</span>
          </button>
          <button onClick={() => window.print()}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment vs Completion</h3>
          <div className="h-72">
            {loadingChart
              ? <Spinner />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="participants" name="Peserta Baru"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completions"  name="Kursus Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Trend</h3>
          <div className="h-72">
            {loadingChart
              ? <Spinner />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="total" name="Total Peserta" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
          </div>
        </div>
      </div>

      {/* Report Tables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={handleDownloadCSV}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          {loadingTable
            ? <div className="py-16"><Spinner /></div>
            : (
              <>
                {activeTab === 'peserta'  && <PesertaTable  data={tableData.peserta} />}
                {activeTab === 'kursus'   && <KursusTable   data={tableData.kursus} />}
                {activeTab === 'kuis'     && <KuisTable     data={tableData.kuis} />}
                {activeTab === 'trainer'  && <TrainerTable  data={tableData.trainer} />}
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    aktif:   'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    ditolak: 'bg-red-100 text-red-800',
    publish: 'bg-blue-100 text-blue-800',
    draft:   'bg-gray-100 text-gray-600',
    selesai: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="px-6 py-10 text-center text-gray-400 text-sm">Tidak ada data</td></tr>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{children}</td>;
}

function PesertaTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr><Th>Nama</Th><Th>Email</Th><Th>Asal Sekolah</Th><Th>Cabang</Th><Th>Enrolled</Th><Th>Selesai</Th><Th>Progress</Th><Th>Status</Th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={8} /> : data.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <Td className="font-medium text-gray-900">{r.nama}</Td>
            <Td>{r.email}</Td>
            <Td>{r.asal_sekolah}</Td>
            <Td>{r.cabang}</Td>
            <Td>{r.enrolled_courses}</Td>
            <Td>{r.completed}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${r.progress}%` }} />
                </div>
                <span className="text-xs text-gray-500">{r.progress}%</span>
              </div>
            </Td>
            <Td><StatusBadge status={r.status} /></Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KursusTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr><Th>Judul Kursus</Th><Th>Trainer</Th><Th>Status</Th><Th>Total Peserta</Th><Th>Selesai</Th><Th>Completion Rate</Th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={6} /> : data.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <Td className="font-medium text-gray-900">{r.judul}</Td>
            <Td>{r.trainer}</Td>
            <Td><StatusBadge status={r.status} /></Td>
            <Td>{r.total}</Td>
            <Td>{r.completed}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${r.completion_rate}%` }} />
                </div>
                <span className="text-xs text-gray-500">{r.completion_rate}%</span>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KuisTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr><Th>Judul Kuis</Th><Th>Kursus</Th><Th>Total Attempts</Th><Th>Selesai</Th><Th>Rata-rata Skor</Th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={5} /> : data.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <Td className="font-medium text-gray-900">{r.judul}</Td>
            <Td>{r.kursus}</Td>
            <Td>{r.total_attempts}</Td>
            <Td>{r.selesai}</Td>
            <Td>
              {r.avg_skor != null
                ? <span className="font-medium text-indigo-600">{r.avg_skor}</span>
                : <span className="text-gray-400">-</span>
              }
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TrainerTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr><Th>Nama</Th><Th>Email</Th><Th>Total Kursus</Th><Th>Total Peserta</Th><Th>Status</Th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.length === 0 ? <EmptyRow cols={5} /> : data.map((r, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <Td className="font-medium text-gray-900">{r.nama}</Td>
            <Td>{r.email}</Td>
            <Td>{r.total_kursus}</Td>
            <Td>{r.total_peserta}</Td>
            <Td><StatusBadge status={r.status} /></Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
