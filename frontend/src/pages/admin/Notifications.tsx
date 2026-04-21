import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, FileText, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../lib/toast';

interface Notif {
  id_notif: number;
  judul: string;
  pesan: string;
  tipe: string;
  id_referensi: number | null;
  dibaca: boolean;
  dibuat_pada: string;
}

function tipeIcon(tipe: string) {
  switch (tipe) {
    case 'dokumen_menunggu': return <FileText size={16} className="text-yellow-500" />;
    case 'nilai':            return <CheckCheck size={16} className="text-green-500" />;
    default:                 return <AlertCircle size={16} className="text-blue-500" />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export function Notifications() {
  const toast = useToast();
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const [unread, setUnread]     = useState(0);
  const [loading, setLoading]   = useState(true);
  const [marking, setMarking]   = useState(false);

  const load = () => {
    setLoading(true);
    api.getNotifikasi()
      .then(res => {
        setNotifs(res.data ?? []);
        setUnread(res.unread ?? 0);
      })
      .catch(() => toast.error('Gagal memuat notifikasi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markOne = async (id: number) => {
    const n = notifs.find(x => x.id_notif === id);
    if (!n || n.dibaca) return;
    await api.bacaNotifikasi(id).catch(() => {});
    setNotifs(prev => prev.map(x => x.id_notif === id ? { ...x, dibaca: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAll = async () => {
    if (unread === 0) return;
    setMarking(true);
    await api.bacaSemuaNotifikasi().catch(() => {});
    setNotifs(prev => prev.map(x => ({ ...x, dibaca: true })));
    setUnread(0);
    setMarking(false);
    toast.success('Semua notifikasi ditandai dibaca');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unread > 0 ? `${unread} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            disabled={marking}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {marking ? 'Memproses...' : 'Tandai Semua Dibaca'}
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifs.map(n => (
            <button
              key={n.id_notif}
              onClick={() => markOne(n.id_notif)}
              className={[
                'w-full text-left px-5 py-4 flex items-start gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/4',
                !n.dibaca ? 'bg-red-50/60 dark:bg-red-500/5' : '',
              ].join(' ')}
            >
              {/* Icon */}
              <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/8 shrink-0">
                {tipeIcon(n.tipe)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold truncate ${!n.dibaca ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {n.judul}
                  </p>
                  {!n.dibaca && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.pesan}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                  <Clock size={12} />
                  {timeAgo(n.dibuat_pada)}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
