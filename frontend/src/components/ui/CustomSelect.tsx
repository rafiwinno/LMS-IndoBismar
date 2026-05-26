import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = '-- Pilih --', className = 'flex-1 min-w-0' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch(''); }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg border transition-all outline-none text-left
          ${open
            ? 'border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-[#161b22]'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] hover:border-gray-300 dark:hover:border-white/20'
          }`}
      >
        <span className={selectedLabel ? 'text-gray-800 dark:text-white truncate' : 'text-gray-400 dark:text-gray-500 truncate'}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-40 bg-white dark:bg-[#1c2333] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100 dark:border-white/8">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-[#161b22] rounded-lg">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-400 outline-none"
                />
              </div>
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors
                  ${value === '' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                {placeholder}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-center text-gray-400">Tidak ditemukan</li>
            ) : (
              filtered.map(option => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); setSearch(''); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors
                      ${option.value === value
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check className="w-3.5 h-3.5 shrink-0 text-red-500" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
