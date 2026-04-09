import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getUser } from '../../pages/types';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/courses':   'Courses',
  '/tasks':     'Kuis',
  '/grades':    'Nilai & Progres',
  '/documents': 'Dokumen Saya',
  '/profile':   'Profil Saya',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState(getUser());
  const { pathname } = useLocation();

  const title =
    pageTitles[pathname] ??
    (pathname.includes('/courses/') ? 'Detail Kursus' :
     pathname.includes('/tasks/quiz/') ? 'Kerjakan Kuis' : 'LMS Indo Bismar');

  const initials = user?.nama
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  useEffect(() => {
    const handleStorage = () => setUser(getUser());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('lms_user_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lms_user_updated', handleStorage);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-white/8 flex items-center justify-between px-5 sticky top-0 z-10 transition-colors duration-200">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />
        <Link to="/profile" className="flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-white/8 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs select-none">
            {initials}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-[13px] font-semibold text-gray-800 dark:text-white">{user?.nama ?? 'Peserta'}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">Peserta PKL</p>
          </div>
        </Link>
      </div>
    </header>
  );
}