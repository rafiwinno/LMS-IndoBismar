import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function Tasks() {
  const tasks = [
    { id: 1, course: 'Dasar Pemrograman Web', title: 'Tugas 1: Membuat Halaman Profil Sederhana', type: 'Tugas', deadline: '15 Okt 2023, 23:59', status: 'Sudah Dikumpulkan', score: 85 },
    { id: 2, course: 'Dasar Pemrograman Web', title: 'Kuis 1: HTML & CSS Dasar', type: 'Kuis', deadline: '20 Okt 2023, 23:59', status: 'Belum', score: null },
    { id: 3, course: 'Troubleshooting Hardware', title: 'Tugas Praktik: Merakit PC Virtual', type: 'Tugas', deadline: '25 Okt 2023, 23:59', status: 'Belum', score: null },
    { id: 4, course: 'Pengenalan Jaringan Komputer', title: 'Ujian Akhir Modul Jaringan', type: 'Kuis', deadline: '10 Okt 2023, 23:59', status: 'Sudah Dikumpulkan', score: 92 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tugas & Kuis</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola dan kerjakan tugas dari trainer Anda</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Semua
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Belum Selesai
          </button>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Selesai
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Tugas/Kuis</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Tenggat Waktu</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${task.type === 'Kuis' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{task.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar size={14} />
                      <span>{task.deadline}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {task.status === 'Sudah Dikumpulkan' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle size={14} /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        <AlertCircle size={14} /> Belum
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {task.status === 'Sudah Dikumpulkan' ? (
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-bold text-slate-900">
                          Nilai: <span className={task.score && task.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{task.score || '-'}</span>
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Lihat
                        </button>
                      </div>
                    ) : (
                      <Link 
                        to={task.type === 'Kuis' ? `/tasks/quiz/${task.id}` : '#'}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Kerjakan
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
