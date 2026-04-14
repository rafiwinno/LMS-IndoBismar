// FILE: src/pages/trainer/Assignments.tsx

import { useEffect, useState } from 'react';
import { toast } from '../../lib/toast';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  Users, Star, Loader2, AlertCircle, Clock, Award,
  BookOpen, FileCheck, HelpCircle, CheckCircle2, Circle
} from 'lucide-react';
import api from '../../api/axiosInstance';

const STORAGE_URL = (import.meta.env.VITE_API_URL as string ?? 'http://127.0.0.1:8000/api').replace('/api', '/storage');

interface Course { id_kursus: number; judul_kursus: string; }
interface Assignment {
  id_tugas: number; id_kursus: number; judul_tugas: string;
  deskripsi: string | null; file_tugas: string | null;
  deadline: string | null; nilai_maksimal: number;
}
interface Submission {
  id_pengumpulan: number; id_pengguna: number; file_tugas: string;
  tanggal_kumpul: string; nilai: number | null; feedback: string | null;
  peserta: { id_pengguna: number; nama: string; email: string };
}
interface Choice { teks_jawaban: string; benar: boolean; }
interface Question {
  id_pertanyaan?: number; pertanyaan: string;
  tipe: 'pilihan_ganda' | 'essay'; bobot_nilai: number; pilihan?: Choice[];
}
interface Quiz {
  id_kuis: number; id_kursus: number; judul_kuis: string;
  waktu_mulai: string | null; waktu_selesai: string | null; pertanyaan_count?: number;
}

function CoursePills({ courses, selected, onSelect }: { courses: Course[]; selected: number | null; onSelect: (id: number) => void; }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Course</span>
      {courses.map((c) => (
        <button key={c.id_kursus} onClick={() => onSelect(c.id_kursus)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${selected === c.id_kursus ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/8 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-gray-200'}`}>
          {c.judul_kursus}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub }: { icon: any; message: string; sub?: string; }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/6 flex items-center justify-center mb-4">
        <Icon size={26} className="text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">{message}</p>
      {sub && <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1c2333] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-white/8">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/8 rounded-xl transition-colors">
            <X size={18} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
const btnPrimary = "flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:text-white/70 text-white text-sm font-semibold rounded-xl transition-colors";
const btnSecondary = "flex-1 py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors";

export default function TrainerAssignments() {
  const [activeTab, setActiveTab] = useState<'tugas' | 'kuis'>('tugas');
  const tabs = [
    { key: 'tugas' as const, label: 'Tugas', icon: FileCheck },
    { key: 'kuis' as const, label: 'Kuis', icon: HelpCircle },
  ];
  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl px-7 py-6 bg-linear-to-br from-red-600 via-red-500 to-rose-500 shadow-lg shadow-red-500/25">
        <div className="absolute -top-8 -right-8 w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-28 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
        <p className="text-red-200 text-xs font-bold tracking-widest uppercase mb-1 relative">Trainer</p>
        <h1 className="text-3xl font-bold text-white tracking-tight relative">Tugas & Kuis</h1>
        <p className="text-red-100/70 mt-1 text-sm relative">Kelola penilaian dan evaluasi peserta</p>
      </div>
      {/* Tabs */}
      <div className="inline-flex bg-gray-100 dark:bg-white/6 p-1 rounded-2xl gap-1 shadow-inner">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === key ? 'bg-white dark:bg-[#1c2333] text-gray-900 dark:text-white shadow-md shadow-gray-200/60 dark:shadow-black/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>
      {activeTab === 'tugas' ? <TugasTab /> : <KuisTab />}
    </div>
  );
}

function TugasTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [gradeTarget, setGradeTarget] = useState<Submission | null>(null);
  const [form, setForm] = useState({ judul_tugas: '', deskripsi: '', deadline: '', nilai_maksimal: 100 });
  const [gradeForm, setGradeForm] = useState({ nilai: 0, feedback: '' });
  const [fileTugas, setFileTugas] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    api.get('/trainer/courses')
      .then((res) => { setCourses(res.data); if (res.data.length > 0) setSelectedCourse(res.data[0].id_kursus); })
      .catch(() => setPageError('Gagal memuat course'));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/trainer/courses/${selectedCourse}/assignments`)
      .then((res) => setAssignments(res.data.data ?? []))
      .catch(() => setAssignments([]));
    setExpandedId(null);
  }, [selectedCourse]);

  const reload = async () => {
    try {
      const res = await api.get(`/trainer/courses/${selectedCourse}/assignments`);
      setAssignments(res.data.data ?? []);
    } catch { /* keep existing list on refetch failure */ }
  };

  const loadSubmissions = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    try { const res = await api.get(`/trainer/assignments/${id}/submissions`); setSubmissions(res.data.data ?? []); }
    catch { setSubmissions([]); toast.error('Gagal memuat data pengumpulan.'); }
  };

  const handleSave = async () => {
    if (!form.judul_tugas.trim()) { setError('Judul wajib diisi'); return; }
    if (!editTarget && !selectedCourse) { setError('Pilih course terlebih dahulu'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('judul_tugas', form.judul_tugas);
      fd.append('deskripsi', form.deskripsi);
      fd.append('deadline', form.deadline);
      fd.append('nilai_maksimal', String(form.nilai_maksimal));
      if (fileTugas) fd.append('file_tugas', fileTugas);
      if (editTarget) {
        fd.append('_method', 'PUT');
        await api.post(`/trainer/assignments/${editTarget.id_tugas}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        fd.append('id_kursus', String(selectedCourse));
        await api.post('/trainer/assignments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      setFileTugas(null);
      await reload();
    } catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; setError(err.response?.data?.message || 'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tugas ini?')) return;
    setDeletingId(id);
    try { await api.delete(`/trainer/assignments/${id}`); setAssignments(assignments.filter((a) => a.id_tugas !== id)); }
    catch { toast.error('Gagal menghapus tugas.'); }
    finally { setDeletingId(null); }
  };

  const handleGrade = async () => {
    if (!gradeTarget) return;
    const max = assignments.find(a => a.id_tugas === expandedId)?.nilai_maksimal ?? 100;
    if (gradeForm.nilai < 0 || gradeForm.nilai > max) {
      toast.error(`Nilai harus antara 0 dan ${max}`);
      return;
    }
    setLoading(true);
    try {
      await api.put(`/trainer/submissions/${gradeTarget.id_pengumpulan}/grade`, gradeForm);
      setGradeTarget(null);
      if (expandedId) { const res = await api.get(`/trainer/assignments/${expandedId}/submissions`); setSubmissions(res.data.data ?? []); }
    } catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; toast.error(err.response?.data?.message || 'Gagal memberi nilai.'); }
    finally { setLoading(false); }
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;

  const openCreate = () => {
    setEditTarget(null);
    setForm({ judul_tugas: '', deskripsi: '', deadline: '', nilai_maksimal: 100 });
    setFileTugas(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (a: Assignment) => {
    setEditTarget(a);
    setForm({ judul_tugas: a.judul_tugas, deskripsi: a.deskripsi ?? '', deadline: a.deadline?.slice(0, 16) ?? '', nilai_maksimal: a.nilai_maksimal });
    setFileTugas(null);
    setError('');
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      {pageError && (
        <div className="flex gap-2 items-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle size={15} />{pageError}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CoursePills courses={courses} selected={selectedCourse} onSelect={setSelectedCourse} />
        <button onClick={openCreate} disabled={!selectedCourse}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 dark:disabled:bg-white/6 disabled:text-gray-400 dark:disabled:text-gray-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20">
          <Plus size={15} /> Tambah Tugas
        </button>
      </div>

      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    value: assignments.length,                                    bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-500 dark:text-red-400',     icon: FileCheck   },
            { label: 'Aktif',   value: assignments.filter(a => !isExpired(a.deadline)).length, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-500 dark:text-emerald-400', icon: CheckCircle2 },
            { label: 'Berakhir',value: assignments.filter(a =>  isExpired(a.deadline)).length, bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-500 dark:text-amber-400', icon: Clock       },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-white/8 p-5 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.text} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-100 dark:border-white/8">
          <EmptyState icon={FileCheck} message="Belum ada tugas" sub="Pilih course lalu buat tugas pertama" />
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const expired = isExpired(a.deadline);
            return (
              <div key={a.id_tugas} className={`bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-white/8 overflow-hidden hover:shadow-lg hover:shadow-gray-100/70 dark:hover:shadow-black/25 transition-all duration-200 border-l-[3px] ${expired ? 'border-l-gray-300 dark:border-l-white/10' : 'border-l-red-500'}`}>
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${expired ? 'bg-gray-100 dark:bg-white/6' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <FileCheck size={18} className={expired ? 'text-gray-300 dark:text-gray-600' : 'text-red-500 dark:text-red-400'} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{a.judul_tugas}</p>
                      <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-semibold ${expired ? 'bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-gray-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                        {expired ? 'Berakhir' : 'Aktif'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
                      {a.deadline && (
                        <span className={`flex items-center gap-1 ${expired ? 'text-red-400 dark:text-red-500' : ''}`}>
                          <Clock size={11} />{new Date(a.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Award size={11} />Maks {a.nilai_maksimal}</span>
                      {a.file_tugas && (
                        <a href={`${STORAGE_URL}/${a.file_tugas}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline">
                          Lihat file tugas
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => loadSubmissions(a.id_tugas)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${expandedId === a.id_tugas ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                      <Users size={13} />Pengumpulan
                      {expandedId === a.id_tugas ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                    <button onClick={() => openEdit(a)} className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(a.id_tugas)} disabled={deletingId === a.id_tugas} className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-40">
                      {deletingId === a.id_tugas ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {expandedId === a.id_tugas && (
                  <div className="border-t border-gray-50 dark:border-white/6 bg-gray-50/50 dark:bg-white/2 px-5 py-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Pengumpulan · {submissions.length} peserta</p>
                    {submissions.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Belum ada yang mengumpulkan.</p>
                    ) : (
                      <div className="space-y-2">
                        {submissions.map((s) => (
                          <div key={s.id_pengumpulan} className="flex items-center gap-3 bg-white dark:bg-[#161b22] rounded-xl px-4 py-3 border border-gray-100 dark:border-white/8 hover:border-gray-200 dark:hover:border-white/12 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(s.peserta?.nama?.[0] ?? '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{s.peserta?.nama}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(s.tanggal_kumpul).toLocaleDateString('id-ID')}</p>
                            </div>
                            {s.file_tugas && (
                              <a href={`${STORAGE_URL}/${s.file_tugas}`} target="_blank" rel="noreferrer"
                                className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium shrink-0">Lihat file</a>
                            )}
                            <div className="flex items-center gap-2 shrink-0">
                              {s.nilai !== null
                                ? <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">{s.nilai}</span>
                                : <span className="text-xs text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">Belum dinilai</span>}
                              <button onClick={() => { setGradeTarget(s); setGradeForm({ nilai: s.nilai ?? 0, feedback: s.feedback ?? '' }); }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-red-600/20">
                                <Star size={11} />Nilai
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? 'Edit Tugas' : 'Tugas Baru'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Field label="Judul Tugas">
              <input value={form.judul_tugas} onChange={(e) => setForm({ ...form, judul_tugas: e.target.value })} placeholder="Contoh: Latihan CRUD Laravel" className={inputCls} />
            </Field>
            <Field label="Deskripsi">
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} placeholder="Instruksi pengerjaan..." className={inputCls + ' resize-none'} />
            </Field>
            <Field label="File Tugas (PDF, opsional)">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFileTugas(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {editTarget?.file_tugas && !fileTugas && (
                <a
                  href={`${STORAGE_URL}/${editTarget.file_tugas}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1 block"
                >
                  File saat ini: lihat PDF
                </a>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline">
                <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Nilai Maks">
                <input type="number" value={form.nilai_maksimal} min={1} max={1000} onChange={(e) => setForm({ ...form, nilai_maksimal: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowModal(false)} className={btnSecondary}>Batal</button>
              <button onClick={handleSave} disabled={loading} className={btnPrimary}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </Modal>
      )}

      {gradeTarget && (
        <Modal title={`Nilai — ${gradeTarget.peserta?.nama}`} onClose={() => setGradeTarget(null)}>
          <div className="space-y-4">
            <Field label="Nilai">
              <input type="number" min={0} value={gradeForm.nilai} onChange={(e) => setGradeForm({ ...gradeForm, nilai: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Feedback">
              <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={3} placeholder="Catatan untuk peserta..." className={inputCls + ' resize-none'} />
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setGradeTarget(null)} className={btnSecondary}>Batal</button>
              <button onClick={handleGrade} disabled={loading} className={btnPrimary}>{loading ? 'Menyimpan...' : 'Simpan Nilai'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function KuisTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({ judul_kuis: '', waktu_mulai: '', waktu_selesai: '' });
  const [qForm, setQForm] = useState<Question>({
    pertanyaan: '', tipe: 'pilihan_ganda', bobot_nilai: 10,
    pilihan: Array(4).fill(null).map(() => ({ teks_jawaban: '', benar: false })),
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trainer/courses')
      .then((res) => { setCourses(res.data); if (res.data.length > 0) setSelectedCourse(res.data[0].id_kursus); })
      .catch(() => setError('Gagal memuat daftar kursus.'));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/trainer/courses/${selectedCourse}/quizzes`)
      .then((res) => setQuizzes(res.data.data ?? []))
      .catch(() => setQuizzes([]));
    setSelectedQuiz(null); setQuestions([]);
  }, [selectedCourse]);

  const loadQuestions = async (quiz: Quiz) => {
    if (selectedQuiz?.id_kuis === quiz.id_kuis) { setSelectedQuiz(null); setQuestions([]); return; }
    setSelectedQuiz(quiz);
    try { const res = await api.get(`/trainer/quizzes/${quiz.id_kuis}`); setQuestions(res.data.data?.pertanyaan ?? []); }
    catch { setQuestions([]); }
  };

  const reloadQuizzes = async () => {
    try {
      const res = await api.get(`/trainer/courses/${selectedCourse}/quizzes`);
      setQuizzes(res.data.data ?? []);
    } catch { /* list tetap stale, tidak menimpa error save */ }
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.judul_kuis.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      editQuiz
        ? await api.put(`/trainer/quizzes/${editQuiz.id_kuis}`, quizForm)
        : await api.post('/trainer/quizzes', { ...quizForm, id_kursus: selectedCourse });
      setShowQuizModal(false); await reloadQuizzes();
    } catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; setError(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Hapus kuis ini?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/trainer/quizzes/${id}`);
      setQuizzes(quizzes.filter((q) => q.id_kuis !== id));
      if (selectedQuiz?.id_kuis === id) { setSelectedQuiz(null); setQuestions([]); }
    } catch { toast.error('Gagal menghapus kuis.'); }
    finally { setDeletingId(null); }
  };

  const handleSaveQuestion = async () => {
    if (!qForm.pertanyaan.trim()) { setError('Pertanyaan wajib diisi'); return; }
    if (qForm.tipe === 'pilihan_ganda') {
      if (!qForm.pilihan?.some((p) => p.benar)) { setError('Tandai 1 jawaban benar'); return; }
      if (qForm.pilihan?.some((p) => !p.teks_jawaban.trim())) { setError('Semua pilihan wajib diisi'); return; }
    }
    setLoading(true);
    try {
      await api.post(`/trainer/quizzes/${selectedQuiz?.id_kuis}/questions`, qForm);
      setShowQModal(false);
      const res = await api.get(`/trainer/quizzes/${selectedQuiz?.id_kuis}`);
      setQuestions(res.data.data?.pertanyaan ?? []);
    } catch (e: unknown) { const err = e as { response?: { data?: { message?: string } } }; setError(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Hapus pertanyaan ini?')) return;
    try { await api.delete(`/trainer/questions/${id}`); setQuestions(questions.filter((q) => q.id_pertanyaan !== id)); }
    catch { toast.error('Gagal menghapus pertanyaan.'); }
  };

  const updatePilihan = (idx: number, field: 'teks_jawaban' | 'benar', value: string | boolean) => {
    const p = [...(qForm.pilihan ?? [])];
    if (field === 'benar') { p.forEach((x) => (x.benar = false)); p[idx].benar = true; }
    else { p[idx] = { ...p[idx], teks_jawaban: value as string }; }
    setQForm({ ...qForm, pilihan: p });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CoursePills courses={courses} selected={selectedCourse} onSelect={setSelectedCourse} />
        <button
          onClick={() => { setEditQuiz(null); setQuizForm({ judul_kuis: '', waktu_mulai: '', waktu_selesai: '' }); setError(''); setShowQuizModal(true); }}
          disabled={!selectedCourse}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-100 dark:disabled:bg-white/6 disabled:text-gray-400 dark:disabled:text-gray-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20">
          <Plus size={15} /> Tambah Kuis
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-100 dark:border-white/8">
          <EmptyState icon={HelpCircle} message="Belum ada kuis" sub="Buat kuis pertama untuk course ini" />
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id_kuis} className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-white/8 overflow-hidden hover:shadow-lg hover:shadow-gray-100/70 dark:hover:shadow-black/25 transition-all duration-200 border-l-[3px] border-l-violet-500">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                  <HelpCircle size={18} className="text-violet-500 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{q.judul_kuis}</p>
                  <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1"><BookOpen size={11} />{q.pertanyaan_count ?? 0} soal</span>
                    {q.waktu_mulai && <span className="flex items-center gap-1"><Clock size={11} />{new Date(q.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => loadQuestions(q)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedQuiz?.id_kuis === q.id_kuis ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                    <BookOpen size={13} />Soal
                    {selectedQuiz?.id_kuis === q.id_kuis ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <button onClick={() => { setEditQuiz(q); setQuizForm({ judul_kuis: q.judul_kuis, waktu_mulai: q.waktu_mulai?.slice(0, 16) ?? '', waktu_selesai: q.waktu_selesai?.slice(0, 16) ?? '' }); setError(''); setShowQuizModal(true); }}
                    className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDeleteQuiz(q.id_kuis)} disabled={deletingId === q.id_kuis} className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-40">
                    {deletingId === q.id_kuis ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {selectedQuiz?.id_kuis === q.id_kuis && (
                <div className="border-t border-gray-50 dark:border-white/6 bg-gray-50/60 dark:bg-white/2 px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Soal · {questions.length}</p>
                    <button
                      onClick={() => { setQForm({ pertanyaan: '', tipe: 'pilihan_ganda', bobot_nilai: 10, pilihan: Array(4).fill(null).map(() => ({ teks_jawaban: '', benar: false })) }); setError(''); setShowQModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors">
                      <Plus size={13} />Tambah Soal
                    </button>
                  </div>
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Belum ada soal.</p>
                  ) : (
                    <div className="space-y-2">
                      {questions.map((qt, idx) => (
                        <div key={qt.id_pertanyaan} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-100 dark:border-white/8 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/8 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 mt-0.5">{idx + 1}</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{qt.pertanyaan}</p>
                              </div>
                              <div className="flex gap-2 ml-8">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${qt.tipe === 'pilihan_ganda' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'}`}>
                                  {qt.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><Award size={11} />{qt.bobot_nilai} poin</span>
                              </div>
                              {qt.tipe === 'pilihan_ganda' && qt.pilihan && (
                                <div className="mt-3 ml-8 grid grid-cols-2 gap-1.5">
                                  {qt.pilihan.map((p, pi) => (
                                    <div key={pi} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${p.benar ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold' : 'bg-gray-50 dark:bg-white/4 text-gray-500 dark:text-gray-400'}`}>
                                      {p.benar ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> : <Circle size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                                      <span className="truncate">{p.teks_jawaban}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => handleDeleteQuestion(qt.id_pertanyaan!)} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
                              <Trash2 size={14} />
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

      {showQuizModal && (
        <Modal title={editQuiz ? 'Edit Kuis' : 'Kuis Baru'} onClose={() => setShowQuizModal(false)}>
          <div className="space-y-4">
            <Field label="Judul Kuis">
              <input value={quizForm.judul_kuis} onChange={(e) => setQuizForm({ ...quizForm, judul_kuis: e.target.value })} placeholder="Contoh: Quiz Bab 1" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Waktu Mulai">
                <input type="datetime-local" value={quizForm.waktu_mulai} onChange={(e) => setQuizForm({ ...quizForm, waktu_mulai: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Waktu Selesai">
                <input type="datetime-local" value={quizForm.waktu_selesai} onChange={(e) => setQuizForm({ ...quizForm, waktu_selesai: e.target.value })} className={inputCls} />
              </Field>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowQuizModal(false)} className={btnSecondary}>Batal</button>
              <button onClick={handleSaveQuiz} disabled={loading} className={btnPrimary}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c2333] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-white/8 shrink-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Tambah Soal</h2>
              <button onClick={() => setShowQModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/8 rounded-xl"><X size={18} className="text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="px-7 py-6 overflow-y-auto space-y-4">
              <Field label="Pertanyaan">
                <textarea value={qForm.pertanyaan} onChange={(e) => setQForm({ ...qForm, pertanyaan: e.target.value })} rows={3} placeholder="Tulis soal di sini..." className={inputCls + ' resize-none'} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipe">
                  <select value={qForm.tipe} onChange={(e) => setQForm({ ...qForm, tipe: e.target.value as 'pilihan_ganda' | 'essay' })} className={inputCls}>
                    <option value="pilihan_ganda">Pilihan Ganda</option>
                    <option value="essay">Essay</option>
                  </select>
                </Field>
                <Field label="Bobot Nilai">
                  <input type="number" value={qForm.bobot_nilai} min={1} onChange={(e) => setQForm({ ...qForm, bobot_nilai: Number(e.target.value) })} className={inputCls} />
                </Field>
              </div>
              {qForm.tipe === 'pilihan_ganda' && (
                <Field label="Pilihan Jawaban — klik lingkaran = jawaban benar">
                  <div className="space-y-2">
                    {qForm.pilihan?.map((p, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${p.benar ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/4 hover:border-gray-300 dark:hover:border-white/15'}`}>
                        <button type="button" onClick={() => updatePilihan(idx, 'benar', true)} className="shrink-0">
                          {p.benar ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-gray-400" />}
                        </button>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4">{String.fromCharCode(65 + idx)}</span>
                        <input value={p.teks_jawaban} onChange={(e) => updatePilihan(idx, 'teks_jawaban', e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </Field>
              )}
              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowQModal(false)} className={btnSecondary}>Batal</button>
                <button onClick={handleSaveQuestion} disabled={loading} className={btnPrimary}>{loading ? 'Menyimpan...' : 'Simpan Soal'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
