import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, File, Trash2, X, Youtube, ExternalLink, ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { confirm } from '../../lib/confirm';

interface Materi {
  id_materi: number; judul_materi: string; tipe_materi: string;
  file_materi: string; ukuran: string; kursus: string; id_kursus: number; dibuat_pada: string;
}

const getYoutubeId = (url: string) => {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function Materials() {
  const [materi, setMateri] = useState<Materi[]>([]);
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ judul_materi: '', tipe_materi: 'pdf', id_kursus: '', file: null as File | null, youtube_url: '', drive_url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewer, setViewer] = useState<Materi | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

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

  const fetchMateri = async (search = '') => {
    setLoading(true);
    try {
      const res = await api.getMateri(search ? `search=${search}` : '');
      setMateri(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchKursus = async () => {
    try { const res = await api.getKursus('per_page=100'); setKursus(res.data); } catch {}
  };

  useEffect(() => { fetchKursus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchMateri(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSave = async () => {
    if (!form.judul_materi.trim()) { setError('Judul materi tidak boleh kosong'); return; }
    if (!form.id_kursus) { setError('Pilih kursus terlebih dahulu'); return; }

    const fd = new FormData();
    fd.append('judul_materi', form.judul_materi);
    fd.append('tipe_materi', form.tipe_materi);
    fd.append('id_kursus', form.id_kursus);

    if (form.tipe_materi === 'video') {
      if (!form.youtube_url) { setError('Masukkan link YouTube'); return; }
      if (!getYoutubeId(form.youtube_url)) { setError('Link YouTube tidak valid'); return; }
      fd.append('youtube_url', form.youtube_url);
    } else {
      if (!form.file) { setError('Pilih file terlebih dahulu'); return; }
      if (form.file.size > MAX_FILE_SIZE) { setError(`Ukuran file maksimal 5 MB. File kamu: ${(form.file.size / 1024 / 1024).toFixed(1)} MB`); return; }
      fd.append('file_materi', form.file);
    }

    setSaving(true); setError('');
    try {
      await api.createMateri(fd);
      setShowModal(false);
      fetchMateri(searchTerm);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm('Hapus materi ini?')) return;
    try { await api.deleteMateri(id); fetchMateri(searchTerm); }
    catch (e: any) { alert(e.message); }
  };

  const tipeConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    video:      { label: '▶ YouTube',    bg: 'bg-red-50',    text: 'text-red-600',    icon: <Youtube className="w-8 h-8 text-red-500" /> },
    pdf:        { label: 'PDF',          bg: 'bg-orange-50', text: 'text-orange-600', icon: <FileText className="w-8 h-8 text-red-500" /> },
    ppt:        { label: 'PPT',          bg: 'bg-orange-50', text: 'text-orange-600', icon: <File className="w-8 h-8 text-orange-500" /> },
    word:       { label: 'Word',         bg: 'bg-blue-50',   text: 'text-blue-600',   icon: <FileText className="w-8 h-8 text-blue-500" /> },
    link_drive: { label: '🔗 Drive',     bg: 'bg-blue-50',   text: 'text-blue-600',   icon: <File className="w-8 h-8 text-blue-500" /> },
    dokumen:    { label: 'Dokumen',      bg: 'bg-gray-50',   text: 'text-gray-600',   icon: <File className="w-8 h-8 text-gray-400" /> },
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Cari materi..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setForm({ judul_materi: '', tipe_materi: 'pdf', id_kursus: '', file: null, youtube_url: '', drive_url: '' }); setError(''); setShowModal(true); }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /><span>Tambah Materi</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>
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
                        <div className="w-0 h-0 border-t-8 border-b-8 border-transparent ml-1" style={{borderLeft: '14px solid white'}} />
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
                    <button onClick={e => handleDelete(m.id_materi, e)} className="text-gray-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-indigo-600 mb-2 line-clamp-1">{m.kursus}</p>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100 dark:border-white/8">
                    <span className={`uppercase font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    <span className="text-gray-400">{m.ukuran || ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {materi.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">Belum ada materi</div>
          )}
        </div>
      )}

      {/* VIEWER MODAL */}
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
                  <p className="text-xs text-indigo-600">{viewer.kursus}</p>
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
              ) : (viewer.tipe_materi === 'ppt' || viewer.tipe_materi === 'dokumen') && viewer.file_materi ? (
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

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-white/10">
              <h3 className="text-lg font-semibold dark:text-white">Tambah Materi</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 dark:text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Materi</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.judul_materi} onChange={e => setForm(f => ({ ...f, judul_materi: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kursus</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.id_kursus} onChange={e => setForm(f => ({ ...f, id_kursus: e.target.value }))}>
                  <option value="">-- Pilih Kursus --</option>
                  {kursus.map(k => <option key={k.id} value={k.id}>{k.judul}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-[#161b22] dark:text-white"
                  value={form.tipe_materi}
                  onChange={e => setForm(f => ({ ...f, tipe_materi: e.target.value, file: null, youtube_url: '', drive_url: '' }))}>
                  <option value="pdf">📄 PDF (maks 5 MB)</option>
                  <option value="video">🎬 Video (YouTube)</option>
                </select>
              </div>

              {form.tipe_materi === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link YouTube</label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                    <input type="url" placeholder="https://youtube.com/watch?v=..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
                      value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} />
                  </div>
                  {form.youtube_url && getYoutubeId(form.youtube_url) && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img src={`https://img.youtube.com/vi/${getYoutubeId(form.youtube_url)}/hqdefault.jpg`} alt="Preview" className="w-full h-32 object-cover" />
                      <p className="text-xs text-green-600 text-center py-1.5 bg-green-50 font-medium">✓ Link YouTube valid</p>
                    </div>
                  )}
                </div>
              )}


              {form.tipe_materi === 'pdf' && (
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
                        setError(`File terlalu besar: ${(file.size/1024/1024).toFixed(1)} MB. Maks 5 MB.`);
                        e.target.value = '';
                        return;
                      }
                      setError('');
                      setForm(f => ({ ...f, file }));
                    }} />
                  {form.file && (
                    <p className="text-xs text-green-600 mt-1">✓ {form.file.name} ({(form.file.size/1024/1024).toFixed(2)} MB)</p>
                  )}
                </div>
              )}
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