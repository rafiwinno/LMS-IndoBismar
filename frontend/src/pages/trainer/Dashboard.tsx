import { useEffect, useState } from 'react';
import { BookOpen, FileText, Globe, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses } from '../../api/courseApi';
import { getUser } from '../types';
import { Course } from '../../pages/types/trainer';

export default function TrainerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setPageError('Gagal memuat data course. Coba refresh halaman.'))
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.status === 'publish').length;
  const draft = courses.filter((c) => c.status === 'draft').length;

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user?.nama ?? 'Trainer'}
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            PT Indo Bismar &middot; Trainer
          </p>
        </div>
        <button
          onClick={() => navigate('/trainer/courses')}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Buat Course
        </button>
      </div>

      {pageError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={15} className="shrink-0" />
          {pageError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-xl p-5 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/8 shrink-0" />
              <div className="space-y-2">
                <div className="h-7 w-10 bg-gray-200 dark:bg-white/8 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : (
          [
            { label: 'Total Course', value: courses.length, icon: BookOpen,  color: 'text-red-500',     bg: 'bg-red-500/10 dark:bg-red-500/10' },
            { label: 'Published',    value: published,      icon: Globe,     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Draft',        value: draft,          icon: FileText,  color: 'text-amber-500',   bg: 'bg-amber-500/10' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course list */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/8 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/6">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Course Saya</h3>
          <Link
            to="/trainer/courses"
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-500 font-medium transition-colors"
          >
            Kelola semua <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 dark:border-white/6 rounded-lg p-4 animate-pulse space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-white/8 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-full" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/6 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada course</p>
            <button
              onClick={() => navigate('/trainer/courses')}
              className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Buat Course
            </button>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c: Course) => (
              <div
                key={c.id_kursus}
                className="border border-gray-100 dark:border-white/6 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.status === 'publish' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className={`text-xs font-medium ${c.status === 'publish' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {c.status === 'publish' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 mb-1">
                  {c.judul_kursus}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1 mb-4">
                  {c.deskripsi || '—'}
                </p>
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-white/6">
                  <Link
                    to={`/trainer/courses/${c.id_kursus}/materials`}
                    className="flex-1 text-center text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-1.5 rounded-md transition-colors"
                  >
                    Materi
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
