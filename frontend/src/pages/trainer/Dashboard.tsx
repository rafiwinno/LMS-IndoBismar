import { useEffect, useState } from 'react';
import { BookOpen, FileText, ClipboardList, Globe, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses } from '../../api/courseApi';
import { getUser } from '../types';

export default function TrainerDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === 'publish').length;
  const draft     = courses.filter((c) => c.status === 'draft').length;

  const stats = [
    {
      label: 'Total Course',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Published',
      value: published,
      icon: Globe,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-100',
    },
    {
      label: 'Draft',
      value: draft,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat datang, {user?.nama ?? 'Trainer'} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola course dan materi pelatihan Anda dari sini.
          </p>
        </div>
        <button
          onClick={() => navigate('/trainer/courses')}
          className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Buat Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-xl border ${s.border} p-5 flex items-center gap-4`}
          >
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Course Saya</h2>
          <Link
            to="/trainer/courses"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Kelola semua →
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Belum ada course</p>
            <p className="text-slate-400 text-sm mt-1">Mulai buat course pertama Anda</p>
            <button
              onClick={() => navigate('/trainer/courses')}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Buat Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c: any) => (
              <div
                key={c.id_kursus}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    c.status === 'publish'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.status === 'publish' ? '● Published' : '● Draft'}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                  {c.judul_kursus}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {c.deskripsi || 'Tidak ada deskripsi.'}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Link
                    to={`/trainer/courses/${c.id_kursus}/materials`}
                    className="flex-1 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                  >
                    Materi
                  </Link>
                  <Link
                    to="/trainer/courses"
                    className="flex-1 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 py-2 rounded-lg transition-colors"
                  >
                    Kelola
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}