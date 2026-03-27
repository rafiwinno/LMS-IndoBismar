import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
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
      api.get('/trainer/peserta'),
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

  const selectedPeserta = pesertaList.find(
    (p) => String(p.id_pengguna) === form.id_peserta
  );
  const selectedCourse = courseList.find(
    (c) => String(c.id_kursus) === form.id_kursus
  );

  const handleSend = async () => {
    if (!form.id_peserta) { setError('Pilih peserta terlebih dahulu'); return; }
    if (!form.id_kursus)  { setError('Pilih course terlebih dahulu'); return; }
    if (!form.pesan.trim()) { setError('Pesan tidak boleh kosong'); return; }
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
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/8 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Send size={18} className="text-red-600 dark:text-red-400" />
            Kirim Feedback
          </h2>

          {/* Pilih Peserta */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">Pilih Peserta</label>
            <select
              value={form.id_peserta}
              onChange={(e) => setForm({ ...form, id_peserta: e.target.value, id_kursus: '' })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-[#161b22] dark:text-white"
            >
              <option value="">-- Pilih peserta --</option>
              {pesertaList.map((p) => (
                <option key={p.id_pengguna} value={p.id_pengguna}>{p.nama}</option>
              ))}
            </select>
          </div>

          {/* Pilih Course */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">Pilih Course</label>
            <select
              value={form.id_kursus}
              onChange={(e) => setForm({ ...form, id_kursus: e.target.value })}
              disabled={!form.id_peserta}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 dark:disabled:bg-white/4 disabled:text-gray-400 dark:disabled:text-gray-500 bg-white dark:bg-[#161b22] dark:text-white"
            >
              <option value="">-- Pilih course --</option>
              {courseList.map((c) => (
                <option key={c.id_kursus} value={c.id_kursus}>{c.judul_kursus}</option>
              ))}
            </select>
            {!form.id_peserta && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Pilih peserta dulu</p>
            )}
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">Tipe Feedback</label>
            <div className="flex gap-3">
              {['positif', 'negatif', 'netral'].map((t) => (
                <button
                  key={t}
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
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">Pesan</label>
            <textarea
              value={form.pesan}
              onChange={(e) => setForm({ ...form, pesan: e.target.value })}
              placeholder="Tulis feedback untuk peserta..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white dark:bg-[#161b22] dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{success}</p>}

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
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
                  {/* Tampilkan nama course */}
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
