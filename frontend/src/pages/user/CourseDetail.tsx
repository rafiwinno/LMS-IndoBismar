import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, Circle, ChevronLeft } from 'lucide-react';
import API from '../../api/api';

interface Materi {
  id_materi: number;
  judul_materi: string;
  tipe: string;
  url: string;
  status_progress: string;
}

interface Kursus {
  id_kursus: number;
  judul_kursus: string;
  deskripsi: string;
}

export default function CourseDetail() {
  const { id } = useParams();
  const [kursus, setKursus] = useState<Kursus | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/user/kursus/${id}`)
      .then(res => {
        setKursus(res.data.kursus);
        setMateri(res.data.materi);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400 py-12">Memuat detail kursus...</div>;
  if (!kursus) return <div className="text-center text-gray-500 dark:text-gray-400 py-12">Kursus tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Kembali ke Daftar Kursus
      </Link>

      {/* Course Header */}
      <div className="bg-white dark:bg-[#161b27] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-white/8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{kursus.judul_kursus}</h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{kursus.deskripsi}</p>
      </div>

      {/* Materi */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Materi Pembelajaran</h2>

        {materi.length === 0 ? (
          <div className="bg-white dark:bg-[#161b27] rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-white/8 text-center text-gray-500 dark:text-gray-400">
            Belum ada materi untuk kursus ini.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-white/8">
              {materi.map((item, index) => (
                <li key={item.id_materi} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-start gap-4">
                  <div className="mt-1">
                    {item.status_progress === 'selesai' ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : (
                      <Circle className="text-gray-300 dark:text-gray-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Modul {index + 1}</span>
                      {item.tipe === 'video' ? (
                        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded gap-1">
                          <PlayCircle size={12} /> Video
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded gap-1">
                          <FileText size={12} /> PDF
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">{item.judul_materi}</h3>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      {item.tipe === 'video' ? 'Tonton' : 'Buka'}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}