import React, { useState, useEffect } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { confirmEvents, type ConfirmRequest } from '../../lib/confirm';

export function ConfirmDialog() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    confirmEvents.subscribe(setReq);
    return () => confirmEvents.unsubscribe();
  }, []);

  if (!req) return null;

  const handleResolve = (val: boolean) => {
    req.resolve(val);
    setReq(null);
  };

  const isDanger = req.danger ?? true;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDanger ? 'bg-red-100' : 'bg-blue-100'}`}>
              {isDanger
                ? <AlertTriangle className="w-5 h-5 text-red-500" />
                : <HelpCircle className="w-5 h-5 text-blue-500" />
              }
            </div>
            <h3 className="font-semibold text-gray-900 text-base">
              {req.title ?? (isDanger ? 'Konfirmasi Hapus' : 'Konfirmasi')}
            </h3>
          </div>
          <button onClick={() => handleResolve(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{req.message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => handleResolve(false)}
            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={() => handleResolve(true)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
            {req.confirmText ?? (isDanger ? 'Ya, Hapus' : 'Ya')}
          </button>
        </div>
      </div>
    </div>
  );
}
