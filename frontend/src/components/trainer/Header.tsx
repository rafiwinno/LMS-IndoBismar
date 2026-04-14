import { Menu, Bell, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getUser } from '../../pages/types';
import api from '../../api/axiosInstance';

const pageTitles: Record<string, string> = {
  '/trainer/dashboard':   'Dashboard',
  '/trainer/courses':     'Courses',
  '/trainer/assignments': 'Tugas & Kuis',
  '/trainer/progress':    'Progres Peserta',
  '/trainer/feedback':    'Feedback',
};

interface Notif {
  id: number;
  dari: string;
  judul: string;
  kursus: string;
  waktu: string;
}

const LS_KEY = 'trainer_notif_last_read';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return 'Baru saja';
  if (diff < 3600)  return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export default function TrainerHeader({ onMenuClick }: HeaderProps) {
  const user = getUser();
  const { pathname } = useLocation();
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [open, setOpen]           = useState(false);
  const [unread, setUnread]       = useState(0);
  const [notifError, setNotifError] = useState(false);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  const initials = user?.nama
    ? user.nama.split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'TR';

  const title =
    pageTitles[pathname] ??
    (pathname.includes('/materials') ? 'Materi Course' : 'Trainer Panel');

  useEffect(() => {
    api.get('/trainer/notifications')
      .then((res) => {
        const data: Notif[] = res.data.data ?? [];
        setNotifs(data);
        const lastRead = localStorage.getItem(LS_KEY);
        if (!lastRead) {
          setUnread(data.length);
        } else {
          const count = data.filter(
            (n) => new Date(n.waktu).getTime() > new Date(lastRead).getTime()
          ).length;
          setUnread(count);
        }
      })
      .catch(() => { setNotifError(true); });
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      localStorage.setItem(LS_KEY, new Date().toISOString());
      setUnread(0);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-white/8 flex items-center justify-between px-5 sticky top-0 z-10 transition-colors duration-200 shrink-0">

      {/* Left */}
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

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleOpen}
            className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-[#0f1117]" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi</p>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={15} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifError ? (
                  <p className="text-sm text-red-400 text-center py-8">
                    Gagal memuat notifikasi
                  </p>
                ) : notifs.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    Belum ada notifikasi
                  </p>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        <span className="font-semibold">{n.dari}</span> mengumpulkan tugas{' '}
                        <span className="font-semibold">{n.judul}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.kursus} · {timeAgo(n.waktu)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
