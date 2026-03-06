import { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, MoreVertical,
  Shield, X, ChevronLeft, ChevronRight,
  User, Mail, Lock, Building2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES    = ['Admin Cabang', 'Trainer', 'User'] as const;
const BRANCHES = ['Sby Pusat', 'Sidoarjo', 'Malang', 'Gresik', 'Sby Timur'] as const;
const PER_PAGE = 10;

// ─── Mock Data (30 users) ─────────────────────────────────────────────────────
const MOCK_USERS: UserItem[] = [
  { id:1,  name:'Budi Santoso',    email:'budi@indobismar.com',    role:'Admin Cabang', branch:'Sby Pusat',  status:'Active',   lastLogin:'2 mins ago'   },
  { id:2,  name:'Siti Aminah',     email:'siti@indobismar.com',    role:'Trainer',      branch:'Sidoarjo',   status:'Active',   lastLogin:'1 hour ago'   },
  { id:3,  name:'Ahmad Dahlan',    email:'ahmad@indobismar.com',   role:'User',         branch:'Malang',     status:'Inactive', lastLogin:'5 days ago'   },
  { id:4,  name:'Dewi Lestari',    email:'dewi@indobismar.com',    role:'Admin Cabang', branch:'Gresik',     status:'Active',   lastLogin:'10 mins ago'  },
  { id:5,  name:'Rudi Hermawan',   email:'rudi@indobismar.com',    role:'Trainer',      branch:'Sby Timur',  status:'Active',   lastLogin:'Yesterday'    },
  { id:6,  name:'Fitri Handayani', email:'fitri@indobismar.com',   role:'User',         branch:'Sby Pusat',  status:'Active',   lastLogin:'3 hours ago'  },
  { id:7,  name:'Hendra Kusuma',   email:'hendra@indobismar.com',  role:'Trainer',      branch:'Malang',     status:'Active',   lastLogin:'30 mins ago'  },
  { id:8,  name:'Rina Wulandari',  email:'rina@indobismar.com',    role:'User',         branch:'Sidoarjo',   status:'Inactive', lastLogin:'2 weeks ago'  },
  { id:9,  name:'Agus Prasetyo',   email:'agus@indobismar.com',    role:'Admin Cabang', branch:'Gresik',     status:'Active',   lastLogin:'1 day ago'    },
  { id:10, name:'Maya Kartika',    email:'maya@indobismar.com',    role:'User',         branch:'Sby Timur',  status:'Active',   lastLogin:'4 hours ago'  },
  { id:11, name:'Doni Setiawan',   email:'doni@indobismar.com',    role:'Trainer',      branch:'Sby Pusat',  status:'Active',   lastLogin:'6 hours ago'  },
  { id:12, name:'Lina Marlina',    email:'lina@indobismar.com',    role:'User',         branch:'Sidoarjo',   status:'Active',   lastLogin:'Just now'     },
  { id:13, name:'Bambang Susilo',  email:'bambang@indobismar.com', role:'Admin Cabang', branch:'Malang',     status:'Inactive', lastLogin:'1 month ago'  },
  { id:14, name:'Nurul Hidayah',   email:'nurul@indobismar.com',   role:'Trainer',      branch:'Gresik',     status:'Active',   lastLogin:'2 days ago'   },
  { id:15, name:'Eko Santoso',     email:'eko@indobismar.com',     role:'User',         branch:'Sby Timur',  status:'Active',   lastLogin:'8 hours ago'  },
  { id:16, name:'Wati Rahayu',     email:'wati@indobismar.com',    role:'Trainer',      branch:'Sby Pusat',  status:'Inactive', lastLogin:'3 days ago'   },
  { id:17, name:'Joko Widodo',     email:'joko@indobismar.com',    role:'User',         branch:'Sidoarjo',   status:'Active',   lastLogin:'12 hours ago' },
  { id:18, name:'Sri Wahyuni',     email:'sri@indobismar.com',     role:'Admin Cabang', branch:'Malang',     status:'Active',   lastLogin:'5 hours ago'  },
  { id:19, name:'Tono Hartono',    email:'tono@indobismar.com',    role:'Trainer',      branch:'Gresik',     status:'Active',   lastLogin:'20 mins ago'  },
  { id:20, name:'Yanti Susanti',   email:'yanti@indobismar.com',   role:'User',         branch:'Sby Timur',  status:'Inactive', lastLogin:'1 week ago'   },
  { id:21, name:'Ferdi Gunawan',   email:'ferdi@indobismar.com',   role:'Admin Cabang', branch:'Sby Pusat',  status:'Active',   lastLogin:'45 mins ago'  },
  { id:22, name:'Sari Indah',      email:'sari@indobismar.com',    role:'Trainer',      branch:'Sidoarjo',   status:'Active',   lastLogin:'2 hours ago'  },
  { id:23, name:'Wahyu Prasetya',  email:'wahyu@indobismar.com',   role:'User',         branch:'Malang',     status:'Active',   lastLogin:'Yesterday'    },
  { id:24, name:'Dina Pertiwi',    email:'dina@indobismar.com',    role:'User',         branch:'Gresik',     status:'Inactive', lastLogin:'6 days ago'   },
  { id:25, name:'Rizki Maulana',   email:'rizki@indobismar.com',   role:'Trainer',      branch:'Sby Timur',  status:'Active',   lastLogin:'1 hour ago'   },
  { id:26, name:'Putri Anggraini', email:'putri@indobismar.com',   role:'Admin Cabang', branch:'Sby Pusat',  status:'Active',   lastLogin:'3 hours ago'  },
  { id:27, name:'Gilang Ramadhan', email:'gilang@indobismar.com',  role:'User',         branch:'Sidoarjo',   status:'Active',   lastLogin:'7 hours ago'  },
  { id:28, name:'Ayu Safitri',     email:'ayu@indobismar.com',     role:'Trainer',      branch:'Malang',     status:'Active',   lastLogin:'15 mins ago'  },
  { id:29, name:'Fajar Nugroho',   email:'fajar@indobismar.com',   role:'User',         branch:'Gresik',     status:'Inactive', lastLogin:'2 months ago' },
  { id:30, name:'Indah Permata',   email:'indah@indobismar.com',   role:'Admin Cabang', branch:'Sby Timur',  status:'Active',   lastLogin:'10 hours ago' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

// ─── UserModal (Create & Edit) ────────────────────────────────────────────────
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Omit<UserItem, 'id'>) => void;
  initialData?: UserItem | null;
}

function UserModal({ isOpen, onClose, onSuccess, initialData }: UserModalProps) {
  const isEdit = Boolean(initialData);

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [role, setRole]               = useState('');
  const [branch, setBranch]           = useState('');
  const [status, setStatus]           = useState<'Active' | 'Inactive'>('Active');
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setBranch(initialData.branch);
      setStatus(initialData.status);
      setPassword('');
      setConfirmPw('');
    } else {
      setName(''); setEmail(''); setPassword(''); setConfirmPw('');
      setRole(''); setBranch(''); setStatus('Active');
    }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const clearError = (key: string) => setErrors(e => ({ ...e, [key]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = 'Nama wajib diisi';
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format email tidak valid';
    if (!isEdit && !password)            e.password  = 'Password wajib diisi';
    if (password && password.length < 6) e.password  = 'Minimal 6 karakter';
    if (password && password !== confirmPw) e.confirmPw = 'Password tidak cocok';
    if (!role)   e.role   = 'Role wajib dipilih';
    if (!branch) e.branch = 'Branch wajib dipilih';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    onSuccess({
      name, email, role, branch, status,
      lastLogin: initialData?.lastLogin ?? 'Just now',
    });
  };

  const inputCls = (key: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
    }`;

  const selectCls = (key: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
      errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-300'
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
              {isEdit ? 'Edit User' : 'Create User'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {isEdit ? 'Ubah data pengguna' : 'Tambah pengguna baru ke sistem'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(name) || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{name || 'Nama Pengguna'}</p>
            <p className="text-xs text-slate-400">{email || 'email@indobismar.com'}</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-3">

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={inputCls('name')}
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={e => { setName(e.target.value); clearError('name'); }}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className={inputCls('email')}
                placeholder="budi@indobismar.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError('email'); }}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-slate-400 font-normal"> (opsional)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className={inputCls('password')}
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password'); }}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Konfirmasi {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className={inputCls('confirmPw')}
                  placeholder="Ulangi password"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); clearError('confirmPw'); }}
                />
              </div>
              {errors.confirmPw && <p className="text-xs text-red-500 mt-1">{errors.confirmPw}</p>}
            </div>
          </div>

          {/* Role + Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className={selectCls('role')}
                  value={role}
                  onChange={e => { setRole(e.target.value); clearError('role'); }}
                >
                  <option value="">Pilih Role</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className={selectCls('branch')}
                  value={branch}
                  onChange={e => { setBranch(e.target.value); clearError('branch'); }}
                >
                  <option value="">Pilih Branch</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              {errors.branch && <p className="text-xs text-red-500 mt-1">{errors.branch}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-2">
              {(['Active', 'Inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    status === s
                      ? s === 'Active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading
              ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</>
              : isEdit ? '✓ Simpan Perubahan' : '+ Create User'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({
  user,
  onCancel,
  onConfirm,
}: {
  user: UserItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Hapus User?</h3>
        <p className="text-sm text-slate-500 mt-2">
          User <span className="font-semibold text-slate-700">{user.name}</span> akan dihapus
          permanen dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({
  user,
  onClose,
  onEdit,
}: {
  user: UserItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white h-full w-72 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">Detail User</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-2 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(user.name)}
            </div>
            <p className="font-semibold text-slate-900 mt-1">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.status === 'Active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {user.status}
            </span>
          </div>
          <div className="mt-3 space-y-0">
            {([
              ['Role',       user.role],
              ['Branch',     user.branch],
              ['Last Login', user.lastLogin],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="text-sm font-medium text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers]               = useState<UserItem[]>(MOCK_USERS);
  const [search, setSearch]             = useState('');
  const [filterRole, setFilterRole]     = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [page, setPage]                 = useState(1);

  // Modal states
  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<UserItem | null>(null);
  const [delTarget, setDelTarget]       = useState<UserItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserItem | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) &&
      (!filterRole   || u.role   === filterRole) &&
      (!filterBranch || u.branch === filterBranch)
    );
  }, [users, search, filterRole, filterBranch]);

  const hasFilter  = search || filterRole || filterBranch;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));
  const resetFilters = () => { setSearch(''); setFilterRole(''); setFilterBranch(''); setPage(1); };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = (data: Omit<UserItem, 'id'>) => {
    setUsers(prev => [{ ...data, id: Date.now() }, ...prev]);
    setShowCreate(false);
    setPage(1);
    showToast(`User "${data.name}" berhasil dibuat!`);
  };

  const handleUpdate = (data: Omit<UserItem, 'id'>) => {
    if (!editTarget) return;
    setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...data, id: u.id } : u));
    setEditTarget(null);
    setDetailTarget(null);
    showToast(`User "${data.name}" berhasil diupdate!`);
  };

  const handleDelete = () => {
    if (!delTarget) return;
    const name = delTarget.name;
    setUsers(prev => prev.filter(u => u.id !== delTarget.id));
    setDelTarget(null);
    setDetailTarget(null);
    if (paged.length === 1 && page > 1) setPage(p => p - 1);
    showToast(`User "${name}" berhasil dihapus.`, 'error');
  };

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
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">Manage all users, roles, and branch assignments.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value); setPage(1); }}
              className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                filterRole ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={filterBranch}
              onChange={e => { setFilterBranch(e.target.value); setPage(1); }}
              className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                filterBranch ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              <option value="">All Branches</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['User', 'Role', 'Branch', 'Status', 'Last Login', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-slate-600 font-semibold ${i === 5 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${
                        user.role === 'Admin Cabang' ? 'text-purple-500' :
                        user.role === 'Trainer'      ? 'text-blue-500' : 'text-slate-400'
                      }`} />
                      <span className="text-slate-700">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{user.branch}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDelTarget(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                        title="Hapus user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTarget(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                        title="Detail user"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada user yang ditemukan.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      Reset semua filter
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-slate-500">
            {filtered.length === 0
              ? 'Tidak ada hasil'
              : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length} users`
            }
            {hasFilter && <span className="text-blue-500 font-medium ml-1">(filtered)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="px-1 text-slate-400 text-xs">…</span>
                : <button
                    key={p}
                    type="button"
                    onClick={() => goPage(Number(p))}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                      page === p
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
            )}
            <button
              type="button"
              onClick={() => goPage(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals & Dialogs ── */}
      <UserModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreate}
        initialData={null}
      />
      <UserModal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSuccess={handleUpdate}
        initialData={editTarget}
      />
      {delTarget && (
        <DeleteDialog
          user={delTarget}
          onCancel={() => setDelTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      {detailTarget && (
        <DetailDrawer
          user={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); }}
        />
      )}
    </div>
  );
}
