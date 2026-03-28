import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, CheckSquare,
  Award, User, FolderOpen, X, LogOut,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDarkMode } from '../../hooks/useDarkMode';
import { getUser } from '../../pages/types';
import api from '../../api/api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses',   path: '/courses',   icon: BookOpen },
  { name: 'Kuis',      path: '/tasks',     icon: CheckSquare },
  { name: 'Nilai',     path: '/grades',    icon: Award },
  { name: 'Dokumen',   path: '/documents', icon: FolderOpen },
  { name: 'Profil',    path: '/profile',   icon: User },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const user = getUser();

  const initials = user?.nama
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col',
        'bg-white dark:bg-[#0f1117]',
        'border-r border-gray-200 dark:border-white/8',
        'transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo gambar */}
            <img
              src="/src/assets/logo-bismar.png"
              alt="Logo Indo Bismar"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            {/* Teks nama + subtitle */}
            <div className="leading-tight">
              <p className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight">
                Indo Bismar
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                Learning Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/8 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
            Menu Utama
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-red-500 dark:text-red-400' : ''} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-white/8 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 dark:text-white truncate">
                {user?.nama ?? 'Peserta'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Peserta PKL</p>
            </div>
          </div>

          {/* Dark mode toggle switch */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
          >
            <span>{dark ? 'Dark Mode' : 'Light Mode'}</span>
            {/* Toggle switch */}
            <div className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              dark ? 'bg-red-500' : 'bg-gray-300'
            )}>
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                dark ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}