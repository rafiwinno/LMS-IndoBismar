import { useEffect, useState } from 'react';
import { Award, TrendingUp, BookOpen, CheckCircle, Clock } from 'lucide-react';
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

export default function Grades() {
  const [nilaiPkl, setNilaiPkl] = useState<NilaiPkl | null>(null);
  const [riwayatKuis, setRiwayatKuis] = useState<RiwayatKuis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/user/nilai')
      .then(res => {
        setNilaiPkl(res.data.nilai_pkl);
        setRiwayatKuis(res.data.riwayat_kuis);
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

  // ✅ Skeleton saat loading
  if (loading) return <GradesSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nilai & Progres</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau perkembangan belajar dan nilai Anda</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Nilai Akhir PKL</p>
            <p className="text-2xl font-bold text-slate-900">{nilaiPkl?.nilai_akhir ?? '-'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Kuis Selesai</p>
            <p className="text-2xl font-bold text-slate-900">{riwayatKuis.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Rata-rata Nilai Kuis</p>
            <p className="text-2xl font-bold text-slate-900">{rataKuis}</p>
          </div>
        </div>
      </div>

      {/* Nilai PKL */}
      {nilaiPkl && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-blue-600" />
              Penilaian PKL
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Nilai Teknis</p>
              <p className="text-3xl font-bold text-blue-600">{nilaiPkl.nilai_teknis}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Nilai Non-Teknis</p>
              <p className="text-3xl font-bold text-purple-600">{nilaiPkl.nilai_non_teknis}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Nilai Akhir</p>
              <p className="text-3xl font-bold text-emerald-600">{nilaiPkl.nilai_akhir}</p>
            </div>
          </div>
          {nilaiPkl.catatan && (
            <div className="px-6 pb-6">
              <p className="text-sm text-slate-500">Catatan: <span className="text-slate-700">{nilaiPkl.catatan}</span></p>
              <p className="text-xs text-slate-400 mt-1">Dinilai oleh: {nilaiPkl.nama_penilai} · {new Date(nilaiPkl.tanggal_penilaian).toLocaleDateString('id-ID')}</p>
            </div>
          )}
        </div>
      )}

      {/* Riwayat Kuis */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Riwayat Kuis
          </h2>
        </div>
        {riwayatKuis.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada kuis yang dikerjakan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Kuis</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayatKuis.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.judul_kuis}</td>
                    <td className="px-6 py-4 text-slate-600">{item.judul_kursus}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${item.skor >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.skor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={14} />
                        {new Date(item.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
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

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Grafik Nilai Kuis
            </h2>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="nilai" name="Nilai" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}