import { useEffect, useState } from 'react';
import { Award, TrendingUp, BookOpen, CheckCircle, Clock, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/api';
import { GradesSkeleton } from '../../components/ui/Skeleton';

interface NilaiPkl {
  nilai_teknis: number;
  nilai_non_teknis: number;
  nilai_akhir: number;
  catatan: string;
  nama_penilai: string;
  tanggal_penilaian: string;
}

interface RiwayatKuis {
  judul_kuis: string;
  judul_kursus: string;
  skor: number;
  waktu_mulai: string;
  status: string;
}

interface RiwayatTugas {
  judul_tugas: string;
  judul_kursus: string;
  nilai_maksimal: number;
  nilai: number | null;
  feedback: string | null;
  tanggal_kumpul: string;
}

export default function Grades() {
  const [nilaiPkl, setNilaiPkl] = useState<NilaiPkl | null>(null);
  const [riwayatKuis, setRiwayatKuis] = useState<RiwayatKuis[]>([]);
  const [riwayatTugas, setRiwayatTugas] = useState<RiwayatTugas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/user/nilai')
      .then(res => {
        setNilaiPkl(res.data.nilai_pkl);
        setRiwayatKuis(res.data.riwayat_kuis);
        setRiwayatTugas(res.data.riwayat_tugas ?? []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const rataKuis = riwayatKuis.length > 0
    ? Math.round(riwayatKuis.reduce((a, b) => a + b.skor, 0) / riwayatKuis.length)
    : 0;

  const chartData = riwayatKuis.map(k => ({
    name: k.judul_kuis.length > 15 ? k.judul_kuis.substring(0, 15) + '...' : k.judul_kuis,
    nilai: k.skor,
  }));

  if (loading) return <GradesSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nilai & Progres</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pantau perkembangan belajar dan nilai Anda</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Award, color: 'blue', label: 'Nilai Akhir PKL', value: nilaiPkl?.nilai_akhir ?? '-' },
          { icon: CheckCircle, color: 'emerald', label: 'Kuis Selesai', value: riwayatKuis.length },
          { icon: TrendingUp, color: 'purple', label: 'Rata-rata Nilai Kuis', value: rataKuis },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white dark:bg-[#161b27] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/8 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Nilai PKL */}
      {nilaiPkl && (
        <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award size={20} className="text-red-500" />
              Penilaian PKL
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nilai Teknis</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{nilaiPkl.nilai_teknis}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nilai Non-Teknis</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{nilaiPkl.nilai_non_teknis}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nilai Akhir</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{nilaiPkl.nilai_akhir}</p>
            </div>
          </div>
          {nilaiPkl.catatan && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Catatan: <span className="text-gray-700 dark:text-gray-300">{nilaiPkl.catatan}</span></p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Dinilai oleh: {nilaiPkl.nama_penilai} · {new Date(nilaiPkl.tanggal_penilaian).toLocaleDateString('id-ID')}</p>
            </div>
          )}
        </div>
      )}

      {/* Riwayat Kuis */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-red-500" />
            Riwayat Kuis
          </h2>
        </div>
        {riwayatKuis.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada kuis yang dikerjakan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/8">
                <tr>
                  <th className="px-6 py-4">Nama Kuis</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                {riwayatKuis.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.judul_kuis}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.judul_kursus}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${item.skor >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {item.skor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Clock size={14} />
                        {new Date(item.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Riwayat Tugas */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-red-500" />
            Riwayat Tugas
          </h2>
        </div>
        {riwayatTugas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada tugas yang dikumpulkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-white/8">
                <tr>
                  <th className="px-6 py-4">Nama Tugas</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4">Tanggal Kumpul</th>
                  <th className="px-6 py-4">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/8">
                {riwayatTugas.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.judul_tugas}</td>
                    <td className="px-6 py-4">{item.judul_kursus}</td>
                    <td className="px-6 py-4 text-center">
                      {item.nilai !== null ? (
                        <span className={`text-lg font-bold ${item.nilai >= item.nilai_maksimal * 0.7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {item.nilai}
                          <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> / {item.nilai_maksimal}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          Menunggu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Clock size={14} />
                        {new Date(item.tanggal_kumpul).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-gray-500 dark:text-gray-400">
                      {item.feedback ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-red-500" />
              Grafik Nilai Kuis
            </h2>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#161b27',
                    color: '#fff',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  }}
                />
                <Bar dataKey="nilai" name="Nilai" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}