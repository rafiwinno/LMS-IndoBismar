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

  // Baca search dari URL (diketik di header search bar)
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

  // ✅ Skeleton saat loading
  if (loading) return <CoursesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Kursus</h1>
          {search && (
            <p className="text-slate-500 text-sm mt-1">
              Hasil pencarian: <span className="font-semibold text-blue-600">"{search}"</span>
            </p>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          {search ? `Tidak ada kursus yang cocok dengan "${search}".` : 'Tidak ada kursus ditemukan.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course.id_kursus}
              to={`/courses/${course.id_kursus}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden"
            >
              <div className="h-32 bg-slate-100 flex items-center justify-center">
                <BookOpen size={48} className="text-slate-300" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.judul_kursus}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{course.deskripsi}</p>
                <p className="text-xs text-slate-400 mt-auto">Trainer: {course.nama_trainer ?? '-'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}