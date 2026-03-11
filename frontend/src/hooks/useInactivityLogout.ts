import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { removeUser } from '../pages/types';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 jam
const WARNING_BEFORE_MS   = 2 * 60 * 1000;  // warning 2 menit sebelum logout
const CHECK_INTERVAL_MS   = 30 * 1000;       // cek setiap 30 detik

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'scroll', 'click',
] as const;

interface Options {
  onWarning?: (secondsLeft: number) => void;
  onLogout?: () => void;
}

export function useInactivityLogout({ onWarning, onLogout }: Options = {}) {
  const lastActivityRef = useRef<number>(Date.now());
  const warningFiredRef = useRef<boolean>(false);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningFiredRef.current = false;
  }, []);

  const doLogout = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      await api.post('/logout');
    } catch {
      // Tetap logout meski request gagal
    } finally {
      removeUser();
      onLogout?.();
    }
  }, [onLogout]);

  useEffect(() => {
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    intervalRef.current = setInterval(() => {
      const idle      = Date.now() - lastActivityRef.current;
      const remaining = INACTIVITY_LIMIT_MS - idle;

      if (remaining <= 0) {
        doLogout();
      } else if (remaining <= WARNING_BEFORE_MS && !warningFiredRef.current) {
        warningFiredRef.current = true;
        onWarning?.(Math.round(remaining / 1000));
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetTimer, doLogout, onWarning]);
}