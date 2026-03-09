import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import { getUser } from '../types';

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
  const user = getUser();

  useEffect(() => {
    API.get('/user/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { name: 'Total Kursus',   value: stats?.total_kursus ?? 0,    icon: BookOpen,    color: 'text-blue-600',    bg: 'bg-blue-100' },
    { name: 'Kuis Selesai',   value: stats?.kuis_selesai ?? 0,    icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Kuis Belum',     value: stats?.kuis_belum ?? 0,      icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-100' },
    { name: 'Nilai Rata-rata',value: stats?.nilai_rata_rata ?? 0, icon: Award,       color: 'text-purple-600',  bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Selamat datang, {user?.name ?? 'Peserta'}
        </h1>
        <p className="text-lg text-slate-600">Lanjutkan pembelajaran Anda hari ini. Tetap semangat!</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center text-slate-500 py-8">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 flex items-center gap-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-base font-medium text-slate-500">{stat.name}</p>
                <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/courses" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center">
            <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Lihat Kursus</p>
          </Link>
          <Link to="/tasks/quiz/1" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center">
            <Clock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Kerjakan Kuis</p>
          </Link>
          <Link to="/grades" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center">
            <Award className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Lihat Nilai</p>
          </Link>
        </div>
      </div>
    </div>
  );
}