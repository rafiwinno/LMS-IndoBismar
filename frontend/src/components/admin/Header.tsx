import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  user?: any;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const initials = user?.nama
    ? user.nama.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>
      <div className="flex items-center gap-3">
<div className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.nama || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
