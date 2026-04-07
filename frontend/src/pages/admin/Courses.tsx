import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, ChevronLeft,
  FileText, File, Youtube, ExternalLink,
  Link, BookOpen, ClipboardList, Clock, Download, Star, Users, CheckCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';

interface Kursus {
  id: number; judul: string; deskripsi: string;
  status: string; trainer: string; cabang: string; participants: number;
}

interface Materi {
  id_materi: number; judul_materi: string; tipe_materi: string;
  file_materi: string; ukuran: string; kursus: string; id_kursus: number; dibuat_pada: string;
}

const emptyForm = { judul_kursus: '', deskripsi: '', id_trainer: '', id_cabang: 1, status: 'draft' };
const emptyMateriForm = { judul_materi: '', tipe_materi: 'pdf', file: null as File | null, youtube_url: '', drive_url: '' };

const getYoutubeId = (url: string) => {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const tipeConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  video:      { label: '▶ YouTube',  bg: 'bg-red-50',    text: 'text-red-600',    icon: <Youtube className="w-8 h-8 text-red-500" /> },
  pdf:        { label: 'PDF',        bg: 'bg-orange-50', text: 'text-orange-600', icon: <FileText className="w-8 h-8 text-red-500" /> },
  ppt:        { label: 'PPT',        bg: 'bg-orange-50', text: 'text-orange-600', icon: <File className="w-8 h-8 text-orange-500" /> },
  link_drive: { label: '🔗 Drive',   bg: 'bg-blue-50',   text: 'text-blue-600',   icon: <Link className="w-8 h-8 text-blue-500" /> },
  dokumen:    { label: 'Dokumen',    bg: 'bg-gray-50',   text: 'text-gray-600',   icon: <File className="w-8 h-8 text-gray-400" /> },
};

export function Courses() {
  // ── Course list state ──────────────────────────────────────────────────
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

  // ── Course detail / materials state ───────────────────────────────────
  const skipSearchEffect = useRef(false);
  const [selectedCourse, setSelectedCourse] = useState<Kursus | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [materiLoading, setMateriLoading] = useState(false);
  const [materiSearch, setMateriSearch] = useState('');
  const [showMateriModal, setShowMateriModal] = useState(false);
  const [materiForm, setMateriForm] = useState(emptyMateriForm);
  const [materiSaving, setMateriSaving] = useState(false);
  const [materiError, setMateriError] = useState('');
  const [viewer, setViewer] = useState<Materi | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // ── Tugas state ────────────────────────────────────────────────────────
  const [activeDetailTab, setActiveDetailTab] = useState<'materi' | 'tugas'>('materi');
  const [tugas, setTugas] = useState<any[]>([]);
  const [tugasLoading, setTugasLoading] = useState(false);
  const [tugasError, setTugasError] = useState('');
  const [showTugasModal, setShowTugasModal] = useState(false);
  const [tugasForm, setTugasForm] = useState({ judul_tugas: '', deskripsi: '', deadline: '', nilai_maksimal: 100, file_soal: null as File | null });
  const [tugasSaving, setTugasSaving] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeForm, setGradeForm] = useState<Record<number, { nilai: string; feedback: string }>>({});
  const [gradeSaving, setGradeSaving] = useState<number | null>(null);

  useEffect(() => {
    if (viewer?.tipe_materi === 'pdf' && viewer?.file_materi) {
      fetch(viewer.file_materi)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        })
        .catch(() => setPdfBlobUrl(null));
    } else {
      if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); }
      setPdfBlobUrl(null);
    }
  }, [viewer]);

  // ── Fetch courses ──────────────────────────────────────────────────────
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
    try { const res = await api.getTrainer(); setTrainers(res.data); } catch {}
  };

  useEffect(() => { fetchTrainers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchKursus(1, searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Fetch materials for selected course ────────────────────────────────
  const fetchMateri = useCallback(async (search = '') => {
    if (!selectedCourse) return;
    setMateriLoading(true);
    try {
      const params = new URLSearchParams({ id_kursus: String(selectedCourse.id) });
      if (search) params.append('search', search);
      const res = await api.getMateri(params.toString());
      setMateri(res.data);
    } catch (e: any) { setMateriError(e.message); }
    finally { setMateriLoading(false); }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      skipSearchEffect.current = true;
      setMateriSearch('');
      setViewer(null);
      fetchMateri('');
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedCourse || skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }
    const t = setTimeout(() => fetchMateri(materiSearch), 400);
    return () => clearTimeout(t);
  }, [materiSearch]);

  // ── Course CRUD ────────────────────────────────────────────────────────
  const openAdd = () => { setEditData(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (k: Kursus, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm('Hapus kursus ini?')) return;
    try { await api.deleteKursus(id); fetchKursus(page, searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const toggleStatus = async (k: Kursus, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = k.status === 'publish' ? 'draft' : 'publish';
    try { await api.updateStatusKursus(k.id, newStatus); fetchKursus(page, searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  // ── Material CRUD ──────────────────────────────────────────────────────
  const openAddMateri = () => {
    setMateriForm(emptyMateriForm);
    setMateriError('');
    setShowMateriModal(true);
  };

  const handleSaveMateri = async () => {
    if (!materiForm.judul_materi.trim()) { setMateriError('Judul materi tidak boleh kosong'); return; }
    if (!selectedCourse) return;

    const fd = new FormData();
    fd.append('judul_materi', materiForm.judul_materi);
    fd.append('tipe_materi', materiForm.tipe_materi);
    fd.append('id_kursus', String(selectedCourse.id));

    if (materiForm.tipe_materi === 'video') {
      if (!materiForm.youtube_url) { setMateriError('Masukkan link YouTube'); return; }
      if (!getYoutubeId(materiForm.youtube_url)) { setMateriError('Link YouTube tidak valid'); return; }
      fd.append('youtube_url', materiForm.youtube_url);
    } else if (materiForm.tipe_materi === 'link_drive') {
      if (!materiForm.drive_url) { setMateriError('Masukkan link Google Drive'); return; }
      fd.append('drive_url', materiForm.drive_url);
    } else {
      if (!materiForm.file) { setMateriError('Pilih file terlebih dahulu'); return; }
      if (materiForm.file.size > MAX_FILE_SIZE) { setMateriError(`Ukuran file maksimal 5 MB. File kamu: ${(materiForm.file.size / 1024 / 1024).toFixed(1)} MB`); return; }
      fd.append('file_materi', materiForm.file);
    }

    setMateriSaving(true); setMateriError('');
    try {
      await api.createMateri(fd);
      setShowMateriModal(false);
      fetchMateri(materiSearch);
    } catch (e: any) { setMateriError(e.message); }
    finally { setMateriSaving(false); }
  };

  const handleDeleteMateri = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm('Hapus materi ini?')) return;
    try { await api.deleteMateri(id); fetchMateri(materiSearch); }
    catch (e: any) { alert(e.message); }
  };

  // ── Tugas handlers ─────────────────────────────────────────────────────
  const fetchTugas = useCallback(async () => {
    if (!selectedCourse) return;
    setTugasLoading(true);
    try {
      const res = await api.getTugas(`id_kursus=${selectedCourse.id}`);
      setTugas(res.data);
    } catch (e: any) { setTugasError(e.message); }
    finally { setTugasLoading(false); }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && activeDetailTab === 'tugas') fetchTugas();
  }, [selectedCourse, activeDetailTab]);

  const handleSaveTugas = async () => {
    if (!tugasForm.judul_tugas.trim()) { setTugasError('Judul tugas tidak boleh kosong'); return; }
    if (!tugasForm.deadline) { setTugasError('Deadline wajib diisi'); return; }
    if (!selectedCourse) return;
    setTugasSaving(true); setTugasError('');
    try {
      const fd = new FormData();
      fd.append('id_kursus', String(selectedCourse.id));
      fd.append('judul_tugas', tugasForm.judul_tugas);
      fd.append('deskripsi', tugasForm.deskripsi);
      fd.append('deadline', tugasForm.deadline);
      fd.append('nilai_maksimal', String(tugasForm.nilai_maksimal));
      if (tugasForm.file_soal) fd.append('file_soal', tugasForm.file_soal);
      await api.createTugas(fd);
      setShowTugasModal(false);
      setTugasForm({ judul_tugas: '', deskripsi: '', deadline: '', nilai_maksimal: 100, file_soal: null });
      fetchTugas();
    } catch (e: any) { setTugasError(e.message); }
    finally { setTugasSaving(false); }
  };

  const handleDeleteTugas = async (id: number) => {
    if (!await confirm('Hapus tugas ini? Semua pengumpulan akan ikut terhapus.')) return;
    try { await api.deleteTugas(id); fetchTugas(); }
    catch (e: any) { alert(e.message); }
  };

  const openTugasDetail = async (t: any) => {
    setSelectedTugas(t);
    setSubmissionsLoading(true);
    try {
      const res = await api.getSubmissions(t.id);
      setSubmissions(res.data);
      const initial: Record<number, { nilai: string; feedback: string }> = {};
      res.data.forEach((s: any) => { initial[s.id] = { nilai: s.nilai ?? '', feedback: s.feedback ?? '' }; });
      setGradeForm(initial);
    } catch { /* silent */ }
    finally { setSubmissionsLoading(false); }
  };

  const handleGrade = async (subId: number) => {
    const g = gradeForm[subId];
    if (!g || g.nilai === '') return;
    setGradeSaving(subId);
    try {
      await api.gradeTugas(subId, { nilai: Number(g.nilai), feedback: g.feedback });
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, nilai: Number(g.nilai), feedback: g.feedback } : s));
    } catch (e: any) { alert(e.message); }
    finally { setGradeSaving(null); }
  };

  // ── Course Detail View ─────────────────────────────────────────────────
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Kembali ke Daftar Kursus</span>
          </button>
        </div>

        {/* Course Info Card */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCourse.judul}</h2>
                {selectedCourse.deskripsi && <p className="text-sm text-gray-500 mt-1">{selectedCourse.deskripsi}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {selectedCourse.trainer && <span className="text-sm text-gray-600">Trainer: <span className="font-medium">{selectedCourse.trainer}</span></span>}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCourse.status === 'publish' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedCourse.status}
                  </span>
                  <span className="text-sm text-gray-500">{selectedCourse.participants} peserta</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
          {(['materi', 'tugas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveDetailTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeDetailTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab === 'materi' ? <BookOpen className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
              {tab === 'materi' ? 'Materi' : 'Tugas'}
            </button>
          ))}
        </div>

        {/* Materials Section */}
        {activeDetailTab === 'materi' && <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Cari materi..." className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
                  value={materiSearch} onChange={e => setMateriSearch(e.target.value)} />
              </div>
              <button onClick={openAddMateri} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap">
                <Plus className="w-4 h-4" /><span>Tambah Materi</span>
              </button>
            </div>
          </div>

          {materiLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materi.map(m => {
                const ytId = m.tipe_materi === 'video' ? getYoutubeId(m.file_materi) : null;
                const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                const cfg = tipeConfig[m.tipe_materi] ?? tipeConfig.dokumen;
                return (
                  <div key={m.id_materi} onClick={() => setViewer(m)}
                    className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                    {thumb ? (
                      <div className="relative h-36">
                        <img src={thumb} alt={m.judul_materi} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-0 h-0 border-t-8 border-b-8 border-transparent ml-1" style={{ borderLeft: '14px solid white' }} />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Youtube className="w-3 h-3" /> YouTube
                        </div>
                      </div>
                    ) : (
                      <div className={`h-36 flex items-center justify-center ${cfg.bg}`}>
                        <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          {cfg.icon}
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2 group-hover:text-indigo-600 transition-colors">{m.judul_materi}</h3>
                        <button onClick={e => handleDeleteMateri(m.id_materi, e)} className="text-gray-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-white/8">
                        <span className={`uppercase font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-gray-400">{m.ukuran || ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {materi.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">Belum ada materi untuk kursus ini</div>
              )}
            </div>
          )}
        </div>}

        {/* Tugas Section */}
        {activeDetailTab === 'tugas' && <div className="space-y-4 mt-2">
          <div className="flex justify-end">
            <button onClick={() => { setTugasError(''); setTugasForm({ judul_tugas: '', deskripsi: '', deadline: '', nilai_maksimal: 100, file_soal: null }); setShowTugasModal(true); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              <Plus className="w-4 h-4" /><span>Buat Tugas</span>
            </button>
          </div>

          {tugasLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : selectedTugas ? (
            /* Submissions View */
            <div className="space-y-4">
              <button onClick={() => setSelectedTugas(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" /> Kembali ke daftar tugas
              </button>
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 p-5">
                <div className="flex flex-wrap gap-4 items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{selectedTugas.judul}</h4>
                    {selectedTugas.deskripsi && <p className="text-sm text-gray-500 mt-1">{selectedTugas.deskripsi}</p>}
                  </div>
                  <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(selectedTugas.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Maks: {selectedTugas.nilai_maksimal}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {submissions.length} / {selectedTugas.total} kumpul</span>
                  </div>
                </div>
                {selectedTugas.file_soal_url && (
                  <a href={selectedTugas.file_soal_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-600 hover:text-indigo-800">
                    <Download className="w-4 h-4" /> Download Soal PDF
                  </a>
                )}
              </div>

              {submissionsLoading ? (
                <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : submissions.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">Belum ada pengumpulan</p>
              ) : (
                <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-5 py-3 text-left">Peserta</th>
                        <th className="px-5 py-3 text-left">Waktu Kumpul</th>
                        <th className="px-5 py-3 text-left">File</th>
                        <th className="px-5 py-3 text-left w-28">Nilai</th>
                        <th className="px-5 py-3 text-left">Feedback</th>
                        <th className="px-5 py-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {submissions.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900 dark:text-white">{s.peserta}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(s.tanggal_kumpul).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-5 py-3">
                            {s.file_url && <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs"><Download className="w-3.5 h-3.5" />Unduh</a>}
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" min={0} max={selectedTugas.nilai_maksimal}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#0f1117] dark:text-white"
                              value={gradeForm[s.id]?.nilai ?? s.nilai ?? ''}
                              onChange={e => setGradeForm(f => ({ ...f, [s.id]: { ...f[s.id], nilai: e.target.value } }))} />
                          </td>
                          <td className="px-5 py-3">
                            <input type="text" placeholder="Feedback..."
                              className="w-full px-2 py-1 border border-gray-300 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#0f1117] dark:text-white"
                              value={gradeForm[s.id]?.feedback ?? s.feedback ?? ''}
                              onChange={e => setGradeForm(f => ({ ...f, [s.id]: { ...f[s.id], feedback: e.target.value } }))} />
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => handleGrade(s.id)} disabled={gradeSaving === s.id}
                              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs disabled:opacity-50 whitespace-nowrap">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {gradeSaving === s.id ? '...' : 'Simpan'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Tugas List */
            tugas.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">Belum ada tugas untuk kursus ini</div>
            ) : (
              <div className="space-y-3">
                {tugas.map(t => (
                  <div key={t.id} onClick={() => openTugasDetail(t)}
                    className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{t.judul}</h4>
                        {t.deskripsi && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{t.deskripsi}</p>}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Deadline: {new Date(t.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Maks: {t.nilai_maksimal}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.submissions}/{t.total} kumpul</span>
                          {t.file_soal_url && <span className="flex items-center gap-1 text-indigo-400"><FileText className="w-3.5 h-3.5" /> Ada soal PDF</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.status === 'Active' ? 'Aktif' : 'Selesai'}</span>
                        <button onClick={e => { e.stopPropagation(); handleDeleteTugas(t.id); }}
                          className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>}

        {/* Tugas Modal */}
        {showTugasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
                <h3 className="text-lg font-semibold dark:text-white">Buat Tugas Baru</h3>
                <button onClick={() => setShowTugasModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {tugasError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{tugasError}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Tugas</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={tugasForm.judul_tugas} onChange={e => setTugasForm(f => ({ ...f, judul_tugas: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={tugasForm.deskripsi} onChange={e => setTugasForm(f => ({ ...f, deskripsi: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                      value={tugasForm.deadline} onChange={e => setTugasForm(f => ({ ...f, deadline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai Maksimal</label>
                    <input type="number" min={1} max={1000} className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                      value={tugasForm.nilai_maksimal} onChange={e => setTugasForm(f => ({ ...f, nilai_maksimal: Number(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Soal PDF <span className="text-gray-400 font-normal">(opsional, maks 50 MB)</span></label>
                  <input type="file" accept=".pdf" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#161b22] dark:text-gray-300"
                    onChange={e => setTugasForm(f => ({ ...f, file_soal: e.target.files?.[0] ?? null }))} />
                  {tugasForm.file_soal && <p className="text-xs text-green-600 mt-1">✓ {tugasForm.file_soal.name}</p>}
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t dark:border-white/10">
                <button onClick={() => setShowTugasModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                <button onClick={handleSaveTugas} disabled={tugasSaving} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {tugasSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Viewer Modal */}
        {viewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ height: '90vh' }}>
              <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setViewer(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{viewer.judul_materi}</h3>
                    <p className="text-xs text-indigo-600">{selectedCourse.judul}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {viewer.file_materi && (
                    <a href={viewer.file_materi} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      {viewer.tipe_materi === 'video' ? 'Buka YouTube' : viewer.tipe_materi === 'link_drive' ? 'Buka Drive' : 'Download'}
                    </a>
                  )}
                  <button onClick={() => setViewer(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {viewer.tipe_materi === 'video' && getYoutubeId(viewer.file_materi) ? (
                  <div className="w-full h-full min-h-[400px] bg-black flex items-center justify-center">
                    <iframe src={`https://www.youtube.com/embed/${getYoutubeId(viewer.file_materi)}?autoplay=1`}
                      className="w-full h-full min-h-[400px]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                ) : viewer.tipe_materi === 'pdf' && viewer.file_materi ? (
                  pdfBlobUrl ? (
                    <iframe
                      src={pdfBlobUrl}
                      style={{ width: '100%', height: 'calc(90vh - 80px)', border: 'none', display: 'block' }}
                      title={viewer.judul_materi}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat PDF...</div>
                  )
                ) : viewer.tipe_materi === 'ppt' && viewer.file_materi ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                    <File className="w-16 h-16 text-gray-300" />
                    <p className="text-sm text-gray-500">Preview PPT tidak tersedia.</p>
                    <a href={viewer.file_materi} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Download PPT
                    </a>
                  </div>
                ) : viewer.tipe_materi === 'link_drive' && viewer.file_materi ? (
                  <iframe src={viewer.file_materi.replace('/view', '/preview')}
                    className="w-full h-full min-h-[500px]" title={viewer.judul_materi} allow="autoplay" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
                    <File className="w-16 h-16 text-gray-300" />
                    <p className="text-sm text-gray-400">File tidak tersedia.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Materi Modal */}
        {showMateriModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
                <h3 className="text-lg font-semibold dark:text-white">Tambah Materi</h3>
                <button onClick={() => setShowMateriModal(false)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                {materiError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{materiError}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                  <div className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm">{selectedCourse.judul}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Materi</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={materiForm.judul_materi} onChange={e => setMateriForm(f => ({ ...f, judul_materi: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={materiForm.tipe_materi}
                    onChange={e => setMateriForm(f => ({ ...f, tipe_materi: e.target.value, file: null, youtube_url: '', drive_url: '' }))}>
                    <option value="pdf">📄 PDF (maks 5 MB)</option>
                    <option value="video">🎬 Video (YouTube)</option>
                  </select>
                </div>

                {materiForm.tipe_materi === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link YouTube</label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                      <input type="url" placeholder="https://youtube.com/watch?v=..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                        value={materiForm.youtube_url} onChange={e => setMateriForm(f => ({ ...f, youtube_url: e.target.value }))} />
                    </div>
                    {materiForm.youtube_url && getYoutubeId(materiForm.youtube_url) && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                        <img src={`https://img.youtube.com/vi/${getYoutubeId(materiForm.youtube_url)}/hqdefault.jpg`} alt="Preview" className="w-full h-32 object-cover" />
                        <p className="text-xs text-green-600 text-center py-1.5 bg-green-50 font-medium">✓ Link YouTube valid</p>
                      </div>
                    )}
                  </div>
                )}

                {materiForm.tipe_materi === 'pdf' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File PDF <span className="text-gray-400 font-normal">(maks 5 MB)</span>
                    </label>
                    <input type="file"
                      accept=".pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > MAX_FILE_SIZE) {
                          setMateriError(`File terlalu besar: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maks 5 MB.`);
                          e.target.value = '';
                          return;
                        }
                        setMateriError('');
                        setMateriForm(f => ({ ...f, file }));
                      }} />
                    {materiForm.file && (
                      <p className="text-xs text-green-600 mt-1">✓ {materiForm.file.name} ({(materiForm.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-6 border-t dark:border-white/10">
                <button onClick={() => setShowMateriModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                <button onClick={handleSaveMateri} disabled={materiSaving} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {materiSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Course List View ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cari kursus dan trainer" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={openAdd} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /><span>Buat Kursus</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Judul Kursus</th>
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Peserta</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {kursus.map(k => (
                  <tr key={k.id} onClick={() => setSelectedCourse(k)} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 transition-colors">{k.judul}</div>
                      {k.deskripsi && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{k.deskripsi}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.trainer || '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={e => toggleStatus(k, e)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${k.status === 'publish' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {k.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{k.participants}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={e => openEdit(k, e)} className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={e => handleDelete(k.id, e)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total {meta.total} kursus</span>
              <div className="flex space-x-2">
                <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchKursus(page - 1, searchTerm); }} className="px-3 py-1 border border-gray-300 dark:border-white/10 rounded-md text-sm dark:text-gray-300 disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">{page} / {meta.last_page}</span>
                <button disabled={page >= meta.last_page} onClick={() => { setPage(p => p + 1); fetchKursus(page + 1, searchTerm); }} className="px-3 py-1 border border-gray-300 dark:border-white/10 rounded-md text-sm dark:text-gray-300 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">{editData ? 'Edit Kursus' : 'Buat Kursus Baru'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Kursus</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.judul_kursus} onChange={e => setForm(f => ({ ...f, judul_kursus: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
              </div>
              {!editData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trainer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                    value={form.id_trainer} onChange={e => setForm(f => ({ ...f, id_trainer: e.target.value }))}>
                    <option value="">-- Pilih Trainer --</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t dark:border-white/10">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
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
