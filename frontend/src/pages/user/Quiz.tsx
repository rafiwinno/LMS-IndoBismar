import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle, ChevronLeft } from 'lucide-react';
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
  const [kuis, setKuis] = useState<KuisDetail | null>(null);
  const [pertanyaan, setPertanyaan] = useState<Pertanyaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasil, setHasil] = useState<{ nilai: number; benar: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    API.get(`/user/kuis/${id}`)
      .then(res => {
        setKuis(res.data.kuis);
        setPertanyaan(res.data.pertanyaan);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Cek apakah kuis sudah dikerjakan
    API.get('/user/kuis')
      .then(res => {
        const kuisList = res.data.data;
        const thisKuis = kuisList.find((k: any) => k.id_kuis === Number(id));
        if (thisKuis?.status_attempt === 'sudah') {
          navigate('/tasks');
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
        navigate('/tasks');
      } else {
        alert(msg || 'Gagal mengumpulkan kuis.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center text-slate-500 py-12">Memuat kuis...</div>;
  if (!kuis) return <div className="text-center text-slate-500 py-12">Kuis tidak ditemukan.</div>;

  if (isSubmitted && hasil) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Kuis Berhasil Dikumpulkan!</h2>
          <p className="text-slate-600 mb-8">Terima kasih telah mengerjakan {kuis.judul_kuis}.</p>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 inline-block text-left">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-slate-500 font-medium w-32">Nilai:</span>
              <span className="text-3xl font-bold text-emerald-600">{hasil.nilai}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-medium w-32">Jawaban Benar:</span>
              <span className="text-slate-900 font-semibold">{hasil.benar} / {hasil.total}</span>
            </div>
          </div>

          <div>
            <Link
              to="/tasks"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Kuis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/tasks" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Kembali
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">{kuis.judul_kuis}</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
          timeLeft < 300 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-800'
        }`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigasi Soal */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Navigasi Soal</h3>
            <div className="grid grid-cols-4 gap-2">
              {pertanyaan.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    currentQuestion === index
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                      : answers[index]
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Mengumpulkan...' : 'Kumpulkan Kuis'}
              </button>
            </div>
          </div>
        </div>

        {/* Soal */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
            <div className="mb-6">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Soal {currentQuestion + 1} dari {pertanyaan.length}
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-8 leading-relaxed">
              {pertanyaan[currentQuestion]?.pertanyaan}
            </h2>

            <div className="flex-1 space-y-3">
              {pertanyaan[currentQuestion]?.pilihan.map((pilihan) => (
                <label
                  key={pilihan.id_pilihan}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    answers[currentQuestion] === pilihan.id_pilihan
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === pilihan.id_pilihan}
                    onChange={() => handleAnswer(pilihan.id_pilihan)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                  />
                  <span className="ml-3 text-slate-700 font-medium">{pilihan.teks_jawaban}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              {currentQuestion < pertanyaan.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
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
    </div>
  );
}