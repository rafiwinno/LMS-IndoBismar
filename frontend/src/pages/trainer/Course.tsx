import { useEffect, useRef, useState } from 'react';
import { toast } from '../../lib/toast';
import { Plus, Pencil, Trash2, Globe, BookOpen, Check, Loader2, ImageIcon, X, Users, UserPlus, UserMinus, ChevronDown, Search } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, publishCourse, getCoursePeserta, enrollPesertaToCourse, unenrollPesertaFromCourse, getAllPesertaCabang } from '../../api/courseApi';
import { Link } from 'react-router-dom';
import type { Course } from '../types/trainer';
import Modal from '../../components/ui/Modal';
import { inputCls, cardCls, thCls, trCls } from '../../lib/styles';

interface EnrolledPeserta {
  id: number;
  nama: string;
  email: string;
}

interface PesertaCabang {
  id_pengguna: number;
  nama: string;
}

const labelCls = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5';
const STORAGE_URL = (import.meta.env.VITE_API_URL as string ?? 'http://127.0.0.1:8000/api').replace('/api', '/storage');

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
  const blobUrlRef                    = useRef<string | null>(null);

  // Peserta management
  const [pesertaModal, setPesertaModal]       = useState<Course | null>(null);
  const [enrolledPeserta, setEnrolledPeserta] = useState<EnrolledPeserta[]>([]);
  const [allPeserta, setAllPeserta]           = useState<PesertaCabang[]>([]);
  const [pesertaLoading, setPesertaLoading]   = useState(false);
  const [selectedPesertaId, setSelectedPesertaId] = useState<number | ''>('');
  const [enrollingPeserta, setEnrollingPeserta]   = useState(false);
  const [showPesertaDropdown, setShowPesertaDropdown] = useState(false);
  const [pesertaSearch, setPesertaSearch]             = useState('');
  const pesertaDropdownRef                            = useRef<HTMLDivElement>(null);

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

  // Revoke blob URL on unmount to prevent memory leak
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  // Only attach click-outside listener while the dropdown is open
  useEffect(() => {
    if (!showPesertaDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pesertaDropdownRef.current && !pesertaDropdownRef.current.contains(e.target as Node)) {
        setShowPesertaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPesertaDropdown]);

  const resetImageState = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
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
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
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
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2 MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
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
      await load();
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
      await load();
    } catch {
      toast.error('Gagal menghapus course. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm('Publish course ini? Course akan langsung terlihat oleh semua peserta.')) return;
    setActionId(id);
    try {
      await publishCourse(id);
      await load();
    } catch {
      toast.error('Gagal mempublish course. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  const openPesertaModal = async (c: Course) => {
    setPesertaModal(c);
    setPesertaLoading(true);
    setSelectedPesertaId('');
    setShowPesertaDropdown(false);
    setPesertaSearch('');
    try {
      const [enrolled, all] = await Promise.all([
        getCoursePeserta(c.id_kursus),
        getAllPesertaCabang(),
      ]);
      setEnrolledPeserta(enrolled.data?.data ?? []);
      setAllPeserta(all.data?.data ?? []);
    } catch {
      toast.error('Gagal memuat data peserta.');
    } finally {
      setPesertaLoading(false);
    }
  };

  const handleEnrollPeserta = async () => {
    if (!pesertaModal || !selectedPesertaId) return;
    setEnrollingPeserta(true);
    try {
      await enrollPesertaToCourse(pesertaModal.id_kursus, Number(selectedPesertaId));
      setSelectedPesertaId('');
      const res = await getCoursePeserta(pesertaModal.id_kursus);
      setEnrolledPeserta(res.data?.data ?? []);
      toast.success('Peserta berhasil didaftarkan.');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan peserta.');
    } finally {
      setEnrollingPeserta(false);
    }
  };

  const handleUnenrollPeserta = async (id_pengguna: number) => {
    if (!pesertaModal || !confirm('Keluarkan peserta dari kursus ini?')) return;
    try {
      await unenrollPesertaFromCourse(pesertaModal.id_kursus, id_pengguna);
      const res = await getCoursePeserta(pesertaModal.id_kursus);
      setEnrolledPeserta(res.data?.data ?? []);
      toast.success('Peserta berhasil dikeluarkan dari kursus.');
    } catch {
      toast.error('Gagal mengeluarkan peserta.');
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
                      <>
                        <img
                          src={courseImageUrl(c.gambar_kursus)!}
                          alt={c.judul_kursus}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-white/10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (sib) { sib.classList.remove('hidden'); sib.classList.add('flex'); }
                          }}
                        />
                        <div className="hidden w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 items-center justify-center">
                          <ImageIcon size={18} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      </>
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
                      <button
                        onClick={() => openPesertaModal(c)}
                        title="Kelola Peserta"
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Users size={16} />
                      </button>
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

      {/* Peserta Management Modal */}
      {pesertaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Kelola Peserta</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{pesertaModal.judul_kursus}</p>
              </div>
              <button onClick={() => setPesertaModal(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>

            <div className="p-5 border-b border-gray-100 dark:border-white/8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tambah Peserta</p>
              <div className="flex gap-2">
                {/* Custom peserta dropdown */}
                <div ref={pesertaDropdownRef} className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => { setShowPesertaDropdown(v => !v); setPesertaSearch(''); }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
                      ${showPesertaDropdown
                        ? 'border-red-500 ring-2 ring-red-500/30 bg-white dark:bg-[#0d0f14]'
                        : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0f14] hover:border-gray-300 dark:hover:border-white/20'}
                      ${selectedPesertaId ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    <span className="truncate">
                      {selectedPesertaId
                        ? allPeserta.find(p => p.id_pengguna === selectedPesertaId)?.nama ?? 'Pilih peserta'
                        : 'Pilih peserta'}
                    </span>
                    <ChevronDown size={14} className={`shrink-0 transition-transform ${showPesertaDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showPesertaDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg overflow-hidden">
                      {/* Search */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/8">
                        <Search size={13} className="text-gray-400 shrink-0" />
                        <input
                          autoFocus
                          value={pesertaSearch}
                          onChange={e => setPesertaSearch(e.target.value)}
                          placeholder="Cari peserta..."
                          className="w-full text-sm bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      {/* Options list */}
                      {(() => {
                        const filtered = allPeserta
                          .filter(p => !enrolledPeserta.some(ep => ep.id === p.id_pengguna))
                          .filter(p => p.nama.toLowerCase().includes(pesertaSearch.toLowerCase()));
                        return (
                          <>
                            <ul className="max-h-44 overflow-y-auto py-1">
                              {filtered.map((p) => (
                                <li
                                  key={p.id_pengguna}
                                  onClick={() => {
                                    setSelectedPesertaId(p.id_pengguna);
                                    setShowPesertaDropdown(false);
                                  }}
                                  className={`flex items-center px-3 py-2 text-sm cursor-pointer transition-colors
                                    ${selectedPesertaId === p.id_pengguna
                                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                  {p.nama}
                                </li>
                              ))}
                              {filtered.length === 0 && (
                                <li className="px-3 py-3 text-sm text-center text-gray-400 dark:text-gray-500">
                                  Tidak ada peserta
                                </li>
                              )}
                            </ul>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEnrollPeserta}
                  disabled={!selectedPesertaId || enrollingPeserta}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  <UserPlus size={15} />
                  {enrollingPeserta ? '...' : 'Daftarkan'}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Terdaftar ({enrolledPeserta.length})
              </p>
              {pesertaLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
              ) : enrolledPeserta.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Belum ada peserta terdaftar.</p>
              ) : (
                <ul className="space-y-2">
                  {enrolledPeserta.map((p) => (
                    <li key={p.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-white/8 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{p.nama}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                      <button
                        onClick={() => handleUnenrollPeserta(p.id)}
                        title="Keluarkan dari kursus"
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <UserMinus size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
