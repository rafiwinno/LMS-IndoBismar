import { Award, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Grades() {
  const grades = [
    { id: 1, course: 'Pengenalan Jaringan Komputer', technical: 85, nonTechnical: 90, final: 87.5, status: 'Lulus' },
    { id: 2, course: 'Dasar Pemrograman Web', technical: 78, nonTechnical: 85, final: 81.5, status: 'Lulus' },
    { id: 3, course: 'Troubleshooting Hardware', technical: 92, nonTechnical: 88, final: 90.0, status: 'Lulus' },
    { id: 4, course: 'Komunikasi Profesional', technical: '-', nonTechnical: '-', final: '-', status: 'Belum Selesai' },
  ];

  const chartData = [
    { name: 'Minggu 1', nilai: 75 },
    { name: 'Minggu 2', nilai: 82 },
    { name: 'Minggu 3', nilai: 88 },
    { name: 'Minggu 4', nilai: 85 },
    { name: 'Minggu 5', nilai: 90 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nilai & Progres</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau perkembangan belajar dan nilai akhir Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Rata-rata Nilai Akhir</p>
            <p className="text-2xl font-bold text-slate-900">86.3</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Course Lulus</p>
            <p className="text-2xl font-bold text-slate-900">3 <span className="text-sm font-normal text-slate-500">/ 6</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tren Progres</p>
            <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
              +5.2% <span className="text-sm font-normal text-slate-500">dari bulan lalu</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Rekapitulasi Nilai per Course
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Course</th>
                  <th className="px-6 py-4 text-center">Nilai Teknis</th>
                  <th className="px-6 py-4 text-center">Nilai Non-Teknis</th>
                  <th className="px-6 py-4 text-center">Nilai Akhir</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{grade.course}</td>
                    <td className="px-6 py-4 text-center font-medium">{grade.technical}</td>
                    <td className="px-6 py-4 text-center font-medium">{grade.nonTechnical}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{grade.final}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        grade.status === 'Lulus' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {grade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Grafik Progres Belajar (Per Minggu)
            </h2>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="nilai" name="Rata-rata Nilai" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
