import React, { useState, useEffect } from 'react';
import { Search, Mail, BookOpen, Calendar as CalendarIcon, Clock, Plus, Trash2, X, Edit2 } from 'lucide-react';
import { api } from '../lib/api';

interface Trainer {
  id: number; nama: string; email: string; nomor_hp: string;
  status: string; courses: number;
}

interface Jadwal {
  id: number; trainer: string; id_trainer: number; kursus: string; id_kursus: number;
  tanggal: string; jam: string; ruangan: string; tipe: string;
}

const initials = (nama: string) => nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export function Trainers() {
  const [activeTab, setActiveTab] = useState<'list' | 'schedule'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJadwal, setEditJadwal] = useState<Jadwal | null>(null);
  const [form, setForm] = useState({ id_trainer: '', id_kursus: '', tanggal: '', jam_mulai: '', jam_selesai: '', ruangan: '', tipe: 'Online' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTrainers = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.getTrainer(search ? `search=${search}` : '');
      setTrainers(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchJadwal = async (search = '') => {
    try {
      const res = await api.getAllJadwal(search ? `search=${search}` : '');
      setJadwal(res.data);
    } catch {}
  };

  const fetchKursus = async () => {
    try { const res = await api.getKursus('per_page=100'); setKursus(res.data); } catch {}
  };

  useEffect(() => { fetchKursus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      fetchTrainers(searchTerm);
      fetchJadwal(searchTerm);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const openAdd = () => {
    setEditJadwal(null);
    setForm({ id_trainer: '', id_kursus: '', tanggal: '', jam_mulai: '', jam_selesai: '', ruangan: '', tipe: 'Online' });
    setError(''); setShowModal(true);
  };

  const openEdit = (j: Jadwal) => {
    setEditJadwal(j);
    const [jam_mulai, jam_selesai] = j.jam.split(' - ').map(s => s.trim());
    setForm({ id_trainer: String(j.id_trainer), id_kursus: String(j.id_kursus), tanggal: j.tanggal, jam_mulai, jam_selesai, ruangan: j.ruangan || '', tipe: j.tipe });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editJadwal) {
        await api.updateJadwal(editJadwal.id, form);
      } else {
        await api.createJadwal(form);
      }
      setShowModal(false);
      fetchJadwal(searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try { await api.deleteJadwal(id); fetchJadwal(searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const filteredTrainers = trainers.filter(t =>
    t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJadwal = jadwal.filter(j =>
    j.trainer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.kursus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
          {(['list', 'schedule'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab === 'list' ? 'Daftar Trainer' : 'Jadwal'}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder={activeTab === 'list' ? 'Cari trainer...' : 'Cari jadwal...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {activeTab === 'schedule' && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              <Plus className="w-5 h-5" /><span className="hidden sm:inline">Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Trainer List */}
      {activeTab === 'list' && (
        loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrainers.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">{initials(t.nama)}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status === 'aktif' ? 'Aktif' : t.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.nama}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.nomor_hp && <p className="text-xs text-gray-400 mb-3">{t.nomor_hp}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-1 text-indigo-500" />
                    <span>{t.courses} Kursus</span>
                  </div>
                  <button onClick={() => setActiveTab('schedule')}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors" title="Lihat Jadwal">
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTrainers.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">Belum ada trainer</div>
            )}
          </div>
        )
      )}

      {/* Jadwal */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Tanggal & Jam</th>
                  <th className="px-6 py-4">Lokasi / Tipe</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJadwal.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-bold text-xs">{initials(j.trainer || '?')}</span>
                        </div>
                        <span className="font-medium text-gray-900">{j.trainer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{j.kursus}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />{j.tanggal}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />{j.jam}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-900">{j.ruangan || '-'}</span>
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${j.tipe === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {j.tipe}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(j)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(j.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJadwal.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada jadwal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Jadwal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editJadwal ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.id_trainer} onChange={e => setForm(f => ({ ...f, id_trainer: e.target.value }))}>
                  <option value="">-- Pilih Trainer --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.jam_mulai} onChange={e => setForm(f => ({ ...f, jam_mulai: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.jam_selesai} onChange={e => setForm(f => ({ ...f, jam_selesai: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                <input type="text" placeholder="cth: Lab A, Room 302" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.ruangan} onChange={e => setForm(f => ({ ...f, ruangan: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <div className="flex gap-2">
                  {(['Online', 'Offline'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, tipe: t }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.tipe === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                      {t === 'Online' ? '🌐 Online' : '🏫 Offline'}
                    </button>
                  ))}
                </div>
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
