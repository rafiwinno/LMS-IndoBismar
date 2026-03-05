import { BookOpen, CheckCircle, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Total Course', value: '12', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Course Selesai', value: '4', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Tugas Pending', value: '3', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Nilai Rata-rata', value: '85', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const recentCourses = [
    { id: 1, title: 'Pengenalan Jaringan Komputer', progress: 100, status: 'Selesai' },
    { id: 2, title: 'Dasar Pemrograman Web', progress: 65, status: 'Sedang Berjalan' },
    { id: 3, title: 'Troubleshooting Hardware', progress: 20, status: 'Sedang Berjalan' },
    { id: 4, title: 'Komunikasi Profesional', progress: 0, status: 'Belum Dimulai' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section - padding & teks diperbesar */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Selamat datang, Budi Wibowo</h1>
        <p className="text-lg text-slate-600 mb-6">Lanjutkan pembelajaran Anda hari ini. Tetap semangat!</p>
        
        <div className="flex flex-wrap gap-5 mt-4">
          <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Cabang PKL</p>
            <p className="text-base font-semibold text-slate-900">Surabaya Pusat</p>
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Pembimbing</p>
            <p className="text-base font-semibold text-slate-900">Ahmad Santoso, S.Kom</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - ikon & angka diperbesar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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

      {/* Recent Courses - card & teks diperbesar */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Course Anda</h2>
          <Link to="/courses" className="text-base font-medium text-blue-600 hover:text-blue-700">
            Lihat Semua
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="mb-5">
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  course.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                  course.status === 'Sedang Berjalan' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {course.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 h-14">
                {course.title}
              </h3>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Progress</span>
                  <span className="font-bold text-slate-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}