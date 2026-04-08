import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  value: string; // format "HH:MM"
  onChange: (v: string) => void;
  placeholder?: string;
}

const ITEM_H = 40;
const VISIBLE = 5;

function RollColumn({ count, value, onChange }: { count: number; value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fromScroll = useRef(false);

  // Scroll to selected item saat value berubah dari luar (bukan dari scroll)
  useEffect(() => {
    if (!ref.current || fromScroll.current) return;
    ref.current.scrollTop = value * ITEM_H;
  }, [value]);

  const onScroll = useCallback(() => {
    if (!ref.current) return;
    fromScroll.current = true;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    onChange(Math.max(0, Math.min(count - 1, idx)));
    clearTimeout((onScroll as any)._t);
    (onScroll as any)._t = setTimeout(() => {
      fromScroll.current = false;
      // Snap ke posisi terdekat setelah berhenti scroll
      if (ref.current) {
        const snapped = Math.round(ref.current.scrollTop / ITEM_H);
        ref.current.scrollTo({ top: snapped * ITEM_H, behavior: 'smooth' });
      }
    }, 120);
  }, [count, onChange]);

  const clickItem = (i: number) => {
    onChange(i);
    fromScroll.current = true;
    ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
    setTimeout(() => { fromScroll.current = false; }, 350);
  };

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ height: ITEM_H * VISIBLE, width: 56 }}>
      {/* Scrollable items */}
      <div
        ref={ref}
        onScroll={onScroll}
        style={{ height: '100%', overflowY: 'scroll', scrollbarWidth: 'none' }}
      >
        {/* Padding atas agar item pertama bisa ke tengah */}
        <div style={{ height: ITEM_H * 2 }} />

        {Array.from({ length: count }, (_, i) => {
          const dist = Math.abs(i - value);
          const isSelected = i === value;
          return (
            <div
              key={i}
              onClick={() => clickItem(i)}
              style={{ height: ITEM_H }}
              className={`flex items-center justify-center cursor-pointer select-none transition-colors ${
                isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
              }`}
            >
              <span
                className={`font-mono font-semibold transition-all duration-100 ${
                  isSelected
                    ? 'text-indigo-500 text-xl'
                    : dist === 1
                    ? 'text-gray-500 dark:text-gray-400 text-base'
                    : dist === 2
                    ? 'text-gray-300 dark:text-gray-600 text-sm'
                    : 'text-gray-200 dark:text-gray-700 text-xs'
                }`}
              >
                {String(i).padStart(2, '0')}
              </span>
            </div>
          );
        })}

        {/* Padding bawah */}
        <div style={{ height: ITEM_H * 2 }} />
      </div>

      {/* Border highlight di tengah — pointer-events-none, z di atas scroll */}
      <div
        className="absolute left-0 right-0 pointer-events-none border-y-2 border-indigo-300"
        style={{ top: ITEM_H * 2, height: ITEM_H, zIndex: 2 }}
      />

      {/* Fade atas */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none bg-gradient-to-b from-white dark:from-[#1c2128] to-transparent"
        style={{ height: ITEM_H * 2, zIndex: 3 }}
      />
      {/* Fade bawah */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-white dark:from-[#1c2128] to-transparent"
        style={{ height: ITEM_H * 2, zIndex: 3 }}
      />
    </div>
  );
}

export function TimePickerRoll({ value, onChange, placeholder = 'HH:MM' }: Props) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [inputVal, setInputVal] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  const parts = (value || '').match(/^(\d{1,2}):(\d{2})$/);
  const hh = parts ? parseInt(parts[1]) : 0;
  const mm = parts ? parseInt(parts[2]) : 0;
  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => { setInputVal(value || ''); }, [value]);

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    // Auto-insert titik dua setelah 2 digit jam
    if (/^\d{2}$/.test(v) && !inputVal.includes(':')) v = v + ':';
    setInputVal(v);
    if (/^\d{1,2}:\d{2}$/.test(v)) {
      const [h, m] = v.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(pad(h) + ':' + pad(m));
      }
    }
  };

  const handleInputBlur = () => {
    if (/^\d{1,2}:\d{2}$/.test(inputVal)) {
      const [h, m] = inputVal.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const normalized = pad(h) + ':' + pad(m);
        setInputVal(normalized);
        onChange(normalized);
        return;
      }
    }
    if (value) setInputVal(value);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="flex items-center gap-2 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#161b22] focus-within:ring-2 focus-within:ring-indigo-500">
        <input
          type="text"
          placeholder={placeholder}
          maxLength={5}
          className="w-14 text-sm outline-none font-mono text-center bg-transparent text-gray-800 dark:text-white placeholder-gray-400"
          value={inputVal}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setOpenUp(rect.bottom + 320 > window.innerHeight);
            }
            setOpen(true);
          }}
        />
        <Clock
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-indigo-500 transition-colors flex-shrink-0"
          onClick={() => {
            if (!open && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setOpenUp(rect.bottom + 320 > window.innerHeight);
            }
            setOpen(o => !o);
          }}
        />
      </div>

      {/* Dropdown roll picker */}
      {open && (
        <div
          className={`absolute z-50 bg-white dark:bg-[#1c2128] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 ${openUp ? 'bottom-full mb-1' : 'mt-1'}`}
          style={{ minWidth: 170 }}
        >
          <p className="text-xs text-gray-400 text-center mb-3 font-medium">Scroll atau klik untuk memilih</p>

          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">Jam</span>
              <RollColumn
                count={24}
                value={hh}
                onChange={h => {
                  const v = pad(h) + ':' + pad(mm);
                  onChange(v);
                  setInputVal(v);
                }}
              />
            </div>

            <span className="text-2xl font-bold text-gray-300 mt-4 select-none">:</span>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">Menit</span>
              <RollColumn
                count={60}
                value={mm}
                onChange={m => {
                  const v = pad(hh) + ':' + pad(m);
                  onChange(v);
                  setInputVal(v);
                }}
              />
            </div>
          </div>

          <button
            className="w-full mt-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            onClick={() => setOpen(false)}
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}
