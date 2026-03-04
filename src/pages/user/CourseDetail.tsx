import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, Download, CheckCircle, Circle, ChevronLeft, Clock, Award } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();

  // Mock data based on ID
  const course = {
    id: id,
    title: 'Dasar Pemrograman Web',
    description: 'Pelajari dasar-dasar pembuatan website menggunakan HTML, CSS, dan JavaScript. Course ini dirancang khusus untuk pemula yang ingin memahami konsep dasar pengembangan web front-end.',
    trainer: 'Budi Raharjo',
    progress: 65,
    status: 'Sedang Berjalan',
    category: 'Teknis',
    materials: [
      { id: 1, title: 'Pengenalan HTML5', type: 'video', duration: '15:30', read: true },
      { id: 2, title: 'Struktur Dasar Dokumen HTML', type: 'pdf', size: '2.4 MB', read: true },
      { id: 3, title: 'Styling dengan CSS3', type: 'video', duration: '24:15', read: true },
      { id: 4, title: 'Layouting Flexbox & Grid', type: 'pdf', size: '4.1 MB', read: false },
      { id: 5, title: 'Dasar JavaScript', type: 'video', duration: '30:00', read: false },
    ],
    tasks: [
      { id: 1, title: 'Tugas 1: Membuat Halaman Profil Sederhana', deadline: '15 Okt 2023', status: 'Sudah Dikumpulkan' },
      { id: 2, title: 'Kuis 1: HTML & CSS Dasar', deadline: '20 Okt 2023', status: 'Belum' },
    ]
  };

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Kembali ke Daftar Course
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              {course.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <Award size={16} /> Trainer: <span className="font-medium text-slate-700">{course.trainer}</span>
            </p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px]">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Progress Keseluruhan</span>
              <span className="font-bold text-slate-900">{course.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">
              {course.status}
            </p>
          </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Materials List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Materi Pembelajaran</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {course.materials.map((material, index) => (
                <li key={material.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className="mt-1">
                    {material.read ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : (
                      <Circle className="text-slate-300" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">Modul {index + 1}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {material.type === 'video' ? (
                        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded gap-1">
                          <PlayCircle size={12} /> Video
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded gap-1">
                          <FileText size={12} /> PDF
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold text-base truncate ${material.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {material.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock size={14} /> 
                      {material.type === 'video' ? material.duration : material.size}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {material.type === 'pdf' ? (
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Unduh Materi">
                        <Download size={20} />
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        Tonton
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tasks & Quizzes Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tugas & Kuis</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {course.tasks.map((task) => (
                <li key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      task.status === 'Sudah Dikumpulkan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {task.deadline}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">
                    {task.title}
                  </h3>
                  
                  {task.status === 'Sudah Dikumpulkan' ? (
                    <button className="w-full py-2 px-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg cursor-not-allowed">
                      Selesai
                    </button>
                  ) : (
                    <Link 
                      to={task.title.includes('Kuis') ? `/tasks/quiz/${task.id}` : `/tasks`}
                      className="block w-full text-center py-2 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Kerjakan Sekarang
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
