import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, FileText, Video, File, X, ArrowLeft, Loader2 } from 'lucide-react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../api/MaterialApi';
import type { Material } from '../types/trainer'; // FIX: import interface

const typeIcon: Record<string, JSX.Element> = {
  video:   <Video    size={16} className="text-purple-500" />,
  pdf:     <FileText size={16} className="text-red-500" />,
  dokumen: <File     size={16} className="text-blue-500" />,
};

// FIX: ambil base URL dari env, bukan hardcode localhost
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export default function Materials() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const [materials, setMaterials]   = useState<Material[]>([]); // FIX: bukan any[]
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [form, setForm] = useState({
    judul_materi: '',
    tipe_materi:  'pdf' as 'pdf' | 'video' | 'dokumen',
    urutan:       1,
    link_video:   '',
    file_materi:  null as File | null,
  });
  const [loading, setLoading]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId]   = useState<number | null>(null); // FIX: track delete per baris
  const [error, setError]             = useState('');
  const [pageError, setPageError]     = useState('');

  const load = async () => {
    // FIX: sebelumnya tidak ada try-catch — jika API gagal, app crash
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
    setForm({
      judul_materi: '',
      tipe_materi:  'pdf',
      urutan:       materials.length + 1,
      link_video:   '',
      file_materi:  null,
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditTarget(m);
    setForm({
      judul_materi: m.judul_materi,
      tipe_materi:  m.tipe_materi,
      urutan:       m.urutan,
      link_video:   '',
      file_materi:  null,
    });
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
    // FIX: tambah try-catch + loading state per baris
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/trainer/courses" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Materi Course</h1>
            <p className="text-sm text-slate-500 mt-0.5">{materials.length} materi</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Tambah Materi
        </button>
      </div>

      {/* FIX: tampilkan error halaman */}
      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {pageError}
        </div>
      )}

      {/* List */}
      {pageLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
          <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-40" />
          <p>Memuat materi...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Belum ada materi untuk course ini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 w-12">#</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Judul</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Tipe</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">File</th>
                <th className="px-5 py-3.5 font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => (
                <tr key={m.id_materi} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 text-slate-400 font-mono">{m.urutan}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{m.judul_materi}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      {typeIcon[m.tipe_materi]}
                      <span className="text-slate-600 capitalize">{m.tipe_materi}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {m.file_materi ? (
                      <a
                        // FIX: URL dari env variable, bukan hardcode 127.0.0.1:8000
                        href={
                          m.file_materi.startsWith('http')
                            ? m.file_materi
                            : `${API_URL}/storage/${m.file_materi}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Lihat file
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        disabled={deletingId === m.id_materi}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id_materi)}
                        disabled={deletingId === m.id_materi}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {/* FIX: tampilkan spinner saat delete */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {editTarget ? 'Edit Materi' : 'Tambah Materi Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Materi</label>
                <input
                  value={form.judul_materi}
                  onChange={(e) => setForm({ ...form, judul_materi: e.target.value })}
                  placeholder="Masukkan judul materi"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipe</label>
                  <select
                    value={form.tipe_materi}
                    onChange={(e) => setForm({ ...form, tipe_materi: e.target.value as 'pdf' | 'video' | 'dokumen' })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="dokumen">Dokumen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Urutan</label>
                  <input
                    type="number"
                    value={form.urutan}
                    min={1}
                    onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {!editTarget && (
                form.tipe_materi === 'video' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Link Video</label>
                    <input
                      value={form.link_video}
                      onChange={(e) => setForm({ ...form, link_video: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Upload File ({form.tipe_materi === 'pdf' ? 'PDF' : 'DOC/DOCX'})
                    </label>
                    <input
                      type="file"
                      accept={form.tipe_materi === 'pdf' ? '.pdf' : '.doc,.docx'}
                      onChange={(e) => setForm({ ...form, file_materi: e.target.files?.[0] ?? null })}
                      className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )
              )}
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
