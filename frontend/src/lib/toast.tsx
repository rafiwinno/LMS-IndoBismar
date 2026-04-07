import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global singleton — untuk backward compat (Trainers.tsx, dll)
type Listener = (msg: string, type: 'success' | 'error' | 'info') => void;
let _listener: Listener | null = null;
export const toast = {
  success: (msg: string) => _listener?.(msg, 'success'),
  error:   (msg: string) => _listener?.(msg, 'error'),
  info:    (msg: string) => _listener?.(msg, 'info'),
  _subscribe:   (fn: Listener) => { _listener = fn; },
  _unsubscribe: () => { _listener = null; },
};

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info:    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const STYLES = {
  success: 'border-green-200 bg-white',
  error:   'border-red-200 bg-white',
  warning: 'border-amber-200 bg-white',
  info:    'border-blue-200 bg-white',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  // Bridge singleton → context
  React.useEffect(() => {
    toast._subscribe((msg, type) => add(msg, type));
    return () => toast._unsubscribe();
  }, [add]);

  const ctx: ToastContextValue = {
    toast:   add,
    success: (m) => add(m, 'success'),
    error:   (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
    info:    (m) => add(m, 'info'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '360px' }}>
        {toasts.map(t => (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${STYLES[t.type]}`}>
            {ICONS[t.type]}
            <p className="text-sm text-slate-700 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
