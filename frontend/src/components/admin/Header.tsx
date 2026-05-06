import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, CheckCheck, Clock, UserCheck, UserX, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from '../../lib/toast';

interface HeaderProps {
  onMenuClick: () => void;
  user?: any;
}

const TIPE_ICON: Record<string, JSX.Element> = {
  registrasi_baru:   <Clock className="w-4 h-4 text-amber-500" />,
  dokumen_menunggu:  <FileText className="w-4 h-4 text-blue-500" />,
  dokumen_disetujui: <UserCheck className="w-4 h-4 text-green-500" />,
  dokumen_ditolak:   <UserX className="w-4 h-4 text-red-500" />,
};

export default function Header({ onMenuClick, user }: HeaderProps) {
  const [notif, setNotif] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevUnread = useRef<number | null>(null);

  const initials = user?.nama
    ? user.nama.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  const fetchNotif = async () => {
    try {
      const res = await api.getNotifikasi();
      const newData: any[] = res.data ?? [];
      const newUnread: number = res.unread ?? 0;

      if (prevUnread.current === null) {
        // Load pertama: tampilkan popup jika ada unread
        if (newUnread > 0) {
          const newest = newData.find(n => !n.dibaca);
          if (newest) {
            toast.info(`🔔 ${newest.judul}: ${newest.pesan}`);
          }
        }
      } else if (newUnread > prevUnread.current) {
        // Ada notif baru masuk saat halaman sudah terbuka
        const diff = newUnread - prevUnread.current;
        const newest = newData.find(n => !n.dibaca);
        if (newest) {
          toast.info(`🔔 ${newest.judul}: ${newest.pesan}`);
        } else {
          toast.info(`🔔 Ada ${diff} notifikasi baru`);
        }
      }
      prevUnread.current = newUnread;

      setNotif(newData);
      setUnread(newUnread);
    } catch { /* silent */ }
  };

  useEffect(() => {
    let isMounted = true;
    let isLoading = false;

    const safeFetch = async () => {
      if (isLoading || !isMounted) return;
      isLoading = true;
      try { await fetchNotif(); } catch { /* silent */ }
      finally { isLoading = false; }
    };

    safeFetch();
    const interval = setInterval(() => {
      if (!document.hidden) safeFetch();
    }, 30_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
  };

  const markAllRead = async () => {
    try {
      await api.bacaSemuaNotifikasi();
      setUnread(0);
      setNotif(prev => prev.map(n => ({ ...n, dibaca: true })));
    } catch { /* silent */ }
  };

  const markRead = async (id: number) => {
    try {
      await api.bacaNotifikasi(id);
      setUnread(prev => Math.max(0, prev - 1));
      setNotif(prev => prev.map(n => n.id_notif === id ? { ...n, dibaca: true } : n));
    } catch { /* silent */ }
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f1117] border-b border-gray-200 dark:border-white/8 flex items-center justify-between px-5 sticky top-0 z-10 transition-colors duration-200 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button onClick={handleOpen}
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 rounded-xl transition-colors">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-white">Notifikasi</h4>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                {notif.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">Tidak ada notifikasi</p>
                ) : (
                  notif.map(n => (
                    <button key={n.id_notif} onClick={() => markRead(n.id_notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-3 ${!n.dibaca ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                      <div className="mt-0.5 flex-shrink-0">
                        {TIPE_ICON[n.tipe] ?? <Bell className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!n.dibaca ? 'font-semibold text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {n.judul}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.pesan}</p>
                        {n.dibuat_pada && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(n.dibuat_pada).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                      {!n.dibaca && <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{user?.nama || 'Admin'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
