import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import { getUser } from '../types';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

interface DashboardStats {
  total_kursus: number;
  total_kuis: number;
  kuis_selesai: number;
  kuis_belum: number;
  nilai_rata_rata: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    API.get('/user/dashboard')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="text-center py-16 text-red-500 font-medium">{error}</div>;

  const statCards = [
    { label: 'Total Kursus',    value: stats?.total_kursus ?? 0,    icon: BookOpen,    color: 'text-red-500',    bg: 'bg-red-500/10' },
    { label: 'Kuis Selesai',    value: stats?.kuis_selesai ?? 0,    icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Kuis Belum',      value: stats?.kuis_belum ?? 0,      icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-500/10' },
    { label: 'Nilai Rata-rata', value: stats?.nilai_rata_rata ?? 0, icon: Award,       color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  ];

  const quickLinks = [
    { label: 'Lihat Kursus',  path: '/courses', icon: BookOpen, color: 'text-red-500',   bg: 'bg-red-500/10' },
    { label: 'Kerjakan Kuis', path: '/tasks',   icon: Clock,    color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Lihat Nilai',   path: '/grades',  icon: Award,    color: 'text-blue-500',  bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.nama ?? 'Peserta'}</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">PT Indo Bismar &middot; Peserta PKL</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/6">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Menu Cepat</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((q) => (
            <Link
              key={q.label}
              to={q.path}
              className="border border-gray-100 dark:border-white/6 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-800/60 transition-colors group flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg ${q.bg} flex items-center justify-center shrink-0`}>
                <q.icon size={16} className={q.color} />
              </div>
              <p className="font-semibold text-sm text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {q.label}
              </p>
              <ArrowRight size={14} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-red-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}