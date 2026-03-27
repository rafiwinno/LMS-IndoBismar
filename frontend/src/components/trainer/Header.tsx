import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getUser } from '../../pages/types';

const pageTitles: Record<string, string> = {
  '/trainer/dashboard':   'Dashboard',
  '/trainer/courses':     'Courses',
  '/trainer/assignments': 'Tugas & Kuis',
  '/trainer/progress':    'Progres Peserta',
  '/trainer/feedback':    'Feedback',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function TrainerHeader({ onMenuClick }: HeaderProps) {
  const user = getUser();
  const { pathname } = useLocation();

  const initials = user?.nama
    ? user.nama.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'TR';

  // match juga path dengan param seperti /trainer/courses/:id/materials
  const title =
    pageTitles[pathname] ??
    (pathname.includes('/materials') ? 'Materi Course' : 'Trainer Panel');

  return (
    <header className="h-16 bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-white/8 flex items-center justify-between px-5 sticky top-0 z-10 transition-colors duration-200 shrink-0">

      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-[#0f1117]" />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {initials}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-[13px] font-semibold text-gray-800 dark:text-white">
              {user?.nama ?? 'Trainer'}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">Trainer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
