import React, { useState, useEffect } from 'react';
import {
  Search, Eye, Award, Plus, Trash2, X, ChevronRight,
  CheckCircle, FileText, Edit3, Save, ArrowLeft, PlusCircle,
  ClipboardList, HelpCircle, Clock, Users, ChevronDown, Star, Edit2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';
import { useToast } from '../../lib/toast';
import { TimePickerRoll } from '../../components/admin/TimePickerRoll';

// ── Tugas interfaces ──────────────────────────────────────────────────────────
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
const tugasInputCls = "w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white text-sm";

interface Kuis {
  id: number; judul: string; kursus: string; id_kursus: number;
  waktu_mulai: string; waktu_selesai: string; participants: number; avg_score: number;
}

interface Pilihan { teks_jawaban: string; benar: boolean; }
interface Soal {
  pertanyaan: string;
  tipe: 'pilihan_ganda' | 'essay';
  bobot_nilai: number;
  pilihan: Pilihan[];
}

const emptyPilihan = (): Pilihan[] => [
  { teks_jawaban: '', benar: false },
  { teks_jawaban: '', benar: false },
  { teks_jawaban: '', benar: false },
  { teks_jawaban: '', benar: false },
];

const emptySoal = (): Soal => ({
  pertanyaan: '', tipe: 'pilihan_ganda', bobot_nilai: 10, pilihan: emptyPilihan(),
});

type ModalMode = 'none' | 'create' | 'soal' | 'results';

export function Exams() {
  const toast = useToast();
  const [mainTab, setMainTab] = useState<'tugas' | 'kuis'>('tugas');

  // ── Kuis state ────────────────────────────────────────────────────────────
  const [kuis, setKuis] = useState<Kuis[]>([]);
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [selectedKuis, setSelectedKuis] = useState<Kuis | null>(null);
  const [results, setResults] = useState<any>(null);
  const [kuisDetail, setKuisDetail] = useState<any>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form buat kuis
  const [form, setForm] = useState({ judul_kuis: '', id_kursus: '', waktu_mulai: '', waktu_selesai: '' });

  // Form soal
  const [soalList, setSoalList] = useState<Soal[]>([emptySoal()]);
  const [activeSoal, setActiveSoal] = useState(0);

  // Grading essay
  const [gradingAttempt, setGradingAttempt] = useState<any>(null);
  const [essayScores, setEssayScores] = useState<Record<number, number>>({});
  // Detail PG
  const [pgDetailAttempt, setPgDetailAttempt] = useState<any>(null);

  // ── Tugas state ───────────────────────────────────────────────────────────
  const [tugas, setTugas]               = useState<Tugas[]>([]);
  const [tugasLoading, setTugasLoading] = useState(false);
  const [selectedKursusTugas, setSelectedKursusTugas] = useState<number | null>(null);
  const [showTugasModal, setShowTugasModal] = useState(false);
  const [editTugas, setEditTugas]       = useState<Tugas | null>(null);
  const [tugasForm, setTugasForm]       = useState({ id_kursus: '', judul_tugas: '', deskripsi: '', deadline: '' });
  const [savingTugas, setSavingTugas]   = useState(false);
  const [tugasFormError, setTugasFormError] = useState('');
  const [expandedTugas, setExpandedTugas]   = useState<number | null>(null);
  const [submissions, setSubmissions]       = useState<Record<number, Submission[]>>({});
  const [loadingSub, setLoadingSub]         = useState<number | null>(null);
  const [grading, setGrading]               = useState<Submission | null>(null);
  const [gradeForm, setGradeForm]           = useState({ nilai: '', feedback: '' });
  const [savingGrade, setSavingGrade]       = useState(false);

  const fetchKuis = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.getKuis(search ? `search=${search}` : '');
      setKuis(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchKursus = async () => {
    try { const res = await api.getKursus('per_page=100'); setKursus(res.data); } catch {}
  };

  useEffect(() => { fetchKursus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchKuis(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Tugas functions ───────────────────────────────────────────────────────
  const fetchTugas = async () => {
    setTugasLoading(true);
    try {
      const params = selectedKursusTugas ? `id_kursus=${selectedKursusTugas}` : '';
      const res = await api.getTugas(params);
      setTugas(res.data);
    } catch (e: any) { toast.error(e.message); }
    finally { setTugasLoading(false); }
  };

  useEffect(() => { if (mainTab === 'tugas') fetchTugas(); }, [selectedKursusTugas, mainTab]);

  const openAddTugas = () => {
    setEditTugas(null);
    setTugasForm({ id_kursus: selectedKursusTugas ? String(selectedKursusTugas) : '', judul_tugas: '', deskripsi: '', deadline: '' });
    setTugasFormError(''); setShowTugasModal(true);
  };

  const openEditTugas = (t: Tugas, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTugas(t);
    setTugasForm({ id_kursus: String(t.id_kursus), judul_tugas: t.judul, deskripsi: t.deskripsi || '', deadline: t.deadline ? t.deadline.slice(0, 16) : '' });
    setTugasFormError(''); setShowTugasModal(true);
  };

  const handleSaveTugas = async () => {
    if (!tugasForm.judul_tugas.trim()) { setTugasFormError('Judul wajib diisi'); return; }
    if (!tugasForm.deadline) { setTugasFormError('Deadline wajib diisi'); return; }
    if (!editTugas && !tugasForm.id_kursus) { setTugasFormError('Pilih kursus'); return; }
    setSavingTugas(true); setTugasFormError('');
    try {
      if (editTugas) {
        await api.updateTugas(editTugas.id, { judul_tugas: tugasForm.judul_tugas, deskripsi: tugasForm.deskripsi, deadline: tugasForm.deadline });
      } else {
        await api.createTugas({ id_kursus: Number(tugasForm.id_kursus), judul_tugas: tugasForm.judul_tugas, deskripsi: tugasForm.deskripsi, deadline: tugasForm.deadline });
      }
      setShowTugasModal(false); fetchTugas();
      toast.success(editTugas ? 'Tugas diperbarui.' : 'Tugas dibuat.');
    } catch (e: any) { setTugasFormError(e.message); }
    finally { setSavingTugas(false); }
  };

  const handleDeleteTugas = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm('Hapus tugas ini?')) return;
    try { await api.deleteTugas(id); fetchTugas(); toast.success('Tugas dihapus.'); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleExpandTugas = async (id: number) => {
    if (expandedTugas === id) { setExpandedTugas(null); return; }
    setExpandedTugas(id);
    if (submissions[id]) return;
    setLoadingSub(id);
    try {
      const res = await api.getSubmissions(id);
      setSubmissions(s => ({ ...s, [id]: res.data }));
    } catch {}
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
      const tugasId = Object.entries(submissions).find(([, subs]) => subs.some(s => s.id === grading.id))?.[0];
      if (tugasId) {
        const res = await api.getSubmissions(Number(tugasId));
        setSubmissions(s => ({ ...s, [tugasId]: res.data }));
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingGrade(false); }
  };

  // ── Buat Kuis ──────────────────────────────────────────────────────────────
  const handleCreateKuis = async () => {
    setSaving(true); setError('');
    try {
      const res = await api.createKuis({ ...form, pertanyaan: [] });
      setSelectedKuis({ ...res.data, id: res.data.id });
      setSoalList([emptySoal()]);
      setActiveSoal(0);
      setModalMode('soal');
      fetchKuis(searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  // ── Manajemen Soal ────────────────────────────────────────────────────────
  const addSoal = () => {
    setSoalList(s => [...s, emptySoal()]);
    setActiveSoal(soalList.length);
  };

  const removeSoal = (i: number) => {
    setSoalList(s => s.filter((_, idx) => idx !== i));
    setActiveSoal(Math.max(0, activeSoal - 1));
  };

  const updateSoal = (i: number, field: keyof Soal, val: any) => {
    setSoalList(s => s.map((soal, idx) => idx === i ? { ...soal, [field]: val } : soal));
  };

  const updatePilihan = (soalIdx: number, pIdx: number, field: keyof Pilihan, val: any) => {
    setSoalList(s => s.map((soal, idx) => {
      if (idx !== soalIdx) return soal;
      const newPilihan = soal.pilihan.map((p, pi) => {
        if (field === 'benar') return { ...p, benar: pi === pIdx }; // radio — hanya 1 benar
        return pi === pIdx ? { ...p, [field]: val } : p;
      });
      return { ...soal, pilihan: newPilihan };
    }));
  };

  const handleSaveSoal = async () => {
    if (!selectedKuis) return;
    // Validasi
    for (let i = 0; i < soalList.length; i++) {
      const s = soalList[i];
      if (!s.pertanyaan.trim()) { setError(`Soal ${i + 1}: pertanyaan tidak boleh kosong`); return; }
      if (s.tipe === 'pilihan_ganda') {
        if (s.pilihan.some(p => !p.teks_jawaban.trim())) { setError(`Soal ${i + 1}: semua pilihan harus diisi`); return; }
        if (!s.pilihan.some(p => p.benar)) { setError(`Soal ${i + 1}: tandai satu jawaban benar`); return; }
      }
    }
    setSaving(true); setError('');
    try {
      // Update kuis dengan pertanyaan
      await api.updateKuis(selectedKuis.id, {
        judul_kuis: selectedKuis.judul,
        waktu_mulai: selectedKuis.waktu_mulai,
        waktu_selesai: selectedKuis.waktu_selesai,
        pertanyaan: soalList,
      });
      setModalMode('none');
      fetchKuis(searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  // ── Lihat Detail Soal ─────────────────────────────────────────────────────
  const openSoalEditor = async (k: Kuis) => {
    setSelectedKuis(k);
    setError('');
    try {
      const res = await api.getKuisDetail(k.id);
      setKuisDetail(res);
      // Load soal yang sudah ada
      if (res.pertanyaan && res.pertanyaan.length > 0) {
        setSoalList(res.pertanyaan.map((p: any) => ({
          pertanyaan: p.pertanyaan,
          tipe: p.tipe,
          bobot_nilai: p.bobot_nilai,
          pilihan: p.pilihan?.map((pl: any) => ({ teks_jawaban: pl.teks, benar: pl.benar ?? false })) ?? emptyPilihan(),
        })));
      } else {
        setSoalList([emptySoal()]);
      }
      setActiveSoal(0);
    } catch { setSoalList([emptySoal()]); setActiveSoal(0); }
    setModalMode('soal');
  };

  // ── Hasil ────────────────────────────────────────────────────────────────
  const viewResults = async (k: Kuis) => {
    setSelectedKuis(k);
    try { const res = await api.getKuisResults(k.id); setResults(res); }
    catch {}
    setGradingAttempt(null);
    setModalMode('results');
  };

  const handleGradeEssay = async (attemptId: number) => {
    try {
      await api.gradeEssay(attemptId, essayScores);
      viewResults(selectedKuis!);
      setGradingAttempt(null);
    } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Hapus kuis ini?')) return;
    try { await api.deleteKuis(id); fetchKuis(searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleString('id-ID') : '-';
  const closeModal = () => { setModalMode('none'); setError(''); setGradingAttempt(null); setPgDetailAttempt(null); };

  // ── Soal saat ini ──────────────────────────────────────────────────────────
  const currentSoal = soalList[activeSoal];

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-flex bg-gray-100 dark:bg-white/6 p-1 rounded-xl gap-1">
          {[{ key: 'tugas', label: 'Tugas', icon: ClipboardList }, { key: 'kuis', label: 'Kuis', icon: HelpCircle }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setMainTab(key as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mainTab === key ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TUGAS TAB ─────────────────────────────────────────────────────────── */}
      {mainTab === 'tugas' && (<>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSelectedKursusTugas(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${!selectedKursusTugas ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-indigo-400'}`}>
              Semua
            </button>
            {kursus.map((k: any) => (
              <button key={k.id} onClick={() => setSelectedKursusTugas(k.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedKursusTugas === k.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-indigo-400'}`}>
                {k.judul}
              </button>
            ))}
          </div>
          <button onClick={openAddTugas} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Buat Tugas
          </button>
        </div>

        {tugasLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : tugas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Belum ada tugas</div>
        ) : (
          <div className="space-y-3">
            {tugas.map(t => (
              <div key={t.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
                  onClick={() => toggleExpandTugas(t.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex-shrink-0">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{t.judul}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.kursus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3.5 h-3.5" />{t.submissions}/{t.total}
                    </div>
                    <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400'}`}>
                      {t.status === 'Active' ? 'Aktif' : 'Selesai'}
                    </span>
                    <button onClick={e => openEditTugas(t, e)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={e => handleDeleteTugas(t.id, e)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    {expandedTugas === t.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedTugas === t.id && (
                  <div className="border-t border-gray-100 dark:border-white/8 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pengumpulan Peserta</p>
                    {loadingSub === t.id ? (
                      <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
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
                              {sub.file_url && <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Lihat File</a>}
                              {sub.nilai !== null && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{sub.nilai}</span>}
                              <button onClick={e => openGrade(sub, e)}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                                <Star className="w-3.5 h-3.5" />{sub.nilai !== null ? 'Edit Nilai' : 'Beri Nilai'}
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
        {showTugasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
                <h3 className="text-lg font-semibold dark:text-white">{editTugas ? 'Edit Tugas' : 'Buat Tugas Baru'}</h3>
                <button onClick={() => setShowTugasModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                {tugasFormError && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{tugasFormError}</p>}
                {!editTugas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                    <select className={tugasInputCls} value={tugasForm.id_kursus} onChange={e => setTugasForm(f => ({ ...f, id_kursus: e.target.value }))}>
                      <option value="">-- Pilih Kursus --</option>
                      {kursus.map((k: any) => <option key={k.id} value={k.id}>{k.judul}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Tugas</label>
                  <input className={tugasInputCls} value={tugasForm.judul_tugas} onChange={e => setTugasForm(f => ({ ...f, judul_tugas: e.target.value }))} placeholder="cth: Laporan Minggu 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                  <textarea rows={3} className={tugasInputCls + ' resize-none'} value={tugasForm.deskripsi} onChange={e => setTugasForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Instruksi tugas..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                  <input type="datetime-local" className={tugasInputCls} value={tugasForm.deadline} onChange={e => setTugasForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t dark:border-white/10">
                <button onClick={() => setShowTugasModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                <button onClick={handleSaveTugas} disabled={savingTugas} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {savingTugas ? 'Menyimpan...' : 'Simpan'}
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
                {grading.file_url && <a href={grading.file_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">📎 Lihat File Tugas</a>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai (0–100)</label>
                  <input type="number" min={0} max={100} className={tugasInputCls} value={gradeForm.nilai} onChange={e => setGradeForm(f => ({ ...f, nilai: e.target.value }))} placeholder="cth: 85" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                  <textarea rows={3} className={tugasInputCls + ' resize-none'} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Catatan untuk peserta..." />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t dark:border-white/10">
                <button onClick={() => setGrading(null)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                <button onClick={handleGrade} disabled={savingGrade || !gradeForm.nilai} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {savingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>)}

      {/* ── KUIS TAB ──────────────────────────────────────────────────────────── */}
      {mainTab === 'kuis' && (<>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cari kuis..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setForm({ judul_kuis: '', id_kursus: '', waktu_mulai: '', waktu_selesai: '' }); setError(''); setModalMode('create'); }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /><span>Buat Kuis</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Judul Kuis</th>
                  <th className="px-6 py-4">Kursus</th>
                  <th className="px-6 py-4">Waktu Mulai</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4">Rata-rata</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {kuis.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                        <Award className="w-4 h-4 text-indigo-500" /><span>{k.judul}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.kursus}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{fmt(k.waktu_mulai)}</td>
                    <td className="px-6 py-4 text-sm">
                      {k.waktu_selesai ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${new Date(k.waktu_selesai) < new Date() ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {new Date(k.waktu_selesai) < new Date() ? '⏰' : '🕐'} {fmt(k.waktu_selesai)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.participants}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(k.avg_score || 0) >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {k.avg_score || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => openSoalEditor(k)} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-md hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 text-sm">
                          <Edit3 className="w-4 h-4" /> Soal
                        </button>
                        <button onClick={() => viewResults(k)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 text-sm">
                          <Eye className="w-4 h-4" /> Hasil
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {kuis.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Belum ada kuis</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL BUAT KUIS ───────────────────────────────────────────────── */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">Buat Kuis Baru</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Kuis</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.judul_kuis} onChange={e => setForm(f => ({ ...f, judul_kuis: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.id_kursus} onChange={e => setForm(f => ({ ...f, id_kursus: e.target.value }))}>
                  <option value="">-- Pilih Kursus --</option>
                  {kursus.map(k => <option key={k.id} value={k.id}>{k.judul}</option>)}
                </select>
              </div>
              {/* Waktu Mulai & Selesai */}
              {(['mulai', 'selesai'] as const).map(key => {
                const field = key === 'mulai' ? 'waktu_mulai' : 'waktu_selesai';
                const [datePart, timePart] = (form[field] || 'T').split('T');
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Waktu {key === 'mulai' ? 'Mulai' : 'Selesai'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="date"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-[#161b22] text-gray-800 dark:text-white"
                        value={datePart || ''}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value + 'T' + (f[field].split('T')[1] || '00:00') }))} />
                      <TimePickerRoll
                        value={timePart || ''}
                        onChange={t => setForm(f => ({ ...f, [field]: (f[field].split('T')[0] || '') + 'T' + t }))} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={closeModal} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
              <button onClick={handleCreateKuis} disabled={saving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? 'Menyimpan...' : <><span>Lanjut Buat Soal</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITOR SOAL ─────────────────────────────────────────────── */}
      {modalMode === 'soal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">Editor Soal — {selectedKuis?.judul}</h3>
                <p className="text-xs text-gray-500">{soalList.length} soal · Total bobot: {soalList.reduce((s, q) => s + (q.bobot_nilai || 0), 0)} poin</p>
              </div>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar soal */}
              <div className="w-48 border-r dark:border-white/10 bg-gray-50 dark:bg-[#0d0f14] flex flex-col overflow-y-auto flex-shrink-0">
                <div className="p-3 space-y-1">
                  {soalList.map((s, i) => (
                    <button key={i} onClick={() => setActiveSoal(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${activeSoal === i ? 'bg-indigo-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}>
                      <span className="font-medium">Soal {i + 1}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${activeSoal === i ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {s.tipe === 'pilihan_ganda' ? 'PG' : 'ES'}
                        </span>
                        {soalList.length > 1 && (
                          <button onClick={e => { e.stopPropagation(); removeSoal(i); }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeSoal === i ? 'text-indigo-200 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={addSoal} className="mx-3 mb-3 py-2 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1 transition-colors">
                  <PlusCircle className="w-4 h-4" /> Soal Baru
                </button>
              </div>

              {/* Editor soal aktif */}
              {currentSoal && (
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                  {/* Tipe & bobot */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Soal</label>
                      <div className="flex gap-2">
                        {(['pilihan_ganda', 'essay'] as const).map(t => (
                          <button key={t} onClick={() => updateSoal(activeSoal, 'tipe', t)}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${currentSoal.tipe === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-[#161b22] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-white/10 hover:border-indigo-400'}`}>
                            {t === 'pilihan_ganda' ? '🔘 Pilihan Ganda' : '✏️ Essay'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-28">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bobot Nilai</label>
                      <input type="number" min="1" max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-semibold bg-white dark:bg-[#161b22] text-gray-800 dark:text-white"
                        value={currentSoal.bobot_nilai === 0 ? '' : currentSoal.bobot_nilai}
                        onFocus={e => e.target.select()}
                        onChange={e => updateSoal(activeSoal, 'bobot_nilai', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>

                  {/* Pertanyaan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pertanyaan <span className="text-indigo-600">Soal {activeSoal + 1}</span></label>
                    <textarea rows={3} placeholder="Tulis pertanyaan di sini..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white dark:bg-[#161b22] dark:text-white"
                      value={currentSoal.pertanyaan}
                      onChange={e => updateSoal(activeSoal, 'pertanyaan', e.target.value)} />
                  </div>

                  {/* Pilihan jawaban (pilihan ganda) */}
                  {currentSoal.tipe === 'pilihan_ganda' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilihan Jawaban <span className="text-gray-400 font-normal">(klik lingkaran untuk tandai jawaban benar)</span></label>
                      <div className="space-y-2">
                        {currentSoal.pilihan.map((p, pi) => (
                          <div key={pi} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${p.benar ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}>
                            {/* Radio jawaban benar */}
                            <button onClick={() => updatePilihan(activeSoal, pi, 'benar', true)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${p.benar ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-white/30 hover:border-green-400'}`}>
                              {p.benar && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <span className="w-6 h-6 flex items-center justify-center font-semibold text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {String.fromCharCode(65 + pi)}
                            </span>
                            <input type="text" placeholder={`Pilihan ${String.fromCharCode(65 + pi)}`}
                              className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400"
                              value={p.teks_jawaban}
                              onChange={e => updatePilihan(activeSoal, pi, 'teks_jawaban', e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info essay */}
                  {currentSoal.tipe === 'essay' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium text-sm mb-1">
                        <FileText className="w-4 h-4" /> Soal Essay
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">Peserta akan menjawab dalam bentuk teks bebas. Penilaian dilakukan secara manual oleh admin/trainer.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t dark:border-white/10 bg-gray-50 dark:bg-[#0d0f14]">
              <p className="text-sm text-gray-500 dark:text-gray-400">{soalList.length} soal · {soalList.reduce((s, q) => s + (q.bobot_nilai || 0), 0)} total poin</p>
              <div className="flex gap-3">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 text-sm">Batal</button>
                <button onClick={handleSaveSoal} disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Semua Soal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HASIL ───────────────────────────────────────────────────── */}
      {modalMode === 'results' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">Hasil: {selectedKuis?.judul}</h3>
                {results && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Rata-rata: <span className="font-medium text-indigo-600">{results.avg_score}</span> · {results.total_peserta} peserta selesai
                  </p>
                )}
              </div>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>

            {gradingAttempt ? (
              /* Essay grading panel */
              <div className="flex-1 overflow-y-auto p-6">
                <button onClick={() => setGradingAttempt(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Nilai Essay — {gradingAttempt.peserta}</h4>
                <div className="space-y-4">
                  {gradingAttempt.jawaban_essay?.map((j: any, i: number) => (
                    <div key={i} className="border border-gray-200 dark:border-white/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pertanyaan {i + 1}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 bg-gray-50 dark:bg-white/5 p-2 rounded">{j.pertanyaan}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 italic">"{j.jawaban_text || '(tidak dijawab)'}"</p>
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nilai (0–{j.bobot_nilai}):</label>
                        <input type="number" min="0" max={j.bobot_nilai}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-center bg-white dark:bg-[#161b22] text-gray-800 dark:text-white"
                          value={essayScores[j.id_jawaban] ?? ''}
                          onChange={e => setEssayScores(s => ({ ...s, [j.id_jawaban]: parseInt(e.target.value) || 0 }))} />
                        <span className="text-xs text-gray-400">max {j.bobot_nilai} poin</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleGradeEssay(gradingAttempt.id_attempt)}
                  className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                  Simpan Penilaian
                </button>
              </div>
            ) : pgDetailAttempt ? (
              /* Detail jawaban pilihan ganda */
              <div className="flex-1 overflow-y-auto p-6">
                <button onClick={() => setPgDetailAttempt(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Jawaban Pilihan Ganda — {pgDetailAttempt.peserta}</h4>
                <p className="text-xs text-gray-400 mb-4">
                  {pgDetailAttempt.jawaban_pg?.filter((j: any) => j.benar).length ?? 0} benar dari {pgDetailAttempt.jawaban_pg?.length ?? 0} soal
                </p>
                <div className="space-y-3">
                  {pgDetailAttempt.jawaban_pg?.map((j: any, i: number) => (
                    <div key={i} className={`rounded-lg border p-4 ${j.benar ? 'border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${j.benar ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-300' : 'bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-300'}`}>
                          {j.benar ? '✓' : '✗'}
                        </span>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{i + 1}. {j.pertanyaan}</p>
                      </div>
                      <div className="ml-6 space-y-1 text-sm">
                        <p className={`${j.benar ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          Jawaban: <span className="font-medium">{j.jawaban_dipilih || '(tidak dijawab)'}</span>
                        </p>
                        {!j.benar && (
                          <p className="text-green-700 dark:text-green-400">
                            Jawaban benar: <span className="font-medium">{j.jawaban_benar}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Tabel hasil */
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-[#161b22] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase sticky top-0 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="px-6 py-3">Peserta</th>
                      <th className="px-6 py-3">Skor</th>
                      <th className="px-6 py-3">Waktu Selesai</th>
                      <th className="px-6 py-3">Pilihan Ganda</th>
                      <th className="px-6 py-3">Essay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                    {results?.data?.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/3">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{r.peserta}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${(r.skor || 0) >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : (r.skor || 0) >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                            {r.skor ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{fmt(r.waktu_selesai)}</td>
                        <td className="px-6 py-3">
                          {r.jawaban_pg?.length > 0 && (
                            <button onClick={() => setPgDetailAttempt(r)}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-200 hover:border-emerald-400 px-2 py-1 rounded-md transition-colors">
                              {r.jawaban_pg.filter((j: any) => !j.benar).length > 0
                                ? `${r.jawaban_pg.filter((j: any) => !j.benar).length} salah`
                                : 'Semua benar'
                              }
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {r.has_essay && (
                            <button onClick={() => { setGradingAttempt(r); setEssayScores({}); }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:border-indigo-400 px-2 py-1 rounded-md transition-colors">
                              Nilai Essay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!results?.data || results.data.length === 0) && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada peserta yang mengerjakan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
