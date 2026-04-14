import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit2, Clock, Users, ChevronDown, ChevronRight, FileText, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';
import { useToast } from '../../lib/toast';

interface Tugas {
  id: number; judul: string; deskripsi: string | null;
  kursus: string; id_kursus: number; deadline: string;
  submissions: number; total: number; status: string;
}
interface Submission {
  id: number; peserta: string; email: string;
  file_url: string | null; tanggal_kumpul: string;
  nilai: number | null; feedback: string | null;
}
interface Kursus { id: number; judul: string; }

const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-[#161b22] dark:text-white text-sm";

export function Assignments() {
  const toast = useToast();
  const [tugas, setTugas]           = useState<Tugas[]>([]);
  const [kursus, setKursus]         = useState<Kursus[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedKursus, setSelectedKursus] = useState<number | null>(null);

  // Create/Edit modal
  const [showModal, setShowModal]   = useState(false);
  const [editData, setEditData]     = useState<Tugas | null>(null);
  const [form, setForm]             = useState({ id_kursus: '', judul_tugas: '', deskripsi: '', deadline: '' });
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  // Submissions panel
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Record<number, Submission[]>>({});
  const [loadingSub, setLoadingSub] = useState<number | null>(null);

  // Grade modal
  const [grading, setGrading]       = useState<Submission | null>(null);
  const [gradeForm, setGradeForm]   = useState({ nilai: '', feedback: '' });
  const [savingGrade, setSavingGrade] = useState(false);

  const fetchKursus = async () => {
    try { const res = await api.getKursus('per_page=100'); setKursus(res.data.map((k: any) => ({ id: k.id, judul: k.judul }))); } catch { toast.error('Gagal memuat daftar kursus.'); }
  };

  const fetchTugas = async () => {
    setLoading(true);
    try {
      const params = selectedKursus ? `id_kursus=${selectedKursus}` : '';
      const res = await api.getTugas(params);
      setTugas(res.data);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKursus(); }, []);
  useEffect(() => { fetchTugas(); }, [selectedKursus]);

  const openAdd = () => {
    setEditData(null);
    setForm({ id_kursus: selectedKursus ? String(selectedKursus) : '', judul_tugas: '', deskripsi: '', deadline: '' });
    setFormError(''); setShowModal(true);
  };

  const openEdit = (t: Tugas, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData(t);
    const dl = t.deadline ? t.deadline.slice(0, 16) : '';
    setForm({ id_kursus: String(t.id_kursus), judul_tugas: t.judul, deskripsi: t.deskripsi || '', deadline: dl });
    setFormError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.judul_tugas.trim()) { setFormError('Judul wajib diisi'); return; }
    if (!form.deadline) { setFormError('Deadline wajib diisi'); return; }
    if (!editData && !form.id_kursus) { setFormError('Pilih kursus'); return; }
    setSaving(true); setFormError('');
    try {
      if (editData) {
        await api.updateTugas(editData.id, { judul_tugas: form.judul_tugas, deskripsi: form.deskripsi, deadline: form.deadline });
      } else {
        await api.createTugas({ id_kursus: Number(form.id_kursus), judul_tugas: form.judul_tugas, deskripsi: form.deskripsi, deadline: form.deadline });
      }
      setShowModal(false); fetchTugas();
      toast.success(editData ? 'Tugas diperbarui.' : 'Tugas dibuat.');
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm('Hapus tugas ini?')) return;
    try { await api.deleteTugas(id); fetchTugas(); toast.success('Tugas dihapus.'); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleExpand = async (id: number) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (submissions[id]) return;
    setLoadingSub(id);
    try {
      const res = await api.getSubmissions(id);
      setSubmissions(s => ({ ...s, [id]: res.data }));
    } catch { toast.error('Gagal memuat submissions.'); }
    finally { setLoadingSub(null); }
  };

  const openGrade = (sub: Submission, e: React.MouseEvent) => {
    e.stopPropagation();
    setGrading(sub);
    setGradeForm({ nilai: sub.nilai !== null ? String(sub.nilai) : '', feedback: sub.feedback || '' });
  };

  const handleGrade = async () => {
    if (!grading) return;
    setSavingGrade(true);
    try {
      await api.gradeTugas(grading.id, { nilai: Number(gradeForm.nilai), feedback: gradeForm.feedback });
      toast.success('Nilai disimpan.');
      setGrading(null);
      // refresh submissions for this tugas
      const tugasId = Object.entries(submissions).find(([, subs]) => subs.some(s => s.id === grading.id))?.[0];
      if (tugasId) {
        const res = await api.getSubmissions(Number(tugasId));
        setSubmissions(s => ({ ...s, [tugasId]: res.data }));
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingGrade(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tugas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola tugas dan penilaian pengumpulan peserta</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Buat Tugas
        </button>
      </div>

      {/* Filter kursus */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedKursus(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!selectedKursus ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-red-400'}`}>
          Semua
        </button>
        {kursus.map(k => (
          <button key={k.id} onClick={() => setSelectedKursus(k.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedKursus === k.id ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-red-400'}`}>
            {k.judul}
          </button>
        ))}
      </div>

      {/* Daftar Tugas */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : tugas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Belum ada tugas</div>
      ) : (
        <div className="space-y-3">
          {tugas.map(t => (
            <div key={t.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              {/* Tugas header row */}
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
                onClick={() => toggleExpand(t.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/10 flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{t.judul}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.kursus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {t.submissions}/{t.total}
                  </div>
                  <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400'}`}>
                    {t.status === 'Active' ? 'Aktif' : 'Selesai'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={e => openEdit(t, e)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={e => handleDelete(t.id, e)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expanded === t.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Submissions panel */}
              {expanded === t.id && (
                <div className="border-t border-gray-100 dark:border-white/8 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pengumpulan Peserta</p>
                  {loadingSub === t.id ? (
                    <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
                  ) : !submissions[t.id] || submissions[t.id].length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Belum ada pengumpulan</p>
                  ) : (
                    <div className="space-y-2">
                      {submissions[t.id].map(sub => (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/4 rounded-lg">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.peserta}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(sub.tanggal_kumpul).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {sub.file_url && (
                              <a href={sub.file_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-red-600 dark:text-red-400 hover:underline">
                                Lihat File
                              </a>
                            )}
                            {sub.nilai !== null ? (
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{sub.nilai}</span>
                            ) : null}
                            <button onClick={e => openGrade(sub, e)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                              <Star className="w-3.5 h-3.5" />
                              {sub.nilai !== null ? 'Edit Nilai' : 'Beri Nilai'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat/Edit Tugas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">{editData ? 'Edit Tugas' : 'Buat Tugas Baru'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{formError}</p>}
              {!editData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                  <select className={inputCls} value={form.id_kursus} onChange={e => setForm(f => ({ ...f, id_kursus: e.target.value }))}>
                    <option value="">-- Pilih Kursus --</option>
                    {kursus.map(k => <option key={k.id} value={k.id}>{k.judul}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Tugas</label>
                <input className={inputCls} value={form.judul_tugas} onChange={e => setForm(f => ({ ...f, judul_tugas: e.target.value }))} placeholder="cth: Laporan Minggu 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea rows={3} className={inputCls + ' resize-none'} value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Instruksi tugas..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input type="datetime-local" className={inputCls} value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
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

      {/* Modal Beri Nilai */}
      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">Beri Nilai</h3>
              <button onClick={() => setGrading(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Peserta: <span className="font-medium text-gray-900 dark:text-white">{grading.peserta}</span></p>
              {grading.file_url && (
                <a href={grading.file_url} target="_blank" rel="noopener noreferrer"
                  className="block text-sm text-red-600 dark:text-red-400 hover:underline">📎 Lihat File Tugas</a>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai (0–100)</label>
                <input type="number" min={0} max={100} className={inputCls} value={gradeForm.nilai}
                  onChange={e => setGradeForm(f => ({ ...f, nilai: e.target.value }))} placeholder="cth: 85" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                <textarea rows={3} className={inputCls + ' resize-none'} value={gradeForm.feedback}
                  onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Catatan untuk peserta..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={() => setGrading(null)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
              <button onClick={handleGrade} disabled={savingGrade || !gradeForm.nilai} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {savingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
