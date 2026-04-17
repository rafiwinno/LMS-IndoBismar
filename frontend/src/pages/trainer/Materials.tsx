import { useParams, Link } from 'react-router-dom';
import { toast } from '../../lib/toast';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, FileText, Video, File, ArrowLeft, Loader2, ExternalLink, X as XIcon, ChevronLeft } from 'lucide-react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../api/MaterialApi';
import type { Material } from '../types/trainer';
import Modal from '../../components/ui/Modal';
import { inputCls } from '../../lib/styles';

const typeMeta: Record<string, { icon: JSX.Element; label: string; bg: string; text: string; border: string }> = {
  video:   {
    icon:   <Video    size={20} />,
    label:  'Video',
    bg:     'bg-purple-500/10 dark:bg-purple-500/15',
    text:   'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/40',
  },
  pdf:     {
    icon:   <FileText size={20} />,
    label:  'PDF',
    bg:     'bg-red-500/10 dark:bg-red-500/15',
    text:   'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800/40',
  },
  dokumen: {
    icon:   <File     size={20} />,
    label:  'Dokumen',
    bg:     'bg-blue-500/10 dark:bg-blue-500/15',
    text:   'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/40',
  },
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const STORAGE_URL = (import.meta.env.VITE_API_URL as string ?? 'http://127.0.0.1:8000/api').replace('/api', '/storage');
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
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

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

  const materialsWithMeta = useMemo(
    () => materials.map(m => ({
      ...m,
      ytId: m.tipe_materi === 'video' && m.file_materi ? getYouTubeId(m.file_materi) : null,
      fileUrl: m.file_materi
        ? (m.file_materi.startsWith('http') ? m.file_materi : `${STORAGE_URL}/${m.file_materi}`)
        : null,
    })),
    [materials]
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm({ judul_materi: '', tipe_materi: 'pdf', urutan: materials.length + 1, link_video: '', file_materi: null });
    setError('');
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditTarget(m);
    setForm({ judul_materi: m.judul_materi, tipe_materi: m.tipe_materi, urutan: m.urutan, link_video: m.tipe_materi === 'video' && m.file_materi ? m.file_materi : '', file_materi: null });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.judul_materi.trim()) { setError('Judul wajib diisi'); return; }
    setLoading(true);
    try {
      if (editTarget) {
        if (form.tipe_materi === 'video') {
          if (!form.link_video.trim()) { setError('Link video wajib diisi'); setLoading(false); return; }
          await updateMaterial(editTarget.id_materi, {
            judul_materi: form.judul_materi,
            tipe_materi:  form.tipe_materi,
            urutan:       form.urutan,
            link_video:   form.link_video,
          });
        } else if (form.file_materi) {
          const fd = new FormData();
          fd.append('judul_materi', form.judul_materi);
          fd.append('tipe_materi',  form.tipe_materi);
          fd.append('urutan',       String(form.urutan));
          fd.append('file_materi',  form.file_materi);
          await updateMaterial(editTarget.id_materi, fd);
        } else {
          await updateMaterial(editTarget.id_materi, {
            judul_materi: form.judul_materi,
            tipe_materi:  form.tipe_materi,
            urutan:       form.urutan,
          });
        }
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
      toast.error('Gagal menghapus materi. Coba lagi.');
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
        <div className={`bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-2xl p-16 text-center text-gray-400 dark:text-gray-500`}>
          <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-40" />
          <p>Memuat materi...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className={`bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-2xl p-16 text-center`}>
          <FileText size={40} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada materi untuk course ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialsWithMeta.map((m) => {
            const meta = typeMeta[m.tipe_materi] ?? typeMeta.dokumen;
            const { ytId, fileUrl } = m;

            return (
              <div
                key={m.id_materi}
                className="group bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/15 transition-all duration-200"
              >
                {/* Preview area */}
                {ytId ? (
                  <button
                    onClick={() => setPreviewMaterial(m)}
                    className="relative w-full aspect-video overflow-hidden block"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                      alt={m.judul_materi}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Video size={20} className="text-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      #{m.urutan}
                    </span>
                  </button>
                ) : (
                  <div className={`relative w-full aspect-video flex items-center justify-center ${meta.bg}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${meta.bg} border-2 ${meta.border} ${meta.text}`}>
                      {meta.icon}
                    </div>
                    <span className="absolute top-2 left-2 bg-black/20 dark:bg-black/40 text-gray-700 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      #{m.urutan}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {m.judul_materi}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/6">
                    {/* Action link */}
                    {ytId ? (
                      <button
                        onClick={() => setPreviewMaterial(m)}
                        className={`flex items-center gap-1.5 text-xs font-medium ${meta.text} hover:underline`}
                      >
                        <Video size={13} /> Tonton Video
                      </button>
                    ) : fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-1.5 text-xs font-medium ${meta.text} hover:underline`}
                      >
                        <ExternalLink size={13} /> Lihat File
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Tidak ada file</span>
                    )}

                    {/* Edit / Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        disabled={deletingId === m.id_materi}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id_materi)}
                        disabled={deletingId === m.id_materi}
                        title="Hapus"
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deletingId === m.id_materi
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
            {/* Saat CREATE: tampilkan input video atau file sesuai tipe */}
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

            {/* Saat EDIT VIDEO: tampilkan input link video */}
            {editTarget && form.tipe_materi === 'video' && (
              <div>
                <label className={labelCls}>Link Video</label>
                <input
                  value={form.link_video}
                  onChange={(e) => setForm({ ...form, link_video: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className={inputCls}
                />
              </div>
            )}

            {/* Saat EDIT PDF/DOKUMEN: tampilkan opsi ganti file */}
            {editTarget && form.tipe_materi !== 'video' && (
              <div>
                <label className={labelCls}>
                  Ganti File ({form.tipe_materi === 'pdf' ? 'PDF' : 'DOC/DOCX'}) — opsional
                </label>
                {editTarget.file_materi && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 truncate">
                    File saat ini: {editTarget.file_materi.split('/').pop()}
                  </p>
                )}
                <input
                  type="file"
                  accept={form.tipe_materi === 'pdf' ? '.pdf' : '.doc,.docx'}
                  onChange={(e) => setForm({ ...form, file_materi: e.target.files?.[0] ?? null })}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Kosongkan jika tidak ingin mengganti file</p>
              </div>
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
                disabled={loading || !form.judul_materi.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Video Preview Modal */}
      {previewMaterial && (() => {
        const ytId = getYouTubeId(previewMaterial.file_materi!);
        if (!ytId) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewMaterial(null)}>
            <div className="bg-[#0f1117] rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <button onClick={() => setPreviewMaterial(null)} className="p-1 text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white font-semibold text-sm truncate mx-3">{previewMaterial.judul_materi}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewMaterial.file_materi!}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink size={13} /> Buka YouTube
                  </a>
                  <button onClick={() => setPreviewMaterial(null)} className="p-1 text-white/60 hover:text-white transition-colors">
                    <XIcon size={20} />
                  </button>
                </div>
              </div>
              {/* Player */}
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
