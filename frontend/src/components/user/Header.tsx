import { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getUser } from '../../pages/types';
import API from '../../api/api';

interface Notif {
  id_notifikasi: number;
  judul: string;
  pesan: string;
  dibaca: number;
  dibuat_pada: string;
}

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
  const [notifList, setNotifList] = useState<Notif[]>([]);
  const [belumDibaca, setBelumDibaca] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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

  const fetchNotif = () => {
    API.get('/user/notifikasi')
      .then(res => {
        setNotifList(res.data.data ?? []);
        setBelumDibaca(res.data.belum_dibaca ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBacaSemua = () => {
    API.patch('/user/notifikasi/baca-semua').then(fetchNotif).catch(() => {});
  };

  const handleBaca = (id: number) => {
    API.patch(`/user/notifikasi/${id}/baca`).then(fetchNotif).catch(() => {});
  };

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
        {/* Notifikasi Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(v => !v)}
            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
          >
            <Bell size={20} />
            {belumDibaca > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {belumDibaca > 9 ? '9+' : belumDibaca}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161b27] rounded-2xl shadow-xl border border-gray-200 dark:border-white/8 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifikasi</span>
                {belumDibaca > 0 && (
                  <button onClick={handleBacaSemua} className="text-xs text-red-500 hover:underline">
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/8">
                {notifList.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">Tidak ada notifikasi.</p>
                ) : notifList.map(n => (
                  <div
                    key={n.id_notifikasi}
                    onClick={() => handleBaca(n.id_notifikasi)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                      n.dibaca === 0 ? 'bg-red-50 dark:bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.dibaca === 0 && (
                        <span className="mt-1.5 w-2 h-2 bg-red-500 rounded-full shrink-0" />
                      )}
                      <div className={n.dibaca === 0 ? '' : 'pl-4'}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.judul}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.pesan}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          {new Date(n.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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