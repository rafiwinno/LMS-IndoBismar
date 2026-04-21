import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ChevronLeft, AlertTriangle } from 'lucide-react';
import API from '../../api/api';

interface Pilihan {
  id_pilihan: number;
  teks_jawaban: string;
}

interface Pertanyaan {
  id_pertanyaan: number;
  pertanyaan: string;
  pilihan: Pilihan[];
}

interface KuisDetail {
  id_kuis: number;
  judul_kuis: string;
  waktu_selesai: string;
}

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCourse = location.state?.fromCourse;

  const [kuis, setKuis] = useState<KuisDetail | null>(null);
  const [pertanyaan, setPertanyaan] = useState<Pertanyaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasil, setHasil] = useState<{ nilai: number; benar: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    API.get(`/user/kuis/${id}`)
      .then(res => {
        setKuis(res.data.kuis);
        setPertanyaan(res.data.pertanyaan);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    API.get('/user/kuis')
      .then(res => {
        const kuisList = res.data.data;
        const thisKuis = kuisList.find((k: any) => k.id_kuis === Number(id));
        if (thisKuis?.status_attempt === 'sudah') {
          navigate(fromCourse ? `/courses/${fromCourse}` : '/tasks');
        }
      });
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (id_pilihan: number) => {
    setAnswers({ ...answers, [currentQuestion]: id_pilihan });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const jawaban = pertanyaan.map((p, index) => ({
        id_pertanyaan: p.id_pertanyaan,
        id_pilihan: answers[index] ?? 0,
      }));
      const res = await API.post(`/user/kuis/${id}/kerjakan`, { jawaban });
      setHasil(res.data);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (msg === 'Kamu sudah mengerjakan kuis ini') {
        navigate(fromCourse ? `/courses/${fromCourse}` : '/tasks');
      } else {
        alert(msg || 'Gagal mengumpulkan kuis.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
      Memuat kuis...
    </div>
  );

  if (!kuis) return (
    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
      Kuis tidak ditemukan.
    </div>
  );

  // Halaman hasil
  if (isSubmitted && hasil) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-white dark:bg-[#161b27] rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-white/8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kuis Berhasil Dikumpulkan!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Terima kasih telah mengerjakan {kuis.judul_kuis}.
          </p>

          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 border border-gray-100 dark:border-white/8 mb-8 inline-block text-left">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-gray-500 dark:text-gray-400 font-medium w-32">Nilai:</span>
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{hasil.nilai}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium w-32">Jawaban Benar:</span>
              <span className="text-gray-900 dark:text-white font-semibold">{hasil.benar} / {hasil.total}</span>
            </div>
          </div>

          <div>
            <Link
              to={fromCourse ? `/courses/${fromCourse}` : '/tasks'}
              className="inline-flex justify-center items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              {fromCourse ? 'Kembali ke Kursus' : 'Kembali ke Daftar Kuis'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to={fromCourse ? `/courses/${fromCourse}` : '/tasks'}
        className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        {fromCourse ? 'Kembali ke Kursus' : 'Kembali'}
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{kuis.judul_kuis}</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
          timeLeft < 300
            ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 animate-pulse'
            : 'bg-gray-100 dark:bg-white/8 text-gray-800 dark:text-gray-200'
        }`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigasi Soal */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-white/8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Navigasi Soal</h3>
            <div className="grid grid-cols-4 gap-2">
              {pertanyaan.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    currentQuestion === index
                      ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2 dark:ring-offset-[#161b27]'
                      : answers[index]
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/8 hover:bg-gray-100 dark:hover:bg-white/8'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/8">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Mengumpulkan...' : 'Kumpulkan Kuis'}
              </button>
            </div>
          </div>
        </div>

        {/* Soal */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-white/8 min-h-[400px] flex flex-col">
            <div className="mb-6">
              <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full">
                Soal {currentQuestion + 1} dari {pertanyaan.length}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
              {pertanyaan[currentQuestion]?.pertanyaan}
            </h2>

            <div className="flex-1 space-y-3">
              {pertanyaan[currentQuestion]?.pilihan.map((pilihan) => (
                <label
                  key={pilihan.id_pilihan}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    answers[currentQuestion] === pilihan.id_pilihan
                      ? 'border-red-500 bg-red-50 dark:bg-red-500/10 ring-1 ring-red-500'
                      : 'border-gray-200 dark:border-white/8 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === pilihan.id_pilihan}
                    onChange={() => handleAnswer(pilihan.id_pilihan)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-600"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                    {pilihan.teks_jawaban}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/8">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              {currentQuestion < pertanyaan.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-white/8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Kumpulkan Kuis?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {Object.keys(answers).length} dari {pertanyaan.length} soal dijawab.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Setelah dikumpulkan, jawaban tidak bisa diubah.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit(); }}
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}