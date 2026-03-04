import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Award, 
  User,
  X,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Tugas & Kuis', path: '/tasks', icon: CheckSquare },
    { name: 'Nilai & Progres', path: '/grades', icon: Award },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              IB
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LMS Indo Bismar</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? "text-blue-400" : "text-slate-400"} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm hover:bg-slate-800/50 hover:text-white text-slate-400"
          >
            <LogOut size={20} />
            Keluar
          </NavLink>
        </div>
      </aside>
    </>
  );
}
