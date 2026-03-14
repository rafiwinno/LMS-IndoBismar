// ============================================================
// FILE: src/pages/trainer/Progress.tsx
// LOKASI: frontend/src/pages/trainer/Progress.tsx
// ============================================================
// FIX yang diterapkan:
// 1. Tidak lagi diam-diam fallback ke dummy data tanpa notifikasi
// 2. Jika API gagal, tampilkan pesan jelas bahwa data tidak tersedia
// 3. Ganti any[] dengan interface PesertaProgress yang proper
// ============================================================

import { useEffect, useState } from 'react';
import { Users, TrendingUp, CheckSquare, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import type { PesertaProgress } from '../types/trainer'; // FIX: import interface

export default function TrainerProgress() {
  const [peserta, setPeserta]   = useState<PesertaProgress[]>([]); // FIX: bukan any[]
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState(false); // FIX: track apakah data dari API atau dummy

  useEffect(() => {
    api.get('/trainer/peserta/progress')
      .then((res) => {
        setPeserta(res.data.data ?? res.data);
        setApiError(false);
      })
      .catch(() => {
        // FIX: set error flag, JANGAN diam-diam pakai dummy data
        setApiError(true);
        setPeserta([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const data = peserta; // FIX: tidak ada lagi fallback ke dummyData tanpa notifikasi

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progres Peserta</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau perkembangan belajar seluruh peserta PKL</p>
      </div>

      {/* FIX: tampilkan banner jika API belum tersedia */}
      {apiError && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Data progres peserta belum tersedia. Endpoint <code className="font-mono">/trainer/peserta/progress</code> belum dibuat di backend.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Peserta',  value: data.length,                                            icon: Users,        color: 'bg-blue-50 text-blue-600' },
          { label: 'Progres > 75%', value: data.filter((p) => p.progress >= 75).length,            icon: TrendingUp,   color: 'bg-green-50 text-green-600' },
          { label: 'Progres < 50%', value: data.filter((p) => p.progress < 50).length,             icon: TrendingUp,   color: 'bg-red-50 text-red-600' },
          { label: 'Tugas Selesai', value: data.reduce((a, p) => a + (p.tugas_selesai ?? 0), 0),   icon: CheckSquare,  color: 'bg-amber-50 text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex p-2.5 rounded-lg ${s.color} mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          Memuat data...
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Users size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">
            {apiError ? 'Data tidak dapat dimuat dari server' : 'Belum ada data progres peserta'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Nama Peserta</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Course</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Progres</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Tugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {p.nama?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{p.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden md:table-cell">{p.course}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-16">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            p.progress >= 75 ? 'bg-green-500' :
                            p.progress >= 50 ? 'bg-amber-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-10 text-right">
                        {p.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-slate-600">
                      {p.tugas_selesai ?? 0}/{p.total_tugas ?? 0} selesai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
