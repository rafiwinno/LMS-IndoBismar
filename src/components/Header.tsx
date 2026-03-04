import { Menu, Bell, Search, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all w-64">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari materi, tugas..." 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
            BW
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-700 leading-tight">Budi Wibowo</p>
            <p className="text-xs text-slate-500">Peserta PKL</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
