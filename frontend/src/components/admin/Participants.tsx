import React, { useState, useEffect } from 'react';
import { Search, Eye, Mail, MapPin, BookOpen, TrendingUp, Plus, Edit2, Trash2, X, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

interface Peserta {
  id: number;
  nama: string;
  email: string;
  nomor_hp: string;
  asal_sekolah: string;
  enrolled_courses: number;
  progress: number;
  status: string;
  cabang: string;
  join_date: string;
}

const emptyForm = { nama: '', username: '', email: '', password: '', nomor_hp: '', id_cabang: 1, asal_sekolah: '', jurusan: '', status: 'aktif' };

export function Participants() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [detailPeserta, setDetailPeserta] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPeserta = async (p = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (search) params.append('search', search);
      const res = await api.getPeserta(params.toString());
      setPeserta(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPeserta(1, searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Peserta) => {
    setEditData(p);
    setForm({ ...emptyForm, nama: p.nama, email: p.email, nomor_hp: p.nomor_hp || '', asal_sekolah: p.asal_sekolah || '', status: p.status, password: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editData) {
        const payload: any = { nama: form.nama, email: form.email, nomor_hp: form.nomor_hp, asal_sekolah: form.asal_sekolah, status: form.status };
        if (form.password) payload.password = form.password;
        await api.updatePeserta(editData.id, payload);
      } else {
        await api.createPeserta(form);
      }
      setShowModal(false);
      fetchPeserta(page, searchTerm);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus peserta ini?')) return;
    try {
      await api.deletePeserta(id);
      fetchPeserta(page, searchTerm);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openDetail = async (p: Peserta) => {
    setLoadingDetail(true);
    setDetailPeserta({ ...p, kursus: [] });
    try {
      const res = await api.getPesertaDetail(p.id);
      setDetailPeserta(res);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusToggle = async (p: Peserta) => {
    const newStatus = p.status === 'aktif' ? 'ditolak' : 'aktif';
    try {
      await api.updateStatusPeserta(p.id, newStatus);
      fetchPeserta(page, searchTerm);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Cari nama, email, sekolah..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>Table</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>Grid</button>
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /><span>Tambah</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4">Kontak & Sekolah</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {peserta.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-bold text-sm">{p.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.nama}</p>
                          <p className="text-xs text-gray-500">{p.join_date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-600"><Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{p.email}</div>
                        <div className="flex items-center text-sm text-gray-600"><MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{p.asal_sekolah || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2 w-full max-w-[180px]">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-700">{p.enrolled_courses} Kursus</span>
                          <span className="font-medium text-indigo-600">{p.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleStatusToggle(p)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${p.status === 'aktif' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openDetail(p)} title="Lihat Kursus" className="text-green-600 hover:text-green-800 p-1.5 rounded-md hover:bg-green-50 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total {meta.total} peserta</span>
              <div className="flex space-x-2">
                <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchPeserta(page - 1, searchTerm); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm text-gray-600">{page} / {meta.last_page}</span>
                <button disabled={page >= meta.last_page} onClick={() => { setPage(p => p + 1); fetchPeserta(page + 1, searchTerm); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {peserta.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">{p.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.nama}</h3>
              <p className="text-xs text-gray-500 mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" />{p.asal_sekolah || '-'}</p>
              <div className="space-y-1 mb-4">
                <div className="flex items-center text-sm text-gray-600"><Mail className="w-4 h-4 mr-2 text-gray-400" /><span className="truncate">{p.email}</span></div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center text-gray-600"><BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" />{p.enrolled_courses} Kursus</div>
                  <div className="flex items-center text-gray-600"><TrendingUp className="w-4 h-4 mr-1.5 text-green-500" />{p.progress}%</div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className={`h-full ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(p)} className="flex-1 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Kursus Modal */}
      {detailPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">{detailPeserta.nama}</h3>
                <p className="text-sm text-gray-500">Progress Kursus</p>
              </div>
              <button onClick={() => setDetailPeserta(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : detailPeserta.kursus?.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Belum terdaftar di kursus manapun.</p>
              ) : (
                <ul className="space-y-3">
                  {detailPeserta.kursus?.map((k: any) => (
                    <li key={k.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-800">{k.judul}</span>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${k.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {k.status === 'selesai' && <CheckCircle className="w-3 h-3" />}
                          {k.status === 'selesai' ? 'Selesai' : 'Belum selesai'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 pl-6">
                        <span>Materi: <span className="font-medium text-gray-700">{k.materi_selesai}/{k.materi_total}</span></span>
                        <span>Kuis: <span className="font-medium text-gray-700">{k.kuis_selesai}/{k.kuis_total}</span></span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{detailPeserta.kursus?.filter((k: any) => k.status === 'selesai').length ?? 0} / {detailPeserta.kursus?.length ?? 0} kursus selesai</span>
                <span className="font-semibold text-indigo-600">{detailPeserta.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className={`h-full rounded-full transition-all ${detailPeserta.progress >= 80 ? 'bg-green-500' : detailPeserta.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${detailPeserta.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editData ? 'Edit Peserta' : 'Tambah Peserta'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              {['nama', 'email', 'nomor_hp', 'asal_sekolah'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace('_', ' ')}</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              {!editData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editData ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="ditolak">Ditolak</option>
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
