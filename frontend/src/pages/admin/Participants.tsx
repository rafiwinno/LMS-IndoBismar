import React, { useState, useEffect } from 'react';
import { Search, Eye, Mail, MapPin, BookOpen, TrendingUp, Plus, Edit2, Trash2, X, CheckCircle, Clock, FileText, CheckCircle2, XCircle, ExternalLink, UserPlus, UserMinus } from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';
import { useToast } from '../../lib/toast';

interface Peserta {
  id: number;
  nama: string;
  email: string;
  nomor_hp: string;
  asal_sekolah: string;
  jurusan: string;
  enrolled_courses: number;
  progress: number;
  status: string;
  cabang: string;
  join_date: string;
  status_dokumen?: string;
  catatan_dokumen?: string;
  surat_siswa_url?: string;
  surat_ortu_url?: string;
}

const emptyForm = { nama: '', username: '', email: '', password: '', nomor_hp: '', id_cabang: 1, asal_sekolah: '', jurusan: '', status: 'aktif' };

export function Participants() {
  const toast = useToast();
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState<'semua' | 'pending'>('semua');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [detailPeserta, setDetailPeserta] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewPeserta, setReviewPeserta] = useState<any>(null);
  const [catatanTolak, setCatatanTolak] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Enrollment state
  const [allKursus, setAllKursus] = useState<any[]>([]);
  const [selectedKursusId, setSelectedKursusId] = useState<number | ''>('');
  const [enrolling, setEnrolling] = useState(false);

  const fetchPeserta = async (p = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (search) params.append('search', search);
      if (activeTab === 'pending') params.append('status', 'pending');
      const res = await api.getPeserta(params.toString());
      setPeserta(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async (aksi: 'setujui' | 'tolak') => {
    if (!reviewPeserta) return;
    setVerifying(true);
    try {
      await api.verifikasiDokumen(reviewPeserta.id, aksi, aksi === 'tolak' ? catatanTolak : undefined);
      setReviewPeserta(null);
      setCatatanTolak('');
      fetchPeserta(page, searchTerm);
      toast.success(aksi === 'setujui' ? 'Dokumen disetujui, akun peserta diaktifkan.' : 'Dokumen ditolak.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPeserta(1, searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm, activeTab]);

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Peserta) => {
    setEditData(p);
    setForm({ ...emptyForm, nama: p.nama, email: p.email, nomor_hp: p.nomor_hp || '', asal_sekolah: p.asal_sekolah || '', jurusan: p.jurusan || '', status: p.status, password: '' });
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
      toast.success(editData ? 'Data peserta berhasil diperbarui.' : 'Peserta berhasil ditambahkan.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Hapus peserta ini?')) return;
    try {
      await api.deletePeserta(id);
      fetchPeserta(page, searchTerm);
      toast.success('Peserta berhasil dihapus.');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openDetail = async (p: Peserta) => {
    setLoadingDetail(true);
    setDetailPeserta({ ...p, kursus: [] });
    setSelectedKursusId('');
    try {
      const [detail, kursusRes] = await Promise.all([
        api.getPesertaDetail(p.id),
        api.getKursus('status=publish&per_page=100'),
      ]);
      setDetailPeserta(detail);
      setAllKursus(kursusRes.data ?? []);
    } catch (e: any) {
      toast.error(e.message);
      setDetailPeserta(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEnroll = async () => {
    if (!detailPeserta || !selectedKursusId) return;
    setEnrolling(true);
    try {
      await api.enrollPeserta(Number(selectedKursusId), detailPeserta.id);
      toast.success('Peserta berhasil didaftarkan ke kursus.');
      setSelectedKursusId('');
      const [detail] = await Promise.all([api.getPesertaDetail(detailPeserta.id)]);
      setDetailPeserta(detail);
      fetchPeserta(page, searchTerm);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (kursusId: number) => {
    if (!detailPeserta) return;
    if (!await confirm('Keluarkan peserta dari kursus ini?')) return;
    try {
      await api.unenrollPeserta(kursusId, detailPeserta.id);
      toast.success('Peserta dikeluarkan dari kursus.');
      const detail = await api.getPesertaDetail(detailPeserta.id);
      setDetailPeserta(detail);
      fetchPeserta(page, searchTerm);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleStatusToggle = async (p: Peserta) => {
    const newStatus = p.status === 'aktif' ? 'ditolak' : 'aktif';
    try {
      await api.updateStatusPeserta(p.id, newStatus);
      fetchPeserta(page, searchTerm);
      toast.success(`Status peserta diubah menjadi ${newStatus}.`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const pendingCount = peserta.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-white/10">
        <button onClick={() => setActiveTab('semua')} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'semua' ? 'bg-white dark:bg-[#161b22] border border-b-white dark:border-b-[#161b22] border-slate-200 dark:border-white/10 text-red-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
          Semua Peserta
        </button>
        <button onClick={() => setActiveTab('pending')} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white border border-b-white border-slate-200 text-amber-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
          <Clock className="w-4 h-4" /> Menunggu Verifikasi
          {pendingCount > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Cari nama, email, sekolah..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-1 bg-gray-200 dark:bg-white/10 p-1 rounded-lg">
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>Table</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>Grid</button>
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /><span>Tambah</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4">Kontak & Sekolah</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {peserta.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 font-bold text-sm">{p.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{p.nama}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.join_date}</p>
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
                          <span className="font-medium text-red-600">{p.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
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
                        {(p.surat_siswa_url || p.surat_ortu_url || p.status_dokumen != null) && (
                          <button onClick={() => { setReviewPeserta(p); setCatatanTolak(''); }} title="Lihat / Review Dokumen"
                            className="text-amber-600 hover:text-amber-800 p-1.5 rounded-md hover:bg-amber-50 transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openDetail(p)} title="Lihat Kursus" className="text-green-600 hover:text-green-800 p-1.5 rounded-md hover:bg-green-50 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(p)} className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total {meta.total} peserta</span>
              <div className="flex space-x-2">
                <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchPeserta(page - 1, searchTerm); }} className="px-3 py-1 border border-gray-300 dark:border-white/10 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">{page} / {meta.last_page}</span>
                <button disabled={page >= meta.last_page} onClick={() => { setPage(p => p + 1); fetchPeserta(page + 1, searchTerm); }} className="px-3 py-1 border border-gray-300 dark:border-white/10 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {peserta.map(p => (
            <div key={p.id} className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">{p.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{p.nama}</h3>
              <p className="text-xs text-gray-500 mb-3 flex items-center"><MapPin className="w-3 h-3 mr-1" />{p.asal_sekolah || '-'}</p>
              <div className="space-y-1 mb-4">
                <div className="flex items-center text-sm text-gray-600"><Mail className="w-4 h-4 mr-2 text-gray-400" /><span className="truncate">{p.email}</span></div>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-white/8">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center text-gray-600"><BookOpen className="w-4 h-4 mr-1.5 text-red-500" />{p.enrolled_courses} Kursus</div>
                  <div className="flex items-center text-gray-600"><TrendingUp className="w-4 h-4 mr-1.5 text-green-500" />{p.progress}%</div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full"><div className={`h-full ${p.progress >= 80 ? 'bg-green-500' : p.progress >= 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(p)} className="flex-1 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Peserta Modal */}
      {detailPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-sm">{detailPeserta.nama?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{detailPeserta.nama}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${detailPeserta.status === 'aktif' ? 'bg-green-100 text-green-700' : detailPeserta.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {detailPeserta.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailPeserta(null)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" /></button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-y-auto flex-1">
                {/* Data Diri */}
                <div className="p-6 border-b border-gray-100 dark:border-white/8">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Data Diri</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Email', value: detailPeserta.email },
                      { label: 'No. HP', value: detailPeserta.nomor_hp || '-' },
                      { label: 'Asal Sekolah', value: detailPeserta.asal_sekolah || '-' },
                      { label: 'Jurusan', value: detailPeserta.jurusan || '-' },
                      { label: 'Cabang', value: detailPeserta.cabang || '-' },
                      { label: 'Tanggal Daftar', value: detailPeserta.join_date ? new Date(detailPeserta.join_date).toLocaleDateString('id-ID') : '-' },
                      ...(detailPeserta.periode_mulai ? [{ label: 'Periode Mulai', value: new Date(detailPeserta.periode_mulai).toLocaleDateString('id-ID') }] : []),
                      ...(detailPeserta.periode_selesai ? [{ label: 'Periode Selesai', value: new Date(detailPeserta.periode_selesai).toLocaleDateString('id-ID') }] : []),
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dokumen Surat */}
                {(detailPeserta.surat_siswa_url || detailPeserta.surat_ortu_url) && (
                  <div className="p-6 border-b border-gray-100 dark:border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dokumen Surat</h4>
                      {detailPeserta.status_dokumen && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          detailPeserta.status_dokumen === 'disetujui' ? 'bg-green-100 text-green-700' :
                          detailPeserta.status_dokumen === 'ditolak'   ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'}`}>
                          {detailPeserta.status_dokumen}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {detailPeserta.surat_siswa_url ? (
                        <a href={detailPeserta.surat_siswa_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          Surat Pernyataan Siswa PKL
                          <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                        </a>
                      ) : <p className="text-sm text-gray-400 italic">Surat siswa belum diupload</p>}
                      {detailPeserta.surat_ortu_url ? (
                        <a href={detailPeserta.surat_ortu_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          Surat Pernyataan Orang Tua
                          <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                        </a>
                      ) : <p className="text-sm text-gray-400 italic">Surat orang tua belum diupload</p>}
                      {detailPeserta.catatan_dokumen && (
                        <p className="text-xs text-red-500 mt-1"><span className="font-semibold">Catatan:</span> {detailPeserta.catatan_dokumen}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Kursus & Enrollment */}
                <div className="p-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kursus Terdaftar</h4>

                  {/* Enroll form */}
                  <div className="flex gap-2 mb-4">
                    <select
                      value={selectedKursusId}
                      onChange={e => setSelectedKursusId(e.target.value === '' ? '' : Number(e.target.value))}
                      className="flex-1 text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#0d0f14] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">-- Pilih kursus untuk didaftarkan --</option>
                      {allKursus
                        .filter(k => !detailPeserta.kursus?.some((dk: any) => dk.id === k.id))
                        .map((k: any) => (
                          <option key={k.id} value={k.id}>{k.judul}</option>
                        ))
                      }
                    </select>
                    <button
                      onClick={handleEnroll}
                      disabled={!selectedKursusId || enrolling}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      {enrolling ? 'Mendaftarkan...' : 'Daftarkan'}
                    </button>
                  </div>

                  {detailPeserta.kursus?.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm">Belum terdaftar di kursus manapun.</p>
                  ) : (
                    <ul className="space-y-3">
                      {detailPeserta.kursus?.map((k: any) => (
                        <li key={k.id} className="p-3 border border-gray-200 dark:border-white/10 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-800 dark:text-white">{k.judul}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${k.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {k.status === 'selesai' && <CheckCircle className="w-3 h-3" />}
                                {k.status === 'selesai' ? 'Selesai' : 'Belum selesai'}
                              </span>
                              <button
                                onClick={() => handleUnenroll(k.id)}
                                title="Keluarkan dari kursus"
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500 pl-6">
                            <span>Materi: <span className="font-medium text-gray-700 dark:text-gray-300">{k.materi_selesai}/{k.materi_total}</span></span>
                            <span>Kuis: <span className="font-medium text-gray-700 dark:text-gray-300">{k.kuis_selesai}/{k.kuis_total}</span></span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t dark:border-white/10 bg-gray-50 dark:bg-[#0d0f14] rounded-b-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{detailPeserta.kursus?.filter((k: any) => k.status === 'selesai').length ?? 0} / {detailPeserta.kursus?.length ?? 0} kursus selesai</span>
                <span className="font-semibold text-red-600">{detailPeserta.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full mt-2">
                <div className={`h-full rounded-full transition-all ${detailPeserta.progress >= 80 ? 'bg-green-500' : detailPeserta.progress >= 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${detailPeserta.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Dokumen Modal */}
      {reviewPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">Review Dokumen</h3>
                <p className="text-sm text-gray-500">{reviewPeserta.nama}</p>
              </div>
              <button onClick={() => setReviewPeserta(null)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status badge */}
              {reviewPeserta.status_dokumen && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                  ${reviewPeserta.status_dokumen === 'disetujui' ? 'bg-green-100 text-green-700' :
                    reviewPeserta.status_dokumen === 'ditolak' ? 'bg-red-100 text-red-700' :
                    reviewPeserta.status_dokumen === 'menunggu' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'}`}>
                  {reviewPeserta.status_dokumen === 'menunggu' && <Clock className="w-4 h-4" />}
                  {reviewPeserta.status_dokumen === 'disetujui' && <CheckCircle2 className="w-4 h-4" />}
                  {reviewPeserta.status_dokumen === 'ditolak' && <XCircle className="w-4 h-4" />}
                  Status Dokumen: {reviewPeserta.status_dokumen}
                </div>
              )}

              {/* Surat links */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Dokumen Terlampir</p>
                {reviewPeserta.surat_siswa_url ? (
                  <a href={reviewPeserta.surat_siswa_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    Surat Pernyataan Siswa PKL
                    <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">Surat siswa belum diupload</p>
                )}
                {reviewPeserta.surat_ortu_url ? (
                  <a href={reviewPeserta.surat_ortu_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    Surat Pernyataan Orang Tua
                    <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">Surat orang tua belum diupload</p>
                )}
              </div>

              {/* Catatan jika ditolak sebelumnya */}
              {reviewPeserta.catatan_dokumen && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-700 mb-1">Catatan sebelumnya:</p>
                  <p className="text-sm text-red-600">{reviewPeserta.catatan_dokumen}</p>
                </div>
              )}

              {/* Catatan penolakan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catatan <span className="text-gray-400 font-normal">(wajib diisi jika menolak)</span>
                </label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none bg-white dark:bg-[#161b22] dark:text-white"
                  placeholder="Tuliskan alasan penolakan atau catatan tambahan..."
                  value={catatanTolak} onChange={e => setCatatanTolak(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={() => setReviewPeserta(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                Tutup
              </button>
              {reviewPeserta.status !== 'aktif' && (
                <>
                  <button onClick={() => handleVerifikasi('tolak')} disabled={verifying || !catatanTolak.trim()}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    <XCircle className="w-4 h-4" />
                    {verifying ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button onClick={() => handleVerifikasi('setujui')} disabled={verifying}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    {verifying ? 'Memproses...' : 'Setujui'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">{editData ? 'Edit Peserta' : 'Tambah Peserta'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              {['nama', 'email', 'nomor_hp', 'asal_sekolah'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field.replace('_', ' ')}</label>
                  <input type={field === 'nomor_hp' ? 'tel' : 'text'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: field === 'nomor_hp' ? e.target.value.replace(/\D/g, '') : e.target.value }))} />
                </div>
              ))}
              {!editData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{editData ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="aktif">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="ditolak">Ditolak</option>
                </select>
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
    </div>
  );
}
