import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api/api';
import { CoursesSkeleton } from '../../components/ui/Skeleton';

interface Kursus {
  id_kursus: number;
  judul_kursus: string;
  deskripsi: string;
  nama_trainer: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Kursus[]>([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') ?? '';

  useEffect(() => {
    API.get('/user/kursus')
      .then(res => setCourses(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.judul_kursus.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <CoursesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Kursus</h1>
          {search && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Hasil pencarian: <span className="font-semibold text-red-600 dark:text-red-400">"{search}"</span>
            </p>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          {search ? `Tidak ada kursus yang cocok dengan "${search}".` : 'Tidak ada kursus ditemukan.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course.id_kursus}
              to={`/courses/${course.id_kursus}`}
              className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden"
            >
              <div className="h-32 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-300 dark:text-gray-600" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {course.judul_kursus}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.deskripsi}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">Trainer: {course.nama_trainer ?? '-'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}