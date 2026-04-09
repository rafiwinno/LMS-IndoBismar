import {
  LayoutDashboard, Users, BookOpen,
  UserSquare2, ClipboardList,
  BarChart3, X, LogOut, Sun, Moon,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  user?: any;
}

// id_role: 1=superadmin, 2=admin, 3=trainer
const ADMIN_MENU_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roleIds: [2, 3] },
  { id: 'participants', label: 'Peserta',       icon: Users,           roleIds: [2] },
  { id: 'courses',      label: 'Course',        icon: BookOpen,        roleIds: [2, 3] },
  { id: 'exams',        label: 'Tugas & Kuis',  icon: ClipboardList,   roleIds: [2, 3] },
  { id: 'trainers',     label: 'Trainer',       icon: UserSquare2,     roleIds: [2] },
  { id: 'reports',      label: 'Laporan',       icon: BarChart3,       roleIds: [2] },
];

const SUPERADMIN_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'users',     label: 'Pengguna',    icon: Users },
  { id: 'branches',  label: 'Cabang',      icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, user }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const idRole = user?.id_role ?? null;
  const menuItems = idRole === 1
    ? SUPERADMIN_MENU_ITEMS
    : ADMIN_MENU_ITEMS.filter(item => item.roleIds.includes(idRole ?? 2));

  const initials = user?.nama
    ? user.nama.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AD';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 dark:bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        "bg-white dark:bg-[#0d0f14] border-r border-gray-200 dark:border-white/8",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo-bismar.png" alt="Indo Bismar" className="w-10 h-10 object-contain shrink-0" />
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-sm leading-tight">Indo Bismar</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">Learning Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-6 mb-3">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3.5 py-3 pr-5 text-sm font-semibold transition-all duration-150 group border-l-[3px]",
                  isActive
                    ? "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/8 pl-5"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 pl-5"
                )}
              >
                <Icon
                  size={19}
                  className={isActive
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 pb-5 pt-3 space-y-1 border-t border-gray-200 dark:border-white/8 shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-gray-100 dark:bg-white/5">
              <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.nama}</p>
                <p className="text-[11px] text-gray-500 capitalize">{user.role || 'Admin'}</p>
              </div>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/6 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3.5">
              {theme === 'dark'
                ? <Sun size={19} className="text-gray-400 dark:text-gray-500" />
                : <Moon size={19} className="text-gray-400 dark:text-gray-500" />
              }
              <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${theme === 'dark' ? 'bg-red-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${theme === 'dark' ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={19} className="text-gray-400 dark:text-gray-500" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
