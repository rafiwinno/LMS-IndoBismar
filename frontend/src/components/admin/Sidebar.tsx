import {
  LayoutDashboard, Users, BookOpen, FileText,
  GraduationCap, UserSquare2,
  BarChart3, X, LogOut,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
const ALL_MENU_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roleIds: [1, 2, 3] },
  { id: 'participants', label: 'Participants',  icon: Users,           roleIds: [1, 2] },
  { id: 'courses',      label: 'Courses',       icon: BookOpen,        roleIds: [1, 2, 3] },
  { id: 'materials',    label: 'Materials',     icon: FileText,        roleIds: [1, 2, 3] },
  { id: 'exams',        label: 'Exams',         icon: GraduationCap,   roleIds: [1, 2, 3] },
  { id: 'trainers',     label: 'Trainers',      icon: UserSquare2,     roleIds: [1, 2] },
  { id: 'reports',      label: 'Reports',       icon: BarChart3,       roleIds: [1, 2] },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, user }: SidebarProps) {
  const idRole = user?.id_role ?? null;
  const menuItems = idRole ? ALL_MENU_ITEMS.filter(item => item.roleIds.includes(idRole)) : ALL_MENU_ITEMS;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">IB</div>
            <span className="text-lg font-bold text-white tracking-tight">LMS Indo Bismar</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                  isActive ? "bg-blue-600/10 text-blue-400" : "hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Icon size={20} className={isActive ? "text-blue-400" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-3 py-1 mb-2">
            <p className="text-xs text-slate-500">Login sebagai</p>
            <p className="text-sm font-semibold text-white">{user?.nama || 'Admin'}</p>
            <p className="text-xs text-slate-400">{user?.role || 'Administrator'}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm hover:bg-red-500/10 hover:text-red-400 text-slate-400"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
