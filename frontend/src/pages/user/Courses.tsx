import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/api';

interface Kursus {
  id_kursus: number;
  judul_kursus: string;
  deskripsi: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Kursus[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/user/kursus')
      .then(res => setCourses(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.judul_kursus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Daftar Kursus</h1>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
            placeholder="Cari kursus..."
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Memuat kursus...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-12">Tidak ada kursus ditemukan.</div>
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}