import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, LogOut,
  Menu, X, Search, Sun, Moon, Bell,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../../services/api';
import { getUser } from '../../pages/types';

// ─── Dark mode — default: light ───────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('lms_dark');
    if (stored !== null) return stored === 'true';
    return false; // default: light mode
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lms_dark', String(dark));
  }, [dark]);

  return [dark, setDark] as const;
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    group: 'Menu Utama',
    items: [
      { name: 'Dashboard',         href: '/superadmin/dashboard', icon: LayoutDashboard, desc: 'Statistik & rekap login' },
    ],
  },
  {
    group: 'Manajemen',
    items: [
      { name: 'User Management',   href: '/superadmin/users',     icon: Users,     desc: 'Kelola pengguna & role' },
      { name: 'Branch Management', href: '/superadmin/branches',  icon: Building2, desc: 'Kelola cabang & kota'   },
    ],
  },
];

const ALL_PAGES = NAV_ITEMS.flatMap(g => g.items);

const BREADCRUMB: Record<string, string> = {
  '/superadmin/dashboard': 'Dashboard',
  '/superadmin/users':     'User Management',
  '/superadmin/branches':  'Branch Management',
};

const getInitials = (name: string) =>
  name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery]       = useState('');
  const navigate                = useNavigate();
  const inputRef                = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);

  const results = query.trim()
    ? ALL_PAGES.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_PAGES;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelected(0); }, [query]);

  const go = useCallback((href: string) => { navigate(href); onClose(); }, [navigate, onClose]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) go(results[selected].href);
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-theme overflow-hidden"
        style={{ animation: 'cmdIn .18s cubic-bezier(.34,1.56,.64,1)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-theme">
          <Search size={16} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Cari halaman..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <kbd className="text-[10px] font-bold text-muted bg-muted px-1.5 py-0.5 rounded border border-theme">ESC</kbd>
        </div>
        <div className="py-2 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">Tidak ditemukan</p>
          ) : results.map((p, i) => (
            <button
              key={p.href}
              onClick={() => go(p.href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                ${i === selected ? 'bg-red-50 dark:bg-red-500/10' : 'hover:bg-muted'}`}
            >
              <p.icon size={15} className={i === selected ? 'text-red-600' : 'text-muted'} />
              <div>
                <p className={`text-sm font-semibold ${i === selected ? 'text-red-700 dark:text-red-400' : 'text-primary'}`}>
                  {p.name}
                </p>
                <p className="text-[11px] text-muted">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed }: { item: typeof ALL_PAGES[0]; collapsed: boolean }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => collapsed && setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `relative flex items-center gap-3 py-[10px] text-[13.5px] font-medium transition-all group
          ${collapsed ? 'justify-center px-0' : 'px-5'}
          ${isActive
            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
            : 'text-label hover:bg-muted hover:text-primary'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Left bar aktif — flush ke tepi, full tinggi */}
            {isActive && (
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600 dark:bg-red-500"
                style={{ animation: 'barIn .18s ease' }}
              />
            )}
            <item.icon
              size={18}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-red-600 dark:text-red-400' : 'text-muted group-hover:text-secondary'
              }`}
            />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </>
        )}
      </NavLink>

      {/* Tooltip saat collapsed */}
      {collapsed && showTip && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none">
          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.75 w-3 h-3
            bg-white dark:bg-slate-800 rotate-45
            border-l border-b border-slate-200 dark:border-slate-700" />
          {/* Card */}
          <div
            className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg
              border border-slate-200 dark:border-slate-700
              px-4 py-3 whitespace-nowrap min-w-40"
            style={{ animation: 'tipIn .15s ease' }}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.75 rounded-t-xl bg-linear-to-r from-red-500 to-red-400" />

            {/* Icon + name */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                <item.icon size={14} className="text-red-600 dark:text-red-400" />
              </div>
              <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                {item.name}
              </span>
            </div>

            {/* Desc */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed pl-0.5">
              {item.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function SuperAdminLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [cmdOpen,    setCmdOpen]    = useState(false);
  const [dark,       setDark]       = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const user     = getUser();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authService.logout(); } catch {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } finally { navigate('/login', { replace: true }); }
  };

  // ── Sidebar content ────────────────────────────────────────────────────────
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-sidebar">

      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-5 h-16 shrink-0 border-b border-theme
          ${collapsed && !isMobile ? 'justify-center px-0' : ''}`}
      >
        <img
          src="/src/assets/logo.png"
          alt="PT Indo Bismar"
          className={`shrink-0 object-contain rounded-full transition-all duration-300
            ${collapsed && !isMobile ? 'w-9 h-9' : 'w-10 h-10'}`}
        />
        {(!collapsed || isMobile) && (
          <div style={{ animation: 'fadeSlide .2s ease' }}>
            <p className="font-bold text-sm leading-tight text-primary">Indo Bismar</p>
            <p className="text-[11px] text-muted">Learning Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-5 pb-3">
        {NAV_ITEMS.map(group => (
          <div key={group.group} className="mb-4">
            {(!collapsed || isMobile) && (
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted px-5 mb-1">
                {group.group}
              </p>
            )}
            {collapsed && !isMobile && (
              <div className="border-t border-theme mx-3 mb-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.href} item={item} collapsed={collapsed && !isMobile} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Dark Mode + Logout */}
      <div className="shrink-0 border-t border-theme pt-3 pb-3 space-y-0.5">

        {/* User card */}
        {user && (
          <div
            className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl bg-muted border border-theme mb-2
              ${collapsed && !isMobile ? 'justify-center px-2 mx-2' : ''}`}
          >
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user.nama)}
            </div>
            {(!collapsed || isMobile) && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-tight text-primary">{user.nama}</p>
                <p className="text-[11px] truncate text-muted">Superadmin</p>
              </div>
            )}
          </div>
        )}

        {/* Dark mode toggle */}
        {(!collapsed || isMobile) ? (
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center justify-between w-full px-5 py-2.5 text-[13px] text-label hover:bg-muted transition-all"
          >
            <div className="flex items-center gap-3">
              {dark
                ? <Sun  size={16} className="shrink-0 text-muted" />
                : <Moon size={16} className="shrink-0 text-muted" />}
              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            {/* Pill — abu seperti foto */}
            <div className={`w-10 h-[22px] rounded-full relative shrink-0 transition-colors duration-200 ${dark ? 'bg-red-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${dark ? 'left-[22px]' : 'left-[3px]'}`} />
            </div>
          </button>
        ) : (
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center justify-center w-full py-2.5 text-muted hover:bg-muted transition-all"
            title={dark ? 'Light Mode' : 'Dark Mode'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        {/* Keluar */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`flex items-center gap-3 w-full px-5 py-2.5 text-[13px] text-label
            hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400
            disabled:opacity-50 transition-all
            ${collapsed && !isMobile ? 'justify-center px-0' : ''}`}
          title={collapsed && !isMobile ? 'Keluar' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || isMobile) && <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page flex transition-colors duration-200">

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ animation: 'fadeInBg .2s ease' }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col lg:hidden border-r border-theme
          transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-muted hover:bg-muted transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar shrink-0 border-r border-theme sticky top-0 h-screen z-10
          transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-[220px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header
          className="h-16 bg-topbar border-b border-theme flex items-center justify-between px-6 shrink-0 transition-colors duration-200"
          style={{ boxShadow: 'var(--shadow-topbar)' }}
        >
          {/* Kiri: collapse / hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden lg:flex p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-muted transition-colors"
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-muted transition-colors"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Kanan: Bell + divider + nama + role + avatar */}
          <div className="flex items-center gap-3">

            <div className="w-px h-6 border-r border-theme" />

            {user && (
              <div className="flex items-center gap-2.5">
                <div className="text-right leading-tight">
                  <p className="text-[13px] font-semibold text-primary">{user.nama}</p>
                  <p className="text-[11px] text-muted">Superadmin</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-[12px] font-bold text-white shrink-0 select-none">
                  {getInitials(user.nama)}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 sm:p-8">
          <div style={{ animation: 'pageIn .2s ease' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeInBg  { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeSlide { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:translateX(0) } }
        @keyframes barIn     { from { opacity:0 } to { opacity:1 } }
        @keyframes tipIn     { from { opacity:0; transform:translateX(-4px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pageIn    { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cmdIn     { from { opacity:0; transform:scale(.97) translateY(-6px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}