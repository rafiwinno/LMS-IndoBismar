// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/InactivityWarning.tsx
// Komponen toast warning sebelum auto-logout
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  secondsLeft: number;        // detik tersisa saat warning muncul
  onStayLoggedIn: () => void; // user klik "Tetap Login"
}

export function InactivityWarning({ secondsLeft, onStayLoggedIn }: Props) {
  const [countdown, setCountdown] = useState(secondsLeft);

  useEffect(() => {
    setCountdown(secondsLeft);
    const t = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const label = mins > 0
    ? `${mins} menit ${secs} detik`
    : `${secs} detik`;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
      {/* progress bar */}
      <div
        className="h-1 bg-amber-400 transition-all duration-1000"
        style={{ width: `${(countdown / secondsLeft) * 100}%` }}
      />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm">Sesi hampir berakhir</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tidak ada aktivitas. Anda akan otomatis keluar dalam{' '}
              <span className="font-semibold text-amber-600">{label}</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStayLoggedIn}
          className="mt-4 w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Tetap Login
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONTOH INTEGRASI di App.tsx
// Tambahkan bagian ini ke komponen App atau layout utama Anda
// ─────────────────────────────────────────────────────────────────────────────

/*

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { InactivityWarning } from './components/InactivityWarning';
import { getUser } from './pages/types';

export default function App() {
  const navigate   = useNavigate();
  const user       = getUser();
  const isLoggedIn = Boolean(user);

  const [warning, setWarning] = useState<number | null>(null); // detik tersisa

  const handleLogout = useCallback(() => {
    setWarning(null);
    navigate('/login');
  }, [navigate]);

  const handleWarning = useCallback((secondsLeft: number) => {
    setWarning(secondsLeft);
  }, []);

  const handleStayLoggedIn = useCallback(() => {
    setWarning(null);
    // Hook akan reset timer otomatis saat user klik (karena ada event click)
  }, []);

  // Aktifkan hanya saat user sudah login
  useInactivityLogout(
    isLoggedIn
      ? { onWarning: handleWarning, onLogout: handleLogout }
      : {}
  );

  return (
    <>
      { ... routing / layout Anda ... }

      // Tampilkan warning toast jika inaktif
      {isLoggedIn && warning !== null && (
        <InactivityWarning
          secondsLeft={warning}
          onStayLoggedIn={handleStayLoggedIn}
        />
      )}
    </>
  );
}

*/