import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  Users, MessageSquare, X, LogOut, Sun, Moon,
} from 'lucide-react';
import { logout } from '../../pages/types';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo-bismar.png';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const navItems = [
  { name: 'Dashboard',       path: '/trainer/dashboard',   icon: LayoutDashboard },
  { name: 'Courses',         path: '/trainer/courses',     icon: BookOpen },
  { name: 'Tugas & Kuis',    path: '/trainer/assignments', icon: ClipboardList },
  { name: 'Progres Peserta', path: '/trainer/progress',    icon: Users },
  { name: 'Feedback',        path: '/trainer/feedback',    icon: MessageSquare },
];

export default function TrainerSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          'bg-[#0d0f14]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-17.5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3.5">
            <img src={logoImg} alt="Indo Bismar" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Indo Bismar</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Learning Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-6 mb-3">
            Menu Utama
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3.5 py-3 pr-5 text-sm font-semibold transition-all duration-150 group border-l-[3px]',
                  isActive
                    ? 'border-red-500 text-red-400 bg-red-500/8 pl-5.25'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5 pl-5.25',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={19}
                    className={isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-300'}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-5 pt-3 space-y-1 border-t border-white/8 shrink-0">
          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/6 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3.5">
              {theme === 'dark'
                ? <Sun size={19} className="text-gray-500" />
                : <Moon size={19} className="text-gray-500" />
              }
              <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${theme === 'dark' ? 'bg-red-600' : 'bg-gray-600'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${theme === 'dark' ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={19} className="text-gray-500" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
