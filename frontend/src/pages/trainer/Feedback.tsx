import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AlertCircle, ChevronDown, Search, Check, BookOpen } from 'lucide-react';
import api from '../../api/axiosInstance';

interface PesertaItem {
  id_pengguna: number;
  nama: string;
}

interface CourseItem {
  id_kursus: number;
  judul_kursus: string;
}

interface FeedbackItem {
  id: number;
  peserta: string;
  course: string;
  pesan: string;
  tanggal: string;
  tipe: string;
}

// ─── Custom Searchable Dropdown ───────────────────────────────────────────────
function CustomSelect<T>({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  getLabel,
  getValue,
  renderOption,
}: {
  options: T[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  renderOption?: (item: T, selected: boolean) => React.ReactNode;
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const ref                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered     = options.filter((o) => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  const selectedItem = options.find((o) => getValue(o) === value);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen((v) => !v); setSearch(''); } }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150
          ${disabled
            ? 'bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/8 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : open
              ? 'bg-white dark:bg-[#1c2333] border-red-500 dark:border-red-400 ring-2 ring-red-500/20 text-gray-900 dark:text-white shadow-sm'
              : 'bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 hover:shadow-sm'
          }`}
      >
        <span className={`truncate ${selectedItem ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 font-normal'}`}>
          {selectedItem ? getLabel(selectedItem) : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-red-500' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-[#1c2333] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Search bar */}
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-white/8">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/6 border border-gray-200 dark:border-white/8 rounded-lg px-3 py-2">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
                Tidak ditemukan
              </p>
            ) : (
              filtered.map((item) => {
                const isSelected = getValue(item) === value;
                return (
                  <button
                    key={getValue(item)}
                    type="button"
                    onClick={() => { onChange(getValue(item)); setOpen(false); setSearch(''); }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors
                      ${isSelected
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className="flex-1 min-w-0">
                      {renderOption ? renderOption(item, isSelected) : (
                        <span className="truncate">{getLabel(item)}</span>
                      )}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {options.length > 5 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-white/8 text-xs text-gray-400 dark:text-gray-500">
              {filtered.length} dari {options.length} item
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrainerFeedback() {
  const [pesertaList, setPesertaList]   = useState<PesertaItem[]>([]);
  const [courseList, setCourseList]     = useState<CourseItem[]>([]);
  const [feedbacks, setFeedbacks]       = useState<FeedbackItem[]>([]);
  const [form, setForm] = useState({
    id_peserta: '',
    id_kursus:  '',
    pesan:      '',
    tipe:       'positif',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [apiError, setApiError] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { return () => { if (successTimer.current) clearTimeout(successTimer.current); }; }, []);

  useEffect(() => {
    Promise.allSettled([
      api.get('/trainer/peserta/semua'),
      api.get('/trainer/courses'),
      api.get('/trainer/feedback'),
    ]).then(([pesertaRes, coursesRes, feedbackRes]) => {
      if (pesertaRes.status === 'fulfilled') {
        setPesertaList(pesertaRes.value.data.data ?? pesertaRes.value.data);
      } else {
        setApiError(true);
      }
      if (coursesRes.status === 'fulfilled') {
        setCourseList(coursesRes.value.data);
      }
      if (feedbackRes.status === 'fulfilled') {
        const data = feedbackRes.value.data.data ?? [];
        setFeedbacks(data.map((f: { id_feedback: number; peserta?: { nama: string }; kursus?: { judul_kursus: string }; pesan: string; dibuat_pada?: string; tipe: string }) => ({
          id:      f.id_feedback,
          peserta: f.peserta?.nama ?? 'Peserta',
          course:  f.kursus?.judul_kursus ?? '—',
          pesan:   f.pesan,
          tanggal: f.dibuat_pada?.slice(0, 10),
          tipe:    f.tipe,
        })));
      }
    });
  }, []);

  const selectedPeserta = pesertaList.find((p) => String(p.id_pengguna) === form.id_peserta);
  const selectedCourse  = courseList.find((c) => String(c.id_kursus) === form.id_kursus);

  const handleSend = async () => {
    if (!form.id_peserta)   { setError('Pilih peserta terlebih dahulu'); return; }
    if (!form.id_kursus)    { setError('Pilih course terlebih dahulu');  return; }
    if (!form.pesan.trim()) { setError('Pesan tidak boleh kosong');      return; }
    setError('');
    setLoading(true);

    try {
      await api.post('/trainer/feedback', {
        id_peserta: Number(form.id_peserta),
        id_kursus:  Number(form.id_kursus),
        pesan:      form.pesan,
        tipe:       form.tipe,
      });

      setFeedbacks([
        {
          id:      Date.now(),
          peserta: selectedPeserta?.nama ?? '',
          course:  selectedCourse?.judul_kursus ?? '—',
          pesan:   form.pesan,
          tanggal: new Date().toISOString().slice(0, 10),
          tipe:    form.tipe,
        },
        ...feedbacks,
      ]);
      setForm({ id_peserta: '', id_kursus: '', pesan: '', tipe: 'positif' });
      setSuccess('Feedback berhasil dikirim!');
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Gagal mengirim feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Peserta</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Berikan feedback dan catatan kepada peserta PKL</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Endpoint <code>/api/trainer/peserta</code> belum tersedia di backend.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/8 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Send size={18} className="text-red-600 dark:text-red-400" />
            Kirim Feedback
          </h2>

          {/* Pilih Peserta */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Pilih Peserta
            </label>
            <CustomSelect
              options={pesertaList}
              value={form.id_peserta}
              onChange={(val) => setForm({ ...form, id_peserta: val, id_kursus: '' })}
              placeholder="Cari & pilih peserta..."
              getLabel={(p) => p.nama}
              getValue={(p) => String(p.id_pengguna)}
              renderOption={(p, selected) => (
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                    ${selected
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {p.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{p.nama}</span>
                </div>
              )}
            />
          </div>

          {/* Pilih Course */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Pilih Course
            </label>
            <CustomSelect
              options={courseList}
              value={form.id_kursus}
              onChange={(val) => setForm({ ...form, id_kursus: val })}
              placeholder="Cari & pilih course..."
              disabled={!form.id_peserta}
              getLabel={(c) => c.judul_kursus}
              getValue={(c) => String(c.id_kursus)}
              renderOption={(c, selected) => (
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                    ${selected
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400'
                    }`}>
                    <BookOpen size={13} />
                  </div>
                  <span className="truncate">{c.judul_kursus}</span>
                </div>
              )}
            />
            {!form.id_peserta && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Pilih peserta terlebih dahulu</p>
            )}
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Tipe Feedback</label>
            <div className="flex gap-3">
              {(['positif', 'negatif', 'netral'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, tipe: t })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                    form.tipe === t
                      ? t === 'positif' ? 'bg-green-50 border-green-500 text-green-700'
                        : t === 'negatif' ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-gray-100 dark:bg-white/8 border-gray-400 dark:border-white/20 text-gray-700 dark:text-gray-300'
                      : 'border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pesan */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Pesan</label>
            <textarea
              value={form.pesan}
              onChange={(e) => setForm({ ...form, pesan: e.target.value })}
              placeholder="Tulis feedback untuk peserta..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500 transition-all"
            />
          </div>

          {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{success}</p>}

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Send size={16} />
            {loading ? 'Mengirim...' : 'Kirim Feedback'}
          </button>
        </div>

        {/* Riwayat */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/8 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-red-600 dark:text-red-400" />
            Riwayat Feedback
          </h2>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p>Belum ada feedback dikirim</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div key={f.id} className={`p-4 rounded-lg border-l-4 ${
                  f.tipe === 'positif' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                  f.tipe === 'negatif' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                  'bg-gray-50 dark:bg-white/4 border-gray-400 dark:border-white/20'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{f.peserta}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{f.tanggal}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{f.course}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.pesan}</p>
                  <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                    f.tipe === 'positif' ? 'bg-green-100 text-green-700' :
                    f.tipe === 'negatif' ? 'bg-red-100 text-red-700' :
                    'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                  }`}>{f.tipe}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
