import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, Plus, Trash2, X } from 'lucide-react';
import { api } from '../lib/api';

interface Tugas {
  id: number; judul: string; kursus: string; id_kursus: number;
  deadline: string; submissions: number; total: number; status: string;
}

export function Assignments() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedTugas, setSelectedTugas] = useState<Tugas | null>(null);
  const [form, setForm] = useState({ judul_tugas: '', deskripsi: '', id_kursus: '', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTugas = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.getTugas(search ? `search=${search}` : '');
      setTugas(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchKursus = async () => {
    try { const res = await api.getKursus('per_page=100'); setKursus(res.data); } catch {}
  };

  useEffect(() => { fetchKursus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchTugas(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.createTugas(form);
      setShowModal(false);
      fetchTugas(searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tugas ini?')) return;
    try { await api.deleteTugas(id); fetchTugas(searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const viewSubmissions = async (t: Tugas) => {
    setSelectedTugas(t);
    try {
      const res = await api.getSubmissions(t.id);
      setSubmissions(res.data);
    } catch {}
    setShowSubs(true);
  };

  const handleGrade = async (subId: number, nilai: number) => {
    try { await api.gradeTugas(subId, { nilai }); viewSubmissions(selectedTugas!); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cari tugas..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setForm({ judul_tugas: '', deskripsi: '', id_kursus: '', deadline: '' }); setError(''); setShowModal(true); }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /><span>Buat Tugas</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Judul Tugas</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Pengumpulan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tugas.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.judul}</td>
                    <td className="px-6 py-4 text-gray-600">{t.kursus}</td>
                    <td className="px-6 py-4 text-gray-600">{t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{t.submissions}/{t.total}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: t.total > 0 ? `${(t.submissions / t.total) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {t.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{t.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => viewSubmissions(t)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center space-x-1">
                          <Eye className="w-4 h-4" /><span className="text-sm">Lihat</span>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tugas.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Belum ada tugas</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Buat Tugas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Buat Tugas Baru</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.judul_tugas} onChange={e => setForm(f => ({ ...f, judul_tugas: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kursus</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.id_kursus} onChange={e => setForm(f => ({ ...f, id_kursus: e.target.value }))}>
                  <option value="">-- Pilih Kursus --</option>
                  {kursus.map(k => <option key={k.id} value={k.id}>{k.judul}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Submissions */}
      {showSubs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Pengumpulan: {selectedTugas?.judul}</h3>
              <button onClick={() => setShowSubs(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                  <tr><th className="px-6 py-3">Peserta</th><th className="px-6 py-3">Tanggal Kumpul</th><th className="px-6 py-3">File</th><th className="px-6 py-3">Nilai</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.peserta}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{s.tanggal_kumpul ? new Date(s.tanggal_kumpul).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-6 py-3 text-sm">
                        {s.file_url && <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Download</a>}
                      </td>
                      <td className="px-6 py-3">
                        <input type="number" min="0" max="100" defaultValue={s.nilai || ''} placeholder="0-100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={e => { if (e.target.value) handleGrade(s.id, parseInt(e.target.value)); }} />
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada pengumpulan</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
