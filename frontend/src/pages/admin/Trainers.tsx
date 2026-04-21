import React, { useState, useEffect } from 'react';
import { Search, Mail, BookOpen, Calendar as CalendarIcon, Clock, Plus, Trash2, X, Edit2, UserPlus, Eye, CheckCircle, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from '../../lib/toast';
import { confirm } from '../../lib/confirm';

interface Trainer {
  id: number; nama: string; username: string; email: string; nomor_hp: string;
  status: string; courses: number;
}

interface Jadwal {
  id: number; trainer: string; id_trainer: number; kursus: string; id_kursus: number;
  tanggal: string; jam: string; ruangan: string; tipe: string;
}

const initials = (nama: string | null | undefined) => (nama ?? '?').split(' ').map(n => n[0] ?? '').join('').substring(0, 2).toUpperCase() || '?';

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

  // Create / Edit Trainer
  const [showCreateTrainer, setShowCreateTrainer] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);
  const [trainerForm, setTrainerForm] = useState({ nama: '', username: '', email: '', password: '', nomor_hp: '' });
  const [trainerError, setTrainerError] = useState('');
  const [savingTrainer, setSavingTrainer] = useState(false);

  // Detail Trainer
  const [detailTrainer, setDetailTrainer] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [assignKursusId, setAssignKursusId] = useState('');
  const [assigningKursus, setAssigningKursus] = useState(false);

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
    const [jam_mulai, jam_selesai] = (j.jam || ' - ').split(' - ').map(s => s.trim());
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
    if (!await confirm('Hapus jadwal ini?')) return;
    try { await api.deleteJadwal(id); fetchJadwal(searchTerm); toast.success('Jadwal berhasil dihapus.'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteTrainer = async (id: number, nama: string) => {
    if (!await confirm(`Hapus trainer "${nama}"? Aksi ini tidak bisa dibatalkan.`)) return;
    try { await api.deleteTrainer(id); fetchTrainers(searchTerm); toast.success(`Trainer "${nama}" berhasil dihapus.`); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleCreateTrainer = async () => {
    setSavingTrainer(true); setTrainerError('');
    try {
      if (editTrainer) {
        const payload: any = { nama: trainerForm.nama, email: trainerForm.email, nomor_hp: trainerForm.nomor_hp };
        if (trainerForm.password) payload.password = trainerForm.password;
        await api.updateTrainer(editTrainer.id, payload);
        toast.success('Data trainer berhasil diperbarui.');
      } else {
        await api.createTrainer(trainerForm);
        toast.success('Trainer berhasil ditambahkan.');
      }
      setShowCreateTrainer(false);
      setEditTrainer(null);
      setTrainerForm({ nama: '', username: '', email: '', password: '', nomor_hp: '' });
      fetchTrainers(searchTerm);
    } catch (e: any) { setTrainerError(e.message); }
    finally { setSavingTrainer(false); }
  };

  const openEditTrainer = (t: Trainer) => {
    setEditTrainer(t);
    setTrainerForm({ nama: t.nama, username: t.username, email: t.email || '', password: '', nomor_hp: t.nomor_hp || '' });
    setTrainerError('');
    setShowCreateTrainer(true);
  };

  const openDetail = async (t: Trainer) => {
    setLoadingDetail(true);
    setDetailTrainer({ ...t, kursus_list: [], jadwal: [] });
    setAssignKursusId('');
    try {
      const res = await api.getTrainerDetail(t.id);
      setDetailTrainer(res);
    } catch (e: any) { toast.error(e.message); setDetailTrainer(null); }
    finally { setLoadingDetail(false); }
  };

  const handleAssignKursus = async () => {
    if (!assignKursusId || !detailTrainer) return;
    setAssigningKursus(true);
    try {
      await api.updateKursus(Number(assignKursusId), { id_trainer: detailTrainer.id });
      toast.success('Trainer berhasil ditambahkan sebagai pengajar kursus.');
      setAssignKursusId('');
      // Refresh detail dan list kursus
      const [res] = await Promise.all([api.getTrainerDetail(detailTrainer.id), fetchKursus()]);
      setDetailTrainer(res);
      fetchTrainers(searchTerm);
    } catch (e: any) { toast.error(e.message); }
    finally { setAssigningKursus(false); }
  };

  const filteredTrainers = trainers.filter(t =>
    (t.nama ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJadwal = jadwal.filter(j =>
    (j.trainer ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.kursus ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-200 dark:bg-white/10 p-1 rounded-lg">
          {(['list', 'schedule'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {tab === 'list' ? 'Daftar Trainer' : 'Jadwal'}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder={activeTab === 'list' ? 'Cari trainer...' : 'Cari jadwal...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {activeTab === 'list' && (
            <button onClick={() => { setEditTrainer(null); setTrainerError(''); setTrainerForm({ nama: '', username: '', email: '', password: '', nomor_hp: '' }); setShowCreateTrainer(true); }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              <UserPlus className="w-5 h-5" /><span className="hidden sm:inline">Tambah Trainer</span>
            </button>
          )}
          {activeTab === 'schedule' && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              <Plus className="w-5 h-5" /><span className="hidden sm:inline">Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Trainer List */}
      {activeTab === 'list' && (
        loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrainers.map(t => (
              <div key={t.id} className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">{initials(t.nama)}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status === 'aktif' ? 'Aktif' : t.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t.nama}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.nomor_hp && <p className="text-xs text-gray-400 mb-3">{t.nomor_hp}</p>}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/8">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 mr-1 text-red-500" />
                    <span>{t.courses} Kursus</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openDetail(t)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Lihat Detail">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditTrainer(t)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Edit Trainer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteTrainer(t.id, t.nama)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Hapus Trainer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Tanggal & Jam</th>
                  <th className="px-6 py-4">Lokasi / Tipe</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {filteredJadwal.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 font-bold text-xs">{initials(j.trainer || '?')}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{j.trainer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{j.kursus}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />{j.tanggal}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />{j.jam}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-900 dark:text-white">{j.ruangan || '-'}</span>
                        <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${j.tipe === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {j.tipe}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(j)} className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors">
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
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">{editJadwal ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trainer</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.id_trainer} onChange={e => setForm(f => ({ ...f, id_trainer: e.target.value }))}>
                  <option value="">-- Pilih Trainer --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.id_kursus} onChange={e => setForm(f => ({ ...f, id_kursus: e.target.value }))}>
                  <option value="">-- Pilih Kursus --</option>
                  {kursus.map(k => <option key={k.id} value={k.id}>{k.judul}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Mulai</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={form.jam_mulai} onChange={e => setForm(f => ({ ...f, jam_mulai: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Selesai</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={form.jam_selesai} onChange={e => setForm(f => ({ ...f, jam_selesai: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ruangan</label>
                <input type="text" placeholder="cth: Lab A, Room 302" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.ruangan} onChange={e => setForm(f => ({ ...f, ruangan: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                <div className="flex gap-2">
                  {(['Online', 'Offline'] as const).map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, tipe: t }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.tipe === t ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>
                      {t === 'Online' ? '🌐 Online' : '🏫 Offline'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Trainer */}
      {showCreateTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">{editTrainer ? 'Edit Trainer' : 'Tambah Trainer Baru'}</h3>
              <button onClick={() => { setShowCreateTrainer(false); setEditTrainer(null); }}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {trainerError && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{trainerError}</p>}
              {[
                { key: 'nama',     label: 'Nama Lengkap', type: 'text',     placeholder: 'Nama trainer',   hide: false },
                { key: 'username', label: 'Username',     type: 'text',     placeholder: 'username unik',  hide: !!editTrainer },
                { key: 'email',    label: 'Email',        type: 'email',    placeholder: 'email@example.com', hide: false },
                { key: 'password', label: editTrainer ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password', type: 'password', placeholder: 'Min. 8 karakter', hide: false },
                { key: 'nomor_hp', label: 'Nomor HP',     type: 'tel',      placeholder: '08xxxxxxxxxx',   hide: false },
              ].filter(f => !f.hide).map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(trainerForm as any)[key]}
                    onChange={e => setTrainerForm(f => ({ ...f, [key]: key === 'nomor_hp' ? e.target.value.replace(/\D/g, '') : e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={() => { setShowCreateTrainer(false); setEditTrainer(null); }} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
              <button onClick={handleCreateTrainer} disabled={savingTrainer} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {savingTrainer ? 'Menyimpan...' : editTrainer ? 'Simpan Perubahan' : 'Tambah Trainer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Trainer */}
      {detailTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">{initials(detailTrainer.nama)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-white leading-tight">{detailTrainer.nama}</h3>
                  <p className="text-xs text-gray-400">@{detailTrainer.username}</p>
                </div>
              </div>
              <button onClick={() => setDetailTrainer(null)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" /></button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {/* Info */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Info Akun</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Email',    value: detailTrainer.email    || '-' },
                      { label: 'Nomor HP', value: detailTrainer.nomor_hp || '-' },
                      { label: 'Status',   value: detailTrainer.status },
                      { label: 'Total Kursus', value: `${detailTrainer.courses ?? 0} kursus` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kursus */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kursus yang Diajar</h4>
                  {detailTrainer.kursus_list?.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Belum ada kursus.</p>
                  ) : (
                    <ul className="space-y-2">
                      {detailTrainer.kursus_list?.map((k: any) => (
                        <li key={k.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-white/8 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 dark:text-white">{k.judul}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.status === 'publish' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                            {k.status === 'publish' ? 'Published' : 'Draft'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Assign ke Kursus */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tambah sebagai Pengajar Kursus</h4>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white text-sm"
                      value={assignKursusId}
                      onChange={e => setAssignKursusId(e.target.value)}
                    >
                      <option value="">-- Pilih Kursus --</option>
                      {kursus
                        .filter(k => !detailTrainer.kursus_list?.some((dk: any) => dk.id === k.id))
                        .map(k => <option key={k.id} value={k.id}>{k.judul}</option>)
                      }
                    </select>
                    <button
                      onClick={handleAssignKursus}
                      disabled={!assignKursusId || assigningKursus}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50 whitespace-nowrap transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {assigningKursus ? 'Menyimpan...' : 'Assign'}
                    </button>
                  </div>
                </div>

                {/* Jadwal */}
                {detailTrainer.jadwal?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Jadwal Terbaru</h4>
                    <ul className="space-y-2">
                      {detailTrainer.jadwal?.slice(0, 5).map((j: any) => (
                        <li key={j.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/8 rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{j.kursus}</p>
                            <p className="text-xs text-gray-400">{j.tanggal} · {j.jam}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${j.tipe === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{j.tipe}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
