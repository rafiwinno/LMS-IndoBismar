// FILE: src/pages/trainer/Assignments.tsx

import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  Users, Star, Loader2, AlertCircle, Clock, Award,
  BookOpen, FileCheck, HelpCircle, CheckCircle2, Circle
} from 'lucide-react';
import api from '../../api/axiosInstance';

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
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Course</span>
      {courses.map((c) => (
        <button key={c.id_kursus} onClick={() => onSelect(c.id_kursus)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${selected === c.id_kursus ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}>
          {c.judul_kursus}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub }: { icon: any; message: string; sub?: string; }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={26} className="text-slate-300" />
      </div>
      <p className="text-slate-500 font-semibold text-sm">{message}</p>
      {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} className="text-slate-400" />
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
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all";
const btnPrimary = "flex-1 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors";
const btnSecondary = "flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors";

export default function TrainerAssignments() {
  const [activeTab, setActiveTab] = useState<'tugas' | 'kuis'>('tugas');
  const tabs = [
    { key: 'tugas' as const, label: 'Tugas', icon: FileCheck },
    { key: 'kuis' as const, label: 'Kuis', icon: HelpCircle },
  ];
  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-1">Trainer</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tugas & Kuis</h1>
        <p className="text-slate-400 mt-1 text-sm">Kelola penilaian dan evaluasi peserta</p>
      </div>
      <div className="inline-flex bg-slate-100 p-1 rounded-2xl gap-1 shadow-inner">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === key ? 'bg-white text-slate-900 shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
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
    const res = await api.get(`/trainer/courses/${selectedCourse}/assignments`);
    setAssignments(res.data.data ?? []);
  };

  const loadSubmissions = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    try { const res = await api.get(`/trainer/assignments/${id}/submissions`); setSubmissions(res.data.data ?? []); }
    catch { setSubmissions([]); }
  };

  const handleSave = async () => {
    if (!form.judul_tugas.trim()) { setError('Judul wajib diisi'); return; }
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
    } catch (e: any) { setError(e.response?.data?.message || 'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tugas ini?')) return;
    setDeletingId(id);
    try { await api.delete(`/trainer/assignments/${id}`); setAssignments(assignments.filter((a) => a.id_tugas !== id)); }
    catch { alert('Gagal menghapus'); }
    finally { setDeletingId(null); }
  };

  const handleGrade = async () => {
    if (!gradeTarget) return;
    setLoading(true);
    try {
      await api.put(`/trainer/submissions/${gradeTarget.id_pengumpulan}/grade`, gradeForm);
      setGradeTarget(null);
      if (expandedId) { const res = await api.get(`/trainer/assignments/${expandedId}/submissions`); setSubmissions(res.data.data ?? []); }
    } catch (e: any) { alert(e.response?.data?.message || 'Gagal'); }
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

  const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

  return (
    <div className="space-y-5">
      {pageError && (
        <div className="flex gap-2 items-center bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle size={15} />{pageError}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CoursePills courses={courses} selected={selectedCourse} onSelect={setSelectedCourse} />
        <button onClick={openCreate} disabled={!selectedCourse}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20">
          <Plus size={15} /> Tambah Tugas
        </button>
      </div>

      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: assignments.length, bg: 'bg-blue-50', text: 'text-blue-600', icon: FileCheck },
            { label: 'Aktif', value: assignments.filter(a => !isExpired(a.deadline)).length, bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
            { label: 'Berakhir', value: assignments.filter(a => isExpired(a.deadline)).length, bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon size={17} className={s.text} /></div>
              <div><p className="text-xl font-bold text-slate-900">{s.value}</p><p className="text-xs text-slate-400">{s.label}</p></div>
            </div>
          ))}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100">
          <EmptyState icon={FileCheck} message="Belum ada tugas" sub="Pilih course lalu buat tugas pertama" />
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id_tugas} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:shadow-slate-100 transition-shadow">
              <div className="flex items-center gap-4 px-6 py-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExpired(a.deadline) ? 'bg-slate-100' : 'bg-blue-50'}`}>
                  <FileCheck size={17} className={isExpired(a.deadline) ? 'text-slate-300' : 'text-blue-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{a.judul_tugas}</p>
                    {isExpired(a.deadline) && <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full font-medium flex-shrink-0">Berakhir</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                    {a.deadline && (
                      <span className={`flex items-center gap-1 ${isExpired(a.deadline) ? 'text-red-400' : ''}`}>
                        <Clock size={11} />{new Date(a.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Award size={11} />Maks {a.nilai_maksimal}</span>
                    {a.file_tugas && (
                      <a href={`${API_URL}/storage/${a.file_tugas}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline">
                        📎 Lihat file tugas
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => loadSubmissions(a.id_tugas)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${expandedId === a.id_tugas ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    <Users size={13} />Pengumpulan
                    {expandedId === a.id_tugas ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <button onClick={() => openEdit(a)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(a.id_tugas)} disabled={deletingId === a.id_tugas} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40">
                    {deletingId === a.id_tugas ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {expandedId === a.id_tugas && (
                <div className="border-t border-slate-50 bg-slate-50/60 px-6 py-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pengumpulan · {submissions.length} peserta</p>
                  {submissions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">Belum ada yang mengumpulkan.</p>
                  ) : (
                    <div className="space-y-2">
                      {submissions.map((s) => (
                        <div key={s.id_pengumpulan} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {s.peserta?.nama?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{s.peserta?.nama}</p>
                            <p className="text-xs text-slate-400">{new Date(s.tanggal_kumpul).toLocaleDateString('id-ID')}</p>
                          </div>
                          {s.file_tugas && (
                            <a href={`${API_URL}/storage/${s.file_tugas}`} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline font-medium">Lihat file</a>
                          )}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {s.nilai !== null
                              ? <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{s.nilai}</span>
                              : <span className="text-xs text-amber-500 font-medium bg-amber-50 px-3 py-1 rounded-full">Belum dinilai</span>}
                            <button onClick={() => { setGradeTarget(s); setGradeForm({ nilai: s.nilai ?? 0, feedback: s.feedback ?? '' }); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors">
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
          ))}
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
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              {editTarget?.file_tugas && !fileTugas && (
                <a
                  href={`${API_URL}/storage/${editTarget.file_tugas}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 block"
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
            {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
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
      .then((res) => { setCourses(res.data); if (res.data.length > 0) setSelectedCourse(res.data[0].id_kursus); });
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
    const res = await api.get(`/trainer/courses/${selectedCourse}/quizzes`);
    setQuizzes(res.data.data ?? []);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.judul_kuis.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      editQuiz
        ? await api.put(`/trainer/quizzes/${editQuiz.id_kuis}`, quizForm)
        : await api.post('/trainer/quizzes', { ...quizForm, id_kursus: selectedCourse });
      setShowQuizModal(false); await reloadQuizzes();
    } catch (e: any) { setError(e.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Hapus kuis ini?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/trainer/quizzes/${id}`);
      setQuizzes(quizzes.filter((q) => q.id_kuis !== id));
      if (selectedQuiz?.id_kuis === id) { setSelectedQuiz(null); setQuestions([]); }
    } catch { alert('Gagal menghapus'); }
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
    } catch (e: any) { setError(e.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Hapus pertanyaan ini?')) return;
    try { await api.delete(`/trainer/questions/${id}`); setQuestions(questions.filter((q) => q.id_pertanyaan !== id)); }
    catch { alert('Gagal'); }
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
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20">
          <Plus size={15} /> Tambah Kuis
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100">
          <EmptyState icon={HelpCircle} message="Belum ada kuis" sub="Buat kuis pertama untuk course ini" />
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id_kuis} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:shadow-slate-100 transition-shadow">
              <div className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={17} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{q.judul_kuis}</p>
                  <div className="flex gap-4 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><BookOpen size={11} />{q.pertanyaan_count ?? 0} soal</span>
                    {q.waktu_mulai && <span className="flex items-center gap-1"><Clock size={11} />{new Date(q.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => loadQuestions(q)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedQuiz?.id_kuis === q.id_kuis ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    <BookOpen size={13} />Soal
                    {selectedQuiz?.id_kuis === q.id_kuis ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <button onClick={() => { setEditQuiz(q); setQuizForm({ judul_kuis: q.judul_kuis, waktu_mulai: q.waktu_mulai?.slice(0, 16) ?? '', waktu_selesai: q.waktu_selesai?.slice(0, 16) ?? '' }); setError(''); setShowQuizModal(true); }}
                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDeleteQuiz(q.id_kuis)} disabled={deletingId === q.id_kuis} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40">
                    {deletingId === q.id_kuis ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {selectedQuiz?.id_kuis === q.id_kuis && (
                <div className="border-t border-slate-50 bg-slate-50/60 px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soal · {questions.length}</p>
                    <button
                      onClick={() => { setQForm({ pertanyaan: '', tipe: 'pilihan_ganda', bobot_nilai: 10, pilihan: Array(4).fill(null).map(() => ({ teks_jawaban: '', benar: false })) }); setError(''); setShowQModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors">
                      <Plus size={13} />Tambah Soal
                    </button>
                  </div>
                  {questions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">Belum ada soal.</p>
                  ) : (
                    <div className="space-y-2">
                      {questions.map((qt, idx) => (
                        <div key={qt.id_pertanyaan} className="bg-white rounded-xl border border-slate-100 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">{idx + 1}</span>
                                <p className="text-sm font-medium text-slate-800">{qt.pertanyaan}</p>
                              </div>
                              <div className="flex gap-2 ml-8">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${qt.tipe === 'pilihan_ganda' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                                  {qt.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Award size={11} />{qt.bobot_nilai} poin</span>
                              </div>
                              {qt.tipe === 'pilihan_ganda' && qt.pilihan && (
                                <div className="mt-3 ml-8 grid grid-cols-2 gap-1.5">
                                  {qt.pilihan.map((p, pi) => (
                                    <div key={pi} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${p.benar ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-500'}`}>
                                      {p.benar ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> : <Circle size={12} className="text-slate-300 flex-shrink-0" />}
                                      <span className="truncate">{p.teks_jawaban}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => handleDeleteQuestion(qt.id_pertanyaan!)} className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
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
            {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowQuizModal(false)} className={btnSecondary}>Batal</button>
              <button onClick={handleSaveQuiz} disabled={loading} className={btnPrimary}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-base font-bold text-slate-900">Tambah Soal</h2>
              <button onClick={() => setShowQModal(false)} className="p-1.5 hover:bg-slate-100 rounded-xl"><X size={18} className="text-slate-400" /></button>
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
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${p.benar ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                        <button type="button" onClick={() => updatePilihan(idx, 'benar', true)} className="flex-shrink-0">
                          {p.benar ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-300 hover:text-slate-400" />}
                        </button>
                        <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + idx)}</span>
                        <input value={p.teks_jawaban} onChange={(e) => updatePilihan(idx, 'teks_jawaban', e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </Field>
              )}
              {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
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
