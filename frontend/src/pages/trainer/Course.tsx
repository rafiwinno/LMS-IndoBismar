// ============================================================
// FILE: src/pages/trainer/Course.tsx
// LOKASI: frontend/src/pages/trainer/Course.tsx
// ============================================================
// FIX yang diterapkan:
// 1. Ganti any[] dengan interface Course yang proper
// 2. Tambah error handling di load(), handleDelete(), handlePublish()
// 3. Tambah loading state untuk tombol hapus & publish
//    agar tidak bisa diklik ganda
// ============================================================

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Globe, BookOpen, X, Check, Loader2 } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, publishCourse } from '../../api/courseApi';
import { Link } from 'react-router-dom';
import type { Course } from '../types/trainer'; // FIX: import interface

export default function TrainerCourses() {
  const [courses, setCourses]       = useState<Course[]>([]); // FIX: bukan any[]
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm]             = useState({ judul_kursus: '', deskripsi: '' });
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // FIX: loading awal halaman
  const [actionId, setActionId]     = useState<number | null>(null); // FIX: track tombol mana yang loading
  const [error, setError]           = useState('');
  const [pageError, setPageError]   = useState(''); // FIX: error level halaman

  const load = async () => {
    // FIX: tambah try-catch — sebelumnya tidak ada sama sekali
    try {
      setPageError('');
      const res = await getCourses();
      setCourses(res.data);
    } catch {
      setPageError('Gagal memuat data course. Coba refresh halaman.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ judul_kursus: '', deskripsi: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditTarget(c);
    setForm({ judul_kursus: c.judul_kursus, deskripsi: c.deskripsi ?? '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.judul_kursus.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      if (editTarget) {
        await updateCourse(editTarget.id_kursus, form);
      } else {
        await createCourse(form);
      }
      setShowModal(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus course ini? Tindakan tidak bisa dibatalkan.')) return;
    // FIX: tambah try-catch dan loading state per baris
    setActionId(id);
    try {
      await deleteCourse(id);
      load();
    } catch {
      alert('Gagal menghapus course. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  const handlePublish = async (id: number) => {
    // FIX: tambah try-catch dan loading state per baris
    setActionId(id);
    try {
      await publishCourse(id);
      load();
    } catch {
      alert('Gagal mempublish course. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Course</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} course ditemukan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Tambah Course
        </button>
      </div>

      {/* FIX: Tampilkan error halaman */}
      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {pageError}
        </div>
      )}

      {/* Table */}
      {pageLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
          <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-40" />
          <p>Memuat course...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Belum ada course. Buat yang pertama!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Judul</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Deskripsi</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3.5 font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id_kursus} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      to={`/trainer/courses/${c.id_kursus}/materials`}
                      className="font-medium text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      {c.judul_kursus}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden md:table-cell max-w-xs truncate">
                    {c.deskripsi ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      c.status === 'publish'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status === 'publish' ? <Check size={12} /> : null}
                      {c.status === 'publish' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {/* FIX: disable tombol saat sedang proses + tampilkan spinner */}
                    <div className="flex items-center justify-end gap-1">
                      {c.status !== 'publish' && (
                        <button
                          onClick={() => handlePublish(c.id_kursus)}
                          disabled={actionId === c.id_kursus}
                          title="Publish"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionId === c.id_kursus
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Globe size={16} />}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(c)}
                        disabled={actionId === c.id_kursus}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id_kursus)}
                        disabled={actionId === c.id_kursus}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionId === c.id_kursus
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {editTarget ? 'Edit Course' : 'Tambah Course Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Course</label>
                <input
                  value={form.judul_kursus}
                  onChange={(e) => setForm({ ...form, judul_kursus: e.target.value })}
                  placeholder="Masukkan judul course"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi course..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
