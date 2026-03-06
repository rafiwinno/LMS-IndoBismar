import { BookOpen, CheckCircle, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { name: 'Total Course', value: '12', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Course Selesai', value: '4', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Nilai Rata-rata', value: '85', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Tugas Pending', value: '3', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const recentCourses = [
    { id: 1, title: 'Pengenalan Jaringan Komputer', trainer: 'Ahmad Santoso', progress: 100, status: 'Selesai' },
    { id: 2, title: 'Dasar Pemrograman Web', trainer: 'Budi Raharjo', progress: 65, status: 'Sedang Berjalan' },
    { id: 3, title: 'Troubleshooting Hardware', trainer: 'Citra Dewi', progress: 20, status: 'Sedang Berjalan' },
    { id: 4, title: 'Komunikasi Profesional', trainer: 'Dian Sastro', progress: 0, status: 'Belum Dimulai' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Selamat datang, Budi Wibowo! 👋</h1>
        <p className="text-slate-600 mb-4">Lanjutkan pembelajaran Anda hari ini. Tetap semangat!</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Cabang PKL</p>
            <p className="text-sm font-semibold text-slate-900">Surabaya Pusat</p>
          </div>
          <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Pembimbing</p>
            <p className="text-sm font-semibold text-slate-900">Ahmad Santoso, S.Kom</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Course Anda</h2>
          <Link to="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Lihat Semua
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentCourses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  course.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                  course.status === 'Sedang Berjalan' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {course.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 h-12">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">Trainer: {course.trainer}</p>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Progress</span>
                  <span className="font-bold text-slate-900">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
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
