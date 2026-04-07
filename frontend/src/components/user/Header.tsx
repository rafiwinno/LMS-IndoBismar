import { Menu, Bell, Search, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-white/8 flex items-center justify-between px-5 sticky top-0 z-10 transition-colors duration-200 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-500 dark:text-gray-400 focus-within:ring-2 focus-within:ring-red-500 focus-within:bg-white dark:focus-within:bg-[#161b22] transition-all w-64">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari materi, tugas..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 rounded-xl relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1117]"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
        <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center font-bold text-sm">
            BW
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">Budi Wibowo</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Peserta PKL</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
