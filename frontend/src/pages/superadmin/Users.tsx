import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, MoreVertical,
  Shield, X, ChevronLeft, ChevronRight,
  User, Mail, Lock, Building2, Download, Wifi, WifiOff,
} from 'lucide-react';
import api from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserItem {
  id: number;
  nama: string;
  username: string;
  email: string | null;
  role: 'admin' | 'trainer' | 'user';
  id_role: number;
  id_cabang: number;
  nama_cabang: string;
  status: 'aktif' | 'nonaktif';
  last_login: string | null;
  is_online: boolean;
}

interface Branch {
  id: number;
  nama_cabang: string;
  kota: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':   return 'Admin Cabang';
    case 'trainer': return 'Trainer';
    case 'user':    return 'User';
    default:        return role;
  }
};

/**
 * Parse datetime dari BE (Asia/Jakarta / WIB = UTC+7).
 * Laravel dengan timezone Asia/Jakarta mengirim string TANPA suffix timezone,
 * misal "2026-03-10 11:03:04". Browser menginterpretasi ini sebagai UTC
 * sehingga tampil +7 jam lebih lambat. Fix: tambahkan "+07:00" agar browser
 * tahu ini sudah WIB dan tidak perlu konversi lagi.
 */
const parseWIB = (dt: string): Date => {
  // Jika sudah ada timezone info (Z / +xx:xx), pakai langsung
  if (/Z|[+-]\d{2}:\d{2}$/.test(dt)) return new Date(dt);
  // Ganti spasi dengan T dan tambah offset WIB
  return new Date(dt.replace(' ', 'T') + '+07:00');
};

const formatLastLogin = (dt: string | null): { relative: string; full: string } => {
  if (!dt) return { relative: 'Never', full: 'Belum pernah login' };

  const date = parseWIB(dt);
  const diff  = Math.floor((Date.now() - date.getTime()) / 1000);

  const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(':', '.');
  const full = `${dateStr} pukul ${timeStr}`;

  let relative: string;
  if (diff < 60)           relative = 'Baru saja';
  else if (diff < 3600)    relative = `${Math.floor(diff / 60)} menit lalu`;
  else if (diff < 86400)   relative = `${Math.floor(diff / 3600)} jam lalu`;
  else if (diff < 604800)  relative = `${Math.floor(diff / 86400)} hari lalu`;
  else                     relative = date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta',
  });

  return { relative, full };
};

// ─── Online Badge ─────────────────────────────────────────────────────────────
function OnlineBadge({ isOnline, lastLogin }: { isOnline: boolean; lastLogin: string | null }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { relative, full } = formatLastLogin(lastLogin);

  return (
    <div
      className="relative inline-flex items-center gap-1.5 cursor-default"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isOnline ? (
        <>
          {/* pulsing green dot */}
          <span className="relative flex w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-600">Online</span>
        </>
      ) : (
        <>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
          <span className="text-xs text-slate-500">{relative}</span>
        </>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 whitespace-nowrap">
          <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            {isOnline ? (
              <div>
                <p className="font-semibold text-emerald-400 mb-0.5">● Sedang Online</p>
                <p className="text-slate-300">Login: {full}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-300 mb-0.5">● Offline</p>
                <p className="text-slate-400">
                  {lastLogin ? `Terakhir: ${full}` : 'Belum pernah login'}
                </p>
              </div>
            )}
          </div>
          {/* arrow */}
          <div className="w-2 h-2 bg-slate-800 rotate-45 ml-3 -mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── UserModal ────────────────────────────────────────────────────────────────
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: UserItem | null;
  branches: Branch[];
}

function UserModal({ isOpen, onClose, onSuccess, initialData, branches }: UserModalProps) {
  const isEdit = Boolean(initialData);
  const [nama,      setNama]      = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [idRole,    setIdRole]    = useState('');
  const [idCabang,  setIdCabang]  = useState('');
  const [status,    setStatus]    = useState<'aktif' | 'nonaktif'>('aktif');
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setNama(initialData.nama); setUsername(initialData.username);
      setEmail(initialData.email ?? ''); setIdRole(String(initialData.id_role));
      setIdCabang(String(initialData.id_cabang)); setStatus(initialData.status);
      setPassword(''); setConfirmPw('');
    } else {
      setNama(''); setUsername(''); setEmail(''); setPassword('');
      setConfirmPw(''); setIdRole(''); setIdCabang(''); setStatus('aktif');
    }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const clearError = (key: string) => setErrors(e => ({ ...e, [key]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nama.trim())     e.nama     = 'Nama wajib diisi';
    if (!username.trim()) e.username = 'Username wajib diisi';
    if (!isEdit && !password)               e.password  = 'Password wajib diisi';
    if (password && password.length < 6)    e.password  = 'Minimal 6 karakter';
    if (password && password !== confirmPw) e.confirmPw = 'Password tidak cocok';
    if (!idRole)   e.idRole   = 'Role wajib dipilih';
    if (!idCabang) e.idCabang = 'Branch wajib dipilih';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        nama, username, email: email || null,
        id_role: Number(idRole), id_cabang: Number(idCabang), status,
      };
      if (password) payload.password = password;
      if (isEdit && initialData) {
        await api.put(`/superadmin/users/${initialData.id}`, payload);
      } else {
        await api.post('/superadmin/users', payload);
      }
      onSuccess(); onClose();
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls  = (key: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`;
  const selectCls = (key: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit User' : 'Create User'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Ubah data pengguna' : 'Tambah pengguna baru ke sistem'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(nama) || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{nama || 'Nama Pengguna'}</p>
            <p className="text-xs text-slate-400">{email || 'email@domain.com'}</p>
          </div>
        </div>
        <div className="px-6 py-4 space-y-3">
          {errors.general && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.general}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('nama')} placeholder="Contoh: Budi Santoso" value={nama} onChange={e => { setNama(e.target.value); clearError('nama'); }} />
            </div>
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('username')} placeholder="username123" value={username} onChange={e => { setUsername(e.target.value); clearError('username'); }} />
            </div>
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" className={inputCls('email')} placeholder="budi@domain.com" value={email} onChange={e => { setEmail(e.target.value); clearError('email'); }} />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password {!isEdit && <span className="text-red-500">*</span>}{isEdit && <span className="text-slate-400 font-normal"> (opsional)</span>}</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" className={inputCls('password')} placeholder="Min. 6 karakter" value={password} onChange={e => { setPassword(e.target.value); clearError('password'); }} />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Konfirmasi {!isEdit && <span className="text-red-500">*</span>}</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" className={inputCls('confirmPw')} placeholder="Ulangi password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); clearError('confirmPw'); }} />
              </div>
              {errors.confirmPw && <p className="text-xs text-red-500 mt-1">{errors.confirmPw}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role <span className="text-red-500">*</span></label>
              <div className="relative"><Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select className={selectCls('idRole')} value={idRole} onChange={e => { setIdRole(e.target.value); clearError('idRole'); }}>
                  <option value="">Pilih Role</option>
                  <option value="2">Admin Cabang</option>
                  <option value="3">Trainer</option>
                  <option value="4">User</option>
                </select>
              </div>
              {errors.idRole && <p className="text-xs text-red-500 mt-1">{errors.idRole}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Branch <span className="text-red-500">*</span></label>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select className={selectCls('idCabang')} value={idCabang} onChange={e => { setIdCabang(e.target.value); clearError('idCabang'); }}>
                  <option value="">Pilih Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.nama_cabang}</option>)}
                </select>
              </div>
              {errors.idCabang && <p className="text-xs text-red-500 mt-1">{errors.idCabang}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-2">
              {(['aktif', 'nonaktif'] as const).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${status === s ? s === 'aktif' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                  {s === 'aktif' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
            {loading ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</> : isEdit ? '✓ Simpan Perubahan' : '+ Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ user, onCancel, onConfirm }: { user: UserItem; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
        <h3 className="text-base font-bold text-slate-900">Hapus User?</h3>
        <p className="text-sm text-slate-500 mt-2">User <span className="font-semibold text-slate-700">{user.nama}</span> akan dihapus permanen.</p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ user, onClose, onEdit }: { user: UserItem; onClose: () => void; onEdit: () => void }) {
  const { relative, full } = formatLastLogin(user.last_login);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white h-full w-72 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">Detail User</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-2 pb-5 border-b border-slate-100">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {getInitials(user.nama)}
              </div>
              {/* online indicator on avatar */}
              {user.is_online && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              )}
            </div>
            <p className="font-semibold text-slate-900 mt-1">{user.nama}</p>
            <p className="text-xs text-slate-400">{user.email ?? user.username}</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {user.status === 'aktif' ? 'Active' : 'Inactive'}
              </span>
              {user.is_online && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 space-y-0">
            {([
              ['Role',       getRoleLabel(user.role)],
              ['Branch',     user.nama_cabang],
              ['Username',   user.username],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="text-sm font-medium text-slate-700">{value}</span>
              </div>
            ))}
            {/* Last login row dengan info lengkap */}
            <div className="py-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-400">Last Login</span>
                <div className="text-right">
                  {user.is_online ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Wifi className="w-3 h-3" /> Sedang Online
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-700">{relative}</span>
                  )}
                  {user.last_login && (
                    <p className="text-xs text-slate-400 mt-0.5">{full}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button type="button" onClick={onEdit} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Edit2 className="w-4 h-4" /> Edit User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Users() {
  const [users,        setUsers]        = useState<UserItem[]>([]);
  const [branches,     setBranches]     = useState<Branch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterRole,   setFilterRole]   = useState('');
  const [filterCabang, setFilterCabang] = useState('');
  const [page,         setPage]         = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);

  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<UserItem | null>(null);
  const [delTarget,    setDelTarget]    = useState<UserItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserItem | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/superadmin/branches').then(res => setBranches(res.data)).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (search)       params.search    = search;
      if (filterRole)   params.role      = filterRole;
      if (filterCabang) params.id_cabang = filterCabang;
      const res = await api.get('/superadmin/users', { params });
      setUsers(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch {
      showToast('Gagal memuat data user.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterCabang]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, filterRole, filterCabang]);

  // Auto-refresh setiap 30 detik untuk update status online
  useEffect(() => {
    const interval = setInterval(() => { fetchUsers(); }, 30_000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: Record<string, any> = { per_page: 99999 };
      if (search)       params.search    = search;
      if (filterRole)   params.role      = filterRole;
      if (filterCabang) params.id_cabang = filterCabang;

      const res = await api.get('/superadmin/users', { params });
      const allUsers: UserItem[] = res.data.data;

      if (!allUsers.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }

      const headers = ['No', 'Nama', 'Username', 'Email', 'Role', 'Branch', 'Status', 'Last Login', 'Online'];
      const rows = allUsers.map((u, i) => {
        const { relative } = formatLastLogin(u.last_login);
        return [
          i + 1, `"${u.nama}"`, u.username, u.email ?? '-',
          getRoleLabel(u.role), `"${u.nama_cabang}"`,
          u.status === 'aktif' ? 'Active' : 'Inactive',
          relative,
          u.is_online ? 'Online' : 'Offline',
        ];
      });

      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast(`${allUsers.length} data berhasil diekspor!`);
    } catch {
      showToast('Gagal mengekspor data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await api.delete(`/superadmin/users/${delTarget.id}`);
      setDelTarget(null); setDetailTarget(null);
      showToast(`User "${delTarget.nama}" berhasil dihapus.`, 'error');
      fetchUsers();
    } catch {
      showToast('Gagal menghapus user.', 'error');
    }
  };

  const pageNumbers = (): (number | '...')[] => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', lastPage];
    if (page >= lastPage - 3) return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [1, '...', page - 1, page, page + 1, '...', lastPage];
  };

  const hasFilter   = search || filterRole || filterCabang;
  const resetFilters = () => { setSearch(''); setFilterRole(''); setFilterCabang(''); setPage(1); };
  const onlineCount  = users.filter(u => u.is_online).length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 bg-white border border-slate-200 border-l-4 ${
          toast.type === 'success' ? 'border-l-emerald-500 text-emerald-700' : 'border-l-red-500 text-red-700'
        } rounded-xl px-5 py-3 shadow-lg text-sm font-medium`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Manage all users, roles, and branch assignments.
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} online
              </span>
            )}
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search users by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterRole ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}>
              <option value="">All Roles</option>
              <option value="admin">Admin Cabang</option>
              <option value="trainer">Trainer</option>
              <option value="user">User</option>
            </select>
            <select value={filterCabang} onChange={e => setFilterCabang(e.target.value)}
              className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterCabang ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nama_cabang}</option>)}
            </select>
            {hasFilter && (
              <button type="button" onClick={resetFilters}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors whitespace-nowrap">Reset</button>
            )}
            <button type="button" onClick={handleExportCSV} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap">
              {exporting
                ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Mengekspor...</>
                : <><Download className="w-4 h-4" /> Export CSV</>}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['User', 'Role', 'Branch', 'Status', 'Last Login', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-slate-600 font-semibold ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-24" /></td>
                  ))}</tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada user yang ditemukan.</p>
                    {hasFilter && <button type="button" onClick={resetFilters} className="text-xs text-blue-600 hover:underline mt-1">Reset semua filter</button>}
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                          {getInitials(user.nama)}
                        </div>
                        {/* online dot on avatar */}
                        {user.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.nama}</p>
                        <p className="text-xs text-slate-400">{user.email ?? user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${user.role === 'admin' ? 'text-purple-500' : user.role === 'trainer' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="text-slate-700">{getRoleLabel(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{user.nama_cabang}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.status === 'aktif' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* ── Last Login dengan OnlineBadge ── */}
                  <td className="px-6 py-4">
                    <OnlineBadge isOnline={user.is_online} lastLogin={user.last_login} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => setEditTarget(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setDelTarget(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"><Trash2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setDetailTarget(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-slate-500">
            {total === 0 ? 'Tidak ada hasil' : `Showing ${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total} users`}
            {hasFilter && <span className="text-blue-500 font-medium ml-1">(filtered)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="px-1 text-slate-400 text-xs">…</span>
                : <button key={p} type="button" onClick={() => setPage(Number(p))}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${page === p ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                    {p}
                  </button>
            )}
            <button type="button" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal isOpen={showCreate} onClose={() => setShowCreate(false)}
        onSuccess={() => { showToast('User berhasil dibuat!'); fetchUsers(); }}
        initialData={null} branches={branches} />
      <UserModal isOpen={editTarget !== null} onClose={() => setEditTarget(null)}
        onSuccess={() => { showToast('User berhasil diupdate!'); fetchUsers(); }}
        initialData={editTarget} branches={branches} />
      {delTarget    && <DeleteDialog user={delTarget}    onCancel={() => setDelTarget(null)}    onConfirm={handleDelete} />}
      {detailTarget && <DetailDrawer user={detailTarget} onClose={() => setDetailTarget(null)}  onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); }} />}
    </div>
  );
}