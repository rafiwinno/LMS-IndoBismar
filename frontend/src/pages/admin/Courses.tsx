import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';

interface Kursus {
  id: number; judul: string; deskripsi: string;
  status: string; trainer: string; cabang: string; participants: number;
}

const emptyForm = { judul_kursus: '', deskripsi: '', id_trainer: '', id_cabang: 1, status: 'draft' };

export function Courses() {
  const [kursus, setKursus] = useState<Kursus[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchKursus = async (p = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (search) params.append('search', search);
      const res = await api.getKursus(params.toString());
      setKursus(res.data);
      setMeta(res.meta);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.getTrainer();
      setTrainers(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchKursus(1, searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openAdd = () => { setEditData(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (k: Kursus) => {
    setEditData(k);
    setForm({ judul_kursus: k.judul, deskripsi: k.deskripsi || '', id_trainer: '', id_cabang: 1, status: k.status });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editData) {
        await api.updateKursus(editData.id, { judul_kursus: form.judul_kursus, deskripsi: form.deskripsi, status: form.status });
      } else {
        if (!form.id_trainer) { setError('Pilih trainer dulu'); setSaving(false); return; }
        await api.createKursus(form);
      }
      setShowModal(false);
      fetchKursus(page, searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Hapus kursus ini?')) return;
    try { await api.deleteKursus(id); fetchKursus(page, searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const toggleStatus = async (k: Kursus) => {
    const newStatus = k.status === 'publish' ? 'draft' : 'publish';
    try { await api.updateStatusKursus(k.id, newStatus); fetchKursus(page, searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cari kursus dan trainer" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={openAdd} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /><span>Buat Kursus</span>
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
                  <th className="px-6 py-4">Judul Kursus</th>
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kursus.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{k.judul}</div>
                      {k.deskripsi && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{k.deskripsi}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.trainer || '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(k)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${k.status === 'publish' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {k.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.participants}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEdit(k)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(k.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {kursus.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada kursus</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total {meta.total} kursus</span>
              <div className="flex space-x-2">
                <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchKursus(page - 1, searchTerm); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm text-gray-600">{page} / {meta.last_page}</span>
                <button disabled={page >= meta.last_page} onClick={() => { setPage(p => p + 1); fetchKursus(page + 1, searchTerm); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editData ? 'Edit Kursus' : 'Buat Kursus Baru'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kursus</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.judul_kursus} onChange={e => setForm(f => ({ ...f, judul_kursus: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
              </div>
              {!editData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.id_trainer} onChange={e => setForm(f => ({ ...f, id_trainer: e.target.value }))}>
                    <option value="">-- Pilih Trainer --</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                </select>
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
    </div>
  );
}
