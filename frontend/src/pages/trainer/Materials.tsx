import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, FileText, Video, File, ArrowLeft, Loader2 } from 'lucide-react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../api/MaterialApi';
import type { Material } from '../types/trainer';
import Modal from '../../components/ui/Modal';
import { inputCls, cardCls, thCls, trCls } from '../../lib/styles';

const typeIcon: Record<string, JSX.Element> = {
  video:   <Video    size={16} className="text-purple-500" />,
  pdf:     <FileText size={16} className="text-red-500" />,
  dokumen: <File     size={16} className="text-blue-500" />,
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const labelCls = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5';

export default function Materials() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const [materials, setMaterials]     = useState<Material[]>([]);
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Material | null>(null);
  const [form, setForm] = useState({
    judul_materi: '',
    tipe_materi:  'pdf' as 'pdf' | 'video' | 'dokumen',
    urutan:       1,
    link_video:   '',
    file_materi:  null as File | null,
  });
  const [loading, setLoading]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [error, setError]             = useState('');
  const [pageError, setPageError]     = useState('');

  const load = async () => {
    try {
      setPageError('');
      const res = await getMaterials(courseId);
      setMaterials(res.data.data ?? []);
    } catch {
      setPageError('Gagal memuat materi. Coba refresh halaman.');
      setMaterials([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ judul_materi: '', tipe_materi: 'pdf', urutan: materials.length + 1, link_video: '', file_materi: null });
    setError('');
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditTarget(m);
    setForm({ judul_materi: m.judul_materi, tipe_materi: m.tipe_materi, urutan: m.urutan, link_video: '', file_materi: null });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.judul_materi.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      if (editTarget) {
        await updateMaterial(editTarget.id_materi, {
          judul_materi: form.judul_materi,
          tipe_materi:  form.tipe_materi,
          urutan:       form.urutan,
        });
      } else {
        const fd = new FormData();
        fd.append('id_kursus',    String(courseId));
        fd.append('judul_materi', form.judul_materi);
        fd.append('tipe_materi',  form.tipe_materi);
        fd.append('urutan',       String(form.urutan));
        if (form.tipe_materi === 'video') {
          if (!form.link_video.trim()) { setError('Link video wajib diisi'); setLoading(false); return; }
          fd.append('link_video', form.link_video);
        } else if (form.file_materi) {
          fd.append('file_materi', form.file_materi);
        } else {
          setError('File wajib diupload');
          setLoading(false);
          return;
        }
        await createMaterial(fd);
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

  const handleDelete = async (matId: number) => {
    if (!confirm('Hapus materi ini?')) return;
    setDeletingId(matId);
    try {
      await deleteMaterial(matId);
      load();
    } catch {
      alert('Gagal menghapus materi. Coba lagi.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/trainer/courses" className="p-2 hover:bg-gray-100 dark:hover:bg-white/8 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Materi Course</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{materials.length} materi</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Tambah Materi
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
          <p>Memuat materi...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className={`${cardCls} p-16 text-center`}>
          <FileText size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada materi untuk course ini.</p>
        </div>
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/4 border-b border-gray-200 dark:border-white/8">
              <tr>
                <th className={`${thCls} w-12`}>#</th>
                <th className={thCls}>Judul</th>
                <th className={thCls}>Tipe</th>
                <th className={`${thCls} hidden md:table-cell`}>File</th>
                <th className="px-5 py-3.5 font-semibold text-gray-500 dark:text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/6">
              {materials.map((m) => (
                <tr key={m.id_materi} className={trCls}>
                  <td className="px-5 py-4 text-gray-400 dark:text-gray-500 font-mono">{m.urutan}</td>
                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100">{m.judul_materi}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      {typeIcon[m.tipe_materi]}
                      <span className="text-gray-500 dark:text-gray-400 capitalize">{m.tipe_materi}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {m.file_materi ? (
                      m.tipe_materi === 'video' ? (() => {
                        const ytId = getYouTubeId(m.file_materi!);
                        return ytId ? (
                          <a href={m.file_materi} target="_blank" rel="noreferrer" className="block w-fit group">
                            <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                alt="thumbnail"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                                  <Video size={13} className="text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </a>
                        ) : (
                          <a href={m.file_materi} target="_blank" rel="noreferrer" className="text-red-600 dark:text-red-400 hover:underline text-xs">
                            Lihat video
                          </a>
                        );
                      })() : (
                        <a
                          href={m.file_materi.startsWith('http') ? m.file_materi : `${API_URL}/storage/${m.file_materi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-600 dark:text-red-400 hover:underline text-xs"
                        >
                          Lihat file
                        </a>
                      )
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        disabled={deletingId === m.id_materi}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id_materi)}
                        disabled={deletingId === m.id_materi}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === m.id_materi
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
          title={editTarget ? 'Edit Materi' : 'Tambah Materi Baru'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Judul Materi</label>
              <input
                value={form.judul_materi}
                onChange={(e) => setForm({ ...form, judul_materi: e.target.value })}
                placeholder="Masukkan judul materi"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipe</label>
                <select
                  value={form.tipe_materi}
                  onChange={(e) => setForm({ ...form, tipe_materi: e.target.value as 'pdf' | 'video' | 'dokumen' })}
                  className={inputCls}
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="dokumen">Dokumen</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Urutan</label>
                <input
                  type="number"
                  value={form.urutan}
                  min={1}
                  onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
            </div>
            {!editTarget && (
              form.tipe_materi === 'video' ? (
                <div>
                  <label className={labelCls}>Link Video</label>
                  <input
                    value={form.link_video}
                    onChange={(e) => setForm({ ...form, link_video: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className={inputCls}
                  />
                </div>
              ) : (
                <div>
                  <label className={labelCls}>
                    Upload File ({form.tipe_materi === 'pdf' ? 'PDF' : 'DOC/DOCX'})
                  </label>
                  <input
                    type="file"
                    accept={form.tipe_materi === 'pdf' ? '.pdf' : '.doc,.docx'}
                    onChange={(e) => setForm({ ...form, file_materi: e.target.files?.[0] ?? null })}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
              )
            )}
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
