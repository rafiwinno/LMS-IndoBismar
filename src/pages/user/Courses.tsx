import { Search, Filter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Courses() {
  const courses = [
    { id: 1, title: 'Pengenalan Jaringan Komputer', trainer: 'Ahmad Santoso', progress: 100, status: 'Selesai', category: 'Teknis' },
    { id: 2, title: 'Dasar Pemrograman Web', trainer: 'Budi Raharjo', progress: 65, status: 'Sedang Berjalan', category: 'Teknis' },
    { id: 3, title: 'Troubleshooting Hardware', trainer: 'Citra Dewi', progress: 20, status: 'Sedang Berjalan', category: 'Teknis' },
    { id: 4, title: 'Komunikasi Profesional', trainer: 'Dian Sastro', progress: 0, status: 'Belum Dimulai', category: 'Non-Teknis' },
    { id: 5, title: 'Manajemen Waktu', trainer: 'Eko Prasetyo', progress: 0, status: 'Belum Dimulai', category: 'Non-Teknis' },
    { id: 6, title: 'Keamanan Siber Dasar', trainer: 'Fahmi Reza', progress: 0, status: 'Belum Dimulai', category: 'Teknis' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Course</h1>
          <p className="text-slate-500 text-sm mt-1">Course yang tersedia untuk cabang Surabaya Pusat</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
              placeholder="Cari course..."
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 bg-white">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden">
            <div className="h-32 bg-slate-100 flex items-center justify-center relative">
              <BookOpen size={48} className="text-slate-300" />
              <div className="absolute top-3 right-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                  course.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                  course.status === 'Sedang Berjalan' ? 'bg-blue-100 text-blue-700' :
                  'bg-white text-slate-700'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {course.category}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </h3>
              
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Trainer: <span className="font-medium text-slate-700">{course.trainer}</span>
              </p>
              
              <div className="mt-auto">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
