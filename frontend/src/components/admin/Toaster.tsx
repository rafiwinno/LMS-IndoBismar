import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { toast } from '../../lib/toast';

interface ToastItem { id: number; msg: string; type: 'success' | 'error' | 'info'; }

const STYLES = {
  success: { bg: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-500', text: 'text-green-800' },
  error:   { bg: 'bg-red-50 border-red-200',     icon: XCircle,     iconColor: 'text-red-500',   text: 'text-red-800' },
  info:    { bg: 'bg-blue-50 border-blue-200',   icon: Info,        iconColor: 'text-blue-500',  text: 'text-blue-800' },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    toast._subscribe((msg, type) => {
      const id = Date.now();
      setItems(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3500);
    });
    return () => toast._unsubscribe();
  }, []);

  const remove = (id: number) => setItems(prev => prev.filter(t => t.id !== id));

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {items.map(item => {
        const s = STYLES[item.type];
        const Icon = s.icon;
        return (
          <div key={item.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md ${s.bg} animate-in slide-in-from-right`}>
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${s.text}`}>{item.msg}</p>
            <button onClick={() => remove(item.id)} className={`flex-shrink-0 ${s.iconColor} hover:opacity-70`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
