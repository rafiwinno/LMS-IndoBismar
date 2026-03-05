// src/pages/superadmin/Branches.tsx
// ✅ Self-contained — semua komponen ada di file ini

import { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, MapPin, Users, Edit2, Trash2,
  Shield, X, Building2, Hash, UserCheck, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  admin: string;
  totalUsers: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES  = ['Active', 'Maintenance', 'Inactive'] as const;
const CITIES    = ['Surabaya', 'Sidoarjo', 'Malang', 'Gresik', 'Mojokerto'] as const;
const PER_PAGE  = 6; // grid 3x2

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_BRANCHES: Branch[] = [
  { id:1,  name:'Surabaya Pusat',  code:'SBY-01', city:'Surabaya', address:'Jl. Basuki Rahmat No. 10',    admin:'Budi Santoso',  totalUsers:342, status:'Active'      },
  { id:2,  name:'Surabaya Timur',  code:'SBY-02', city:'Surabaya', address:'Jl. Kertajaya Indah No. 45',  admin:'Rina Wijaya',   totalUsers:215, status:'Active'      },
  { id:3,  name:'Surabaya Barat',  code:'SBY-03', city:'Surabaya', address:'Jl. Darmo Permai No. 7',      admin:'Hendra Kusuma', totalUsers:178, status:'Active'      },
  { id:4,  name:'Surabaya Selatan',code:'SBY-04', city:'Surabaya', address:'Jl. Ahmad Yani No. 88',       admin:'Fitri Handayani',totalUsers:201, status:'Maintenance' },
  { id:5,  name:'Sidoarjo Pusat',  code:'SDA-01', city:'Sidoarjo', address:'Jl. Pahlawan No. 8',          admin:'Dewi Lestari',  totalUsers:189, status:'Active'      },
  { id:6,  name:'Sidoarjo Timur',  code:'SDA-02', city:'Sidoarjo', address:'Jl. Raya Gedangan No. 22',    admin:'Eko Santoso',   totalUsers:134, status:'Active'      },
  { id:7,  name:'Malang Kota',     code:'MLG-01', city:'Malang',   address:'Jl. Ijen Boulevard No. 12',   admin:'Ahmad Dahlan',  totalUsers:276, status:'Active'      },
  { id:8,  name:'Malang Selatan',  code:'MLG-02', city:'Malang',   address:'Jl. Veteran No. 54',          admin:'Sri Wahyuni',   totalUsers:152, status:'Active'      },
  { id:9,  name:'Gresik Pusat',    code:'GRS-01', city:'Gresik',   address:'Jl. Veteran No. 99',          admin:'Andi Saputra',  totalUsers:145, status:'Maintenance' },
  { id:10, name:'Gresik Timur',    code:'GRS-02', city:'Gresik',   address:'Jl. DR. Wahidin No. 15',      admin:'Nurul Hidayah', totalUsers:98,  status:'Active'      },
  { id:11, name:'Mojokerto Pusat', code:'MJK-01', city:'Mojokerto',address:'Jl. Gajahmada No. 33',        admin:'Tono Hartono',  totalUsers:167, status:'Active'      },
  { id:12, name:'Mojokerto Barat', code:'MJK-02', city:'Mojokerto',address:'Jl. Pahlawan No. 77',         admin:'Wati Rahayu',   totalUsers:89,  status:'Inactive'    },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const statusStyle = (status: Branch['status']) => {
  if (status === 'Active')      return 'bg-emerald-100 text-emerald-700';
  if (status === 'Maintenance') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-500';
};

const statusDot = (status: Branch['status']) => {
  if (status === 'Active')      return 'bg-emerald-500';
  if (status === 'Maintenance') return 'bg-amber-400';
  return 'bg-slate-400';
};

// ─── Branch Form Modal (Create & Edit) ───────────────────────────────────────
interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Omit<Branch, 'id' | 'totalUsers'>) => void;
  initialData?: Branch | null;
}

function BranchModal({ isOpen, onClose, onSuccess, initialData }: BranchModalProps) {
  const isEdit = Boolean(initialData);

  const [name,    setName]    = useState('');
  const [code,    setCode]    = useState('');
  const [city,    setCity]    = useState('');
  const [address, setAddress] = useState('');
  const [admin,   setAdmin]   = useState('');
  const [status,  setStatus]  = useState<Branch['status']>('Active');
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setCity(initialData.city);
      setAddress(initialData.address);
      setAdmin(initialData.admin);
      setStatus(initialData.status);
    } else {
      setName(''); setCode(''); setCity(''); setAddress(''); setAdmin(''); setStatus('Active');
    }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const clearErr = (k: string) => setErrors(e => ({ ...e, [k]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = 'Nama cabang wajib diisi';
    if (!code.trim())    e.code    = 'Kode cabang wajib diisi';
    if (!city)           e.city    = 'Kota wajib dipilih';
    if (!address.trim()) e.address = 'Alamat wajib diisi';
    if (!admin.trim())   e.admin   = 'Nama admin wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    onSuccess({ name, code, city, address, admin, status });
  };

  const inputCls = (k: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
      errors[k] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
    }`;
  const inputClsNoIcon = (k: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
      errors[k] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Branch' : 'Create Branch'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEdit ? 'Ubah data cabang' : 'Tambah cabang baru ke sistem'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-3">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Cabang <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('name')} placeholder="Contoh: Surabaya Pusat" value={name}
                onChange={e => { setName(e.target.value); clearErr('name'); }} />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Code + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kode Cabang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={inputCls('code')} placeholder="SBY-01" value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); clearErr('code'); }} />
              </div>
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kota <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select className={`${inputCls('city')} bg-white`} value={city}
                  onChange={e => { setCity(e.target.value); clearErr('city'); }}>
                  <option value="">Pilih Kota</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Alamat <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
                errors.address ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              }`}
              placeholder="Jl. Basuki Rahmat No. 10"
              rows={2}
              value={address}
              onChange={e => { setAddress(e.target.value); clearErr('address'); }}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Admin */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Cabang <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('admin')} placeholder="Nama admin penanggung jawab" value={admin}
                onChange={e => { setAdmin(e.target.value); clearErr('admin'); }} />
            </div>
            {errors.admin && <p className="text-xs text-red-500 mt-1">{errors.admin}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    status === s
                      ? s === 'Active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : s === 'Maintenance'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
            Batal
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer">
            {loading
              ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</>
              : isEdit ? '✓ Simpan Perubahan' : '+ Create Branch'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ branch, onCancel, onConfirm }: { branch: Branch; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Hapus Cabang?</h3>
        <p className="text-sm text-slate-500 mt-2">
          Cabang <span className="font-semibold text-slate-700">{branch.name}</span> ({branch.code}) akan dihapus permanen.
        </p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Batal
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ branch, onClose, onEdit }: { branch: Branch; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white h-full w-80 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">Detail Cabang</span>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {/* Header card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white mb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg leading-tight">{branch.name}</p>
                <p className="text-indigo-200 text-xs font-mono mt-1">{branch.code}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                branch.status === 'Active' ? 'bg-emerald-400/30 text-emerald-100' :
                branch.status === 'Maintenance' ? 'bg-amber-400/30 text-amber-100' :
                'bg-slate-400/30 text-slate-200'
              }`}>{branch.status}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{branch.totalUsers}</p>
                <p className="text-indigo-200 text-xs">Total Users</p>
              </div>
            </div>
          </div>

          {/* Detail rows */}
          {([
            ['Kota',    branch.city,    MapPin],
            ['Alamat',  branch.address, Building2],
            ['Admin',   branch.admin,   Shield],
          ] as [string, string, any][]).map(([label, value, Icon]) => (
            <div key={label} className="flex gap-3 py-3 border-b border-slate-50">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button type="button" onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors cursor-pointer">
            <Edit2 className="w-4 h-4" /> Edit Cabang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Branches() {
  const [branches, setBranches]         = useState<Branch[]>(MOCK_BRANCHES);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCity, setFilterCity]     = useState('');
  const [page, setPage]                 = useState(1);

  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<Branch | null>(null);
  const [delTarget, setDelTarget]       = useState<Branch | null>(null);
  const [detailTarget, setDetailTarget] = useState<Branch | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return branches.filter(b =>
      (!q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)) &&
      (!filterStatus || b.status === filterStatus) &&
      (!filterCity   || b.city   === filterCity)
    );
  }, [branches, search, filterStatus, filterCity]);

  const hasFilter  = search || filterStatus || filterCity;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));
  const resetFilters = () => { setSearch(''); setFilterStatus(''); setFilterCity(''); setPage(1); };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleCreate = (data: Omit<Branch, 'id' | 'totalUsers'>) => {
    setBranches(prev => [{ ...data, id: Date.now(), totalUsers: 0 }, ...prev]);
    setShowCreate(false); setPage(1);
    showToast(`Cabang "${data.name}" berhasil dibuat!`);
  };

  const handleUpdate = (data: Omit<Branch, 'id' | 'totalUsers'>) => {
    if (!editTarget) return;
    setBranches(prev => prev.map(b => b.id === editTarget.id ? { ...data, id: b.id, totalUsers: b.totalUsers } : b));
    setEditTarget(null); setDetailTarget(null);
    showToast(`Cabang "${data.name}" berhasil diupdate!`);
  };

  const handleDelete = () => {
    if (!delTarget) return;
    const name = delTarget.name;
    setBranches(prev => prev.filter(b => b.id !== delTarget.id));
    setDelTarget(null); setDetailTarget(null);
    if (paged.length === 1 && page > 1) setPage(p => p - 1);
    showToast(`Cabang "${name}" berhasil dihapus.`, 'error');
  };

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalUsers  = branches.reduce((s, b) => s + b.totalUsers, 0);
  const activeCount = branches.filter(b => b.status === 'Active').length;

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Branch Management</h2>
          <p className="text-slate-500 mt-1">
            Mengelola <span className="font-semibold text-slate-700">{branches.length} cabang</span> — {activeCount} aktif, total {totalUsers.toLocaleString()} users.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Create Branch
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, code, or city..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer ${
              filterStatus ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600'
            }`}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1); }}
            className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer ${
              filterCity ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600'
            }`}>
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilter && (
            <button type="button" onClick={resetFilters}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {hasFilter && (
        <p className="text-sm text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> dari {branches.length} cabang
          <span className="text-indigo-500 font-medium ml-1">(filtered)</span>
        </p>
      )}

      {/* Grid */}
      {paged.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paged.map(branch => (
            <div key={branch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">

              {/* Card Body */}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">{branch.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${statusStyle(branch.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(branch.status)}`} />
                        {branch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">{branch.code}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => setEditTarget(branch)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-all cursor-pointer"
                      title="Edit cabang">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setDelTarget(branch)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer"
                      title="Hapus cabang">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{branch.address}, {branch.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Admin: <span className="font-medium text-slate-900">{branch.admin}</span></span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 leading-none">Total Users</p>
                    <p className="text-base font-bold text-slate-900">{branch.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDetailTarget(branch)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer">
                  Lihat detail →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium">Tidak ada cabang yang ditemukan.</p>
          <button type="button" onClick={resetFilters}
            className="text-xs text-indigo-600 hover:underline mt-1 cursor-pointer">
            Reset semua filter
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} cabang
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => goPage(page - 1)} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="px-1 text-slate-400 text-xs">…</span>
                : <button key={p} type="button" onClick={() => goPage(Number(p))}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      page === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}>{p}</button>
            )}
            <button type="button" onClick={() => goPage(page + 1)} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BranchModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={handleCreate} initialData={null} />
      <BranchModal isOpen={editTarget !== null} onClose={() => setEditTarget(null)} onSuccess={handleUpdate} initialData={editTarget} />
      {delTarget   && <DeleteDialog  branch={delTarget}   onCancel={() => setDelTarget(null)}   onConfirm={handleDelete} />}
      {detailTarget && <DetailDrawer branch={detailTarget} onClose={() => setDetailTarget(null)} onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); }} />}
    </div>
  );
}
