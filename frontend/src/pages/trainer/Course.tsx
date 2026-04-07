import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Globe, BookOpen, Check, Loader2, ImageIcon, X } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, publishCourse } from '../../api/courseApi';
import { Link } from 'react-router-dom';
import type { Course } from '../types/trainer';
import Modal from '../../components/ui/Modal';
import { inputCls, cardCls, thCls, trCls } from '../../lib/styles';

const labelCls = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5';
const STORAGE_URL = (import.meta.env.VITE_API_URL as string).replace('/api', '/storage');

function courseImageUrl(path: string | null): string | null {
  if (!path) return null;
  return `${STORAGE_URL}/${path}`;
}

export default function TrainerCourses() {
  const [courses, setCourses]         = useState<Course[]>([]);
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Course | null>(null);
  const [form, setForm]               = useState({ judul_kursus: '', deskripsi: '' });
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionId, setActionId]       = useState<number | null>(null);
  const [error, setError]             = useState('');
  const [pageError, setPageError]     = useState('');
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const load = async () => {
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

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ judul_kursus: '', deskripsi: '' });
    resetImageState();
    setError('');
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditTarget(c);
    setForm({ judul_kursus: c.judul_kursus, deskripsi: c.deskripsi ?? '' });
    setImageFile(null);
    setImagePreview(courseImageUrl(c.gambar_kursus));
    setError('');
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    resetImageState();
  };

  const handleSave = async () => {
    if (!form.judul_kursus.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('judul_kursus', form.judul_kursus);
      fd.append('deskripsi', form.deskripsi);
      if (imageFile) {
        fd.append('gambar_kursus', imageFile);
      }

      if (editTarget) {
        await updateCourse(editTarget.id_kursus, fd);
      } else {
        await createCourse(fd);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Course</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{courses.length} course ditemukan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Tambah Course
        </button>
      </div>

      {pageError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {pageError}
        </div>
      )}

      {pageLoading ? (
        <div className={`${cardCls} p-16 text-center text-gray-400 dark:text-gray-500`}>
          <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-40" />
          <p>Memuat course...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <BookOpen size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada course. Buat yang pertama!</p>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/4 border-b border-gray-200 dark:border-white/8">
              <tr>
                <th className={`${thCls} w-16`}>Gambar</th>
                <th className={thCls}>Judul</th>
                <th className={`${thCls} hidden md:table-cell`}>Deskripsi</th>
                <th className={thCls}>Status</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/6">
              {courses.map((c) => (
                <tr key={c.id_kursus} className={trCls}>
                  <td className="px-3 py-3">
                    {courseImageUrl(c.gambar_kursus) ? (
                      <img
                        src={courseImageUrl(c.gambar_kursus)!}
                        alt={c.judul_kursus}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                        <ImageIcon size={18} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to={`/trainer/courses/${c.id_kursus}/materials`}
                      className="font-medium text-gray-800 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {c.judul_kursus}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-xs truncate">
                    {c.deskripsi ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      c.status === 'publish'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {c.status === 'publish' && <Check size={12} />}
                      {c.status === 'publish' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {c.status !== 'publish' && (
                        <button
                          onClick={() => handlePublish(c.id_kursus)}
                          disabled={actionId === c.id_kursus}
                          title="Publish"
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionId === c.id_kursus
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Globe size={16} />}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(c)}
                        disabled={actionId === c.id_kursus}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id_kursus)}
                        disabled={actionId === c.id_kursus}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
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

      {showModal && (
        <Modal
          title={editTarget ? 'Edit Course' : 'Tambah Course Baru'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Judul Course</label>
              <input
                value={form.judul_kursus}
                onChange={(e) => setForm({ ...form, judul_kursus: e.target.value })}
                placeholder="Masukkan judul course"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Deskripsi course..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className={labelCls}>Gambar Preview Course</label>
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview gambar course"
                    className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    title="Hapus gambar"
                  >
                    <X size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:border-red-400 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <ImageIcon size={28} />
                  <span className="text-sm">Klik untuk upload gambar</span>
                  <span className="text-xs">JPG, PNG, WebP — maks 2 MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
