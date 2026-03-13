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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button onClick={handleOpen}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700">Notifikasi</h4>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notif.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">Tidak ada notifikasi</p>
                ) : (
                  notif.map(n => (
                    <button key={n.id_notif} onClick={() => markRead(n.id_notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${!n.dibaca ? 'bg-indigo-50/50' : ''}`}>
                      <div className="mt-0.5 flex-shrink-0">
                        {TIPE_ICON[n.tipe] ?? <Bell className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!n.dibaca ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                          {n.judul}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.pesan}</p>
                        {n.dibuat_pada && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(n.dibuat_pada).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                      {!n.dibaca && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
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
