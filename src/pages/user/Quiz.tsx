import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft } from 'lucide-react';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock quiz data
  const quiz = {
    title: 'Kuis 1: HTML & CSS Dasar',
    course: 'Dasar Pemrograman Web',
    duration: 30, // minutes
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'Tag HTML mana yang digunakan untuk membuat paragraf?',
        options: ['<p>', '<h1>', '<br>', '<div>'],
        correctAnswer: '<p>'
      },
      {
        id: 2,
        type: 'multiple_choice',
        question: 'Apa kepanjangan dari CSS?',
        options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
        correctAnswer: 'Cascading Style Sheets'
      },
      {
        id: 3,
        type: 'essay',
        question: 'Jelaskan perbedaan antara margin dan padding dalam CSS!',
        correctAnswer: ''
      }
    ]
  };

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Kuis Berhasil Dikumpulkan!</h2>
          <p className="text-slate-600 mb-8">Terima kasih telah mengerjakan {quiz.title}. Hasil Anda telah tersimpan.</p>
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 inline-block text-left">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-slate-500 font-medium w-32">Skor Sementara:</span>
              <span className="text-2xl font-bold text-slate-900">80/100</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-medium w-32">Waktu Selesai:</span>
              <span className="text-slate-900 font-semibold">{formatTime(1800 - timeLeft)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">*Menunggu penilaian soal esai oleh trainer</p>
          </div>

          <div>
            <Link 
              to="/tasks"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Tugas
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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-20 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-slate-500 text-sm">{quiz.course}</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
          timeLeft < 300 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-800'
        }`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Navigasi Soal</h3>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
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
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div> Sudah Dijawab
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></div> Belum Dijawab
              </div>
              
              <button 
                onClick={handleSubmit}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Kumpulkan Kuis
              </button>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Soal {currentQuestion + 1} dari {quiz.questions.length}
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {quiz.questions[currentQuestion].type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
              </span>
            </div>
            
            <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-8 leading-relaxed">
              {quiz.questions[currentQuestion].question}
            </h2>

            <div className="flex-1">
              {quiz.questions[currentQuestion].type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {quiz.questions[currentQuestion].options?.map((option, index) => (
                    <label 
                      key={index} 
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        answers[currentQuestion] === option 
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${currentQuestion}`} 
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={() => handleAnswer(option)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                      />
                      <span className="ml-3 text-slate-700 font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={8}
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-700 resize-none"
                ></textarea>
              )}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              
              {currentQuestion < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2"
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
