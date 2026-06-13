import { useEffect, useState } from 'react';
import { MessageSquare, BookOpen, ThumbsUp, ThumbsDown, Minus, Loader2, Inbox } from 'lucide-react';
import API from '../../api/api';

interface FeedbackItem {
  id: number;
  pesan: string;
  tipe: 'positif' | 'negatif' | 'netral';
  dibuat_pada: string;
  trainer: string | null;
  kursus: string | null;
}

function TipeBadge({ tipe }: { tipe: FeedbackItem['tipe'] }) {
  if (tipe === 'positif') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <ThumbsUp size={11} /> Positif
    </span>
  );
  if (tipe === 'negatif') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <ThumbsDown size={11} /> Negatif
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">
      <Minus size={11} /> Netral
    </span>
  );
}

export default function UserFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'semua' | 'positif' | 'negatif' | 'netral'>('semua');

  useEffect(() => {
    API.get('/user/feedback')
      .then(res => setFeedbacks(res.data.data ?? []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'semua' ? feedbacks : feedbacks.filter(f => f.tipe === filter);

  const counts = {
    positif: feedbacks.filter(f => f.tipe === 'positif').length,
    negatif: feedbacks.filter(f => f.tipe === 'negatif').length,
    netral:  feedbacks.filter(f => f.tipe === 'netral').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Saya</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Catatan dan feedback dari trainer</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Positif', count: counts.positif, color: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: ThumbsUp },
          { label: 'Negatif', count: counts.negatif, color: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-700 dark:text-red-400',   icon: ThumbsDown },
          { label: 'Netral',  count: counts.netral,  color: 'bg-gray-100 dark:bg-white/8',      text: 'text-gray-600 dark:text-gray-400', icon: Minus },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <s.icon size={20} className={`${s.text} mx-auto mb-1`} />
            <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
            <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['semua', 'positif', 'negatif', 'netral'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === t
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/20'
            }`}
          >
            {t === 'semua' ? `Semua (${feedbacks.length})` : t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/6 flex items-center justify-center mb-4">
            <Inbox size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada feedback</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filter === 'semua' ? 'Trainer belum memberikan feedback untukmu.' : `Tidak ada feedback ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-white/10 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {f.trainer ?? 'Trainer'}
                    </p>
                    {f.kursus && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <BookOpen size={11} className="text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{f.kursus}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <TipeBadge tipe={f.tipe} />
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(f.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {f.pesan}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
