import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, FileText, ClipboardList, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { api } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

const POLL_INTERVAL = 30_000; // 30 detik

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const lastActivityTimeRef = useRef<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor   = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const tickColor   = isDark ? '#6b7280' : '#6b7280';
  const tooltipStyle = isDark
    ? { borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', backgroundColor: '#161b22', color: '#f3f4f6' }
    : { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#111' };

  const fetchDashboard = async (isInitial = false) => {
    try {
      const res = await api.dashboard();
      setData(res);

      const activities: any[] = res?.recent_activity ?? [];
      const latestTime = activities[0]?.time ?? null;

      if (!isInitial && lastActivityTimeRef.current && latestTime && latestTime !== lastActivityTimeRef.current) {
        // Hitung berapa aktivitas baru sejak fetch terakhir
        const newCount = activities.filter(
          (a: any) => a.time && a.time > lastActivityTimeRef.current!
        ).length;
        if (newCount > 0) setNewActivityCount(n => n + newCount);
      }

      lastActivityTimeRef.current = latestTime;
    } catch (e) {
      if (isInitial) console.error(e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      if (!document.hidden) fetchDashboard(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats || {};
  const progressData = data?.progress_data || [];
  const courseData = data?.course_data || [];
  const submissionData = data?.submission_data || [];
  const activities = data?.recent_activity || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Peserta"    value={loading ? null : String(stats.total_peserta ?? 0)}  icon={Users}         color="bg-blue-500" />
        <StatCard title="Total Kursus"     value={loading ? null : String(stats.total_kursus ?? 0)}   icon={BookOpen}      color="bg-red-500" />
        <StatCard title="Total Materi"     value={loading ? null : String(stats.total_materi ?? 0)}   icon={FileText}      color="bg-emerald-500" />
        <StatCard title="Total Tugas"      value={loading ? null : String(stats.total_tugas ?? 0)}    icon={ClipboardList} color="bg-amber-500" />
        <StatCard title="Rata-rata Nilai"  value={loading ? null : String(stats.average_score ?? 0)}  icon={TrendingUp}    color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Kuis Diselesaikan (per Minggu)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Completion Kursus</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                    <Tooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6'}} contentStyle={tooltipStyle} />
                    <Bar dataKey="completion" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Materi Dibuka (per Hari)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={submissionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Aktivitas Terbaru</h3>
              {newActivityCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
                  +{newActivityCount} baru
                </span>
              )}
            </div>
            <button
              onClick={() => { fetchDashboard(false); setNewActivityCount(0); }}
              title="Refresh aktivitas"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-6">
              {activities.map((activity: any, i: number) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                      {activity.user?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium text-red-600 dark:text-red-400">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time ? new Date(activity.time).toLocaleString('id-ID') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | null; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl shadow-sm border border-gray-100 dark:border-white/8 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {value === null
          ? <div className="h-7 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-1" />
          : <h4 className="text-xl font-bold text-gray-900 dark:text-white">{value}</h4>
        }
      </div>
    </div>
  );
}
