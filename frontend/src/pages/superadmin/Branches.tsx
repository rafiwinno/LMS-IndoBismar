import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, MapPin, Users, Edit2, Trash2, Shield, X,
  Building2, Hash, ChevronLeft, ChevronRight, Phone, Download,
  Eye, Loader2, AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import type { Branch, BranchUser, BranchUserRole, BranchUsersResponse } from '../types/cabang';

const PER_PAGE = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle  = (s: Branch['status']) =>
  s === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500';
const statusDot    = (s: Branch['status']) =>
  s === 'aktif' ? 'bg-emerald-500' : 'bg-slate-400';
const statusLabel  = (s: Branch['status']) =>
  s === 'aktif' ? 'ACTIVE' : 'INACTIVE';

const getInitials = (nama: string) =>
  nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const AVATAR_PALETTE = [
  '#2563EB','#7C3AED','#059669','#D97706',
  '#DC2626','#0891B2','#65A30D','#DB2777',
];
const avatarColor = (nama: string) =>
  AVATAR_PALETTE[nama.charCodeAt(0) % AVATAR_PALETTE.length];

// ─── Role Config ──────────────────────────────────────────────────────────────
// id_role: 1=superadmin | 2=admin | 3=trainer | 4=user
const ROLE_ORDER: BranchUserRole[] = ['admin', 'trainer', 'user'];

const ROLE_CFG: Record<BranchUserRole, {
  label: string;
  sectionBg: string;
  sectionText: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
}> = {
  superadmin: {
    label: 'Superadmin',
    sectionBg: 'bg-rose-50', sectionText: 'text-rose-700',
    badgeBg: 'bg-rose-100',  badgeText: 'text-rose-700',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  admin: {
    label: 'Admin',
    sectionBg: 'bg-blue-50',  sectionText: 'text-blue-700',
    badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  trainer: {
    label: 'Trainer',
    sectionBg: 'bg-violet-50', sectionText: 'text-violet-700',
    badgeBg: 'bg-violet-100',  badgeText: 'text-violet-700',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  user: {
    label: 'User',
    sectionBg: 'bg-slate-50', sectionText: 'text-slate-600',
    badgeBg: 'bg-slate-100',  badgeText: 'text-slate-500',
    icon: <Users className="w-3.5 h-3.5" />,
  },
};

// ─── Users Modal ──────────────────────────────────────────────────────────────
function UsersModal({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const [users,   setUsers]   = useState<BranchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<BranchUsersResponse>(
          `/superadmin/cabang/${branch.id}/users`,
          { signal: controller.signal },
        );
        setUsers(res.data.data ?? []);
      } catch (err: any) {
        if (err.name !== 'CanceledError')
          setError(err.response?.data?.message ?? 'Gagal memuat data user.');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [branch.id]);

  const grouped = ROLE_ORDER.reduce<Record<BranchUserRole, BranchUser[]>>(
    (acc, role) => { acc[role] = users.filter(u => u.role === role); return acc; },
    { admin: [], trainer: [], user: [], superadmin: [] },
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      style={{ animation: 'fadeInBg .2s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: '88vh', animation: 'scaleIn .25s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            {/* branch badge */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg leading-tight">{branch.nama_cabang}</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {loading ? 'Memuat…' : (
                  <span>
                    <span className="font-semibold text-slate-600">{users.length}</span> user terdaftar
                    {!loading && [
                      { role: 'admin', label: 'admin' },
                      { role: 'trainer', label: 'trainer' },
                      { role: 'user', label: 'user' },
                    ].filter(r => grouped[r.role as BranchUserRole]?.length > 0)
                     .map(r => ` · ${grouped[r.role as BranchUserRole].length} ${r.label}`)
                     .join('')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button" onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-400">Memuat data user…</p>
            </div>
          )}

          {/* error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-slate-500 text-center">{error}</p>
            </div>
          )}

          {/* empty */}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Users className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-400">Belum ada user di cabang ini.</p>
            </div>
          )}

          {/* grouped — 3 kolom grid per section */}
          {!loading && !error && users.length > 0 && (
            <div className="p-6 space-y-7">
              {ROLE_ORDER.map(role => {
                const group = grouped[role];
                if (group.length === 0) return null;
                const cfg = ROLE_CFG[role];
                return (
                  <section key={role}>
                    {/* section header */}
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-4 ${cfg.sectionBg}`}>
                      <span className={cfg.sectionText}>{cfg.icon}</span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${cfg.sectionText}`}>
                        {cfg.label}
                      </span>
                      <span className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                        {group.length}
                      </span>
                    </div>

                    {/* 3-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
                        >
                          {/* avatar */}
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: avatarColor(user.nama) }}
                          >
                            {getInitials(user.nama)}
                          </div>

                          {/* info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.nama}</p>
                            <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                            {/* status */}
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'aktif' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                              <span className={`text-[10px] font-semibold ${user.status === 'aktif' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {user.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && !error && users.length > 0 && (
          <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              {ROLE_ORDER.filter(r => grouped[r].length > 0).map(role => {
                const cfg = ROLE_CFG[role];
                return (
                  <span key={role} className={`flex items-center gap-1.5 font-medium ${cfg.sectionText}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.badgeBg}`} />
                    {grouped[role].length} {cfg.label}
                  </span>
                );
              })}
            </div>
            <button
              type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInBg { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}

// ─── Branch Modal (Create / Edit) ─────────────────────────────────────────────
interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Branch | null;
  cities: string[];
}

function BranchModal({ isOpen, onClose, onSuccess, initialData, cities }: BranchModalProps) {
  const isEdit = Boolean(initialData);
  const [namaCabang, setNamaCabang] = useState('');
  const [kode,       setKode]       = useState('');
  const [kota,       setKota]       = useState('');
  const [alamat,     setAlamat]     = useState('');
  const [telepon,    setTelepon]    = useState('');
  const [status,     setStatus]     = useState<Branch['status']>('aktif');
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setNamaCabang(initialData.nama_cabang);
      setKode(initialData.kode === '-' ? '' : initialData.kode);
      setKota(initialData.kota);
      setAlamat(initialData.alamat === '-' ? '' : initialData.alamat);
      setTelepon(initialData.telepon === '-' ? '' : initialData.telepon);
      setStatus(initialData.status);
    } else {
      setNamaCabang(''); setKode(''); setKota('');
      setAlamat(''); setTelepon(''); setStatus('aktif');
    }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const clearErr = (k: string) => setErrors(e => ({ ...e, [k]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!namaCabang.trim()) e.namaCabang = 'Nama cabang wajib diisi';
    if (!kota.trim())       e.kota       = 'Kota wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        nama_cabang: namaCabang,
        kode:    kode    || null,
        kota,
        alamat:  alamat  || null,
        telepon: telepon || null,
        status,
      };
      if (isEdit && initialData) {
        await api.put(`/superadmin/cabang/${initialData.id}`, payload);
      } else {
        await api.post('/superadmin/cabang', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (k: string) =>
    `w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors[k] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}`;

  const KOTA_GROUPS: Record<string, string[]> = {
    'Jawa Timur':  ['Surabaya','Malang','Sidoarjo','Gresik','Mojokerto','Pasuruan','Probolinggo','Blitar','Kediri','Madiun','Batu','Jember','Banyuwangi','Bondowoso','Situbondo','Lumajang','Jombang','Nganjuk','Tulungagung','Trenggalek','Ponorogo','Magetan','Ngawi','Bojonegoro','Tuban','Lamongan','Bangkalan','Sampang','Pamekasan','Sumenep','Pacitan'],
    'Jawa Barat':  ['Bandung','Bekasi','Depok','Bogor','Cimahi','Tasikmalaya','Cirebon','Sukabumi','Banjar','Cilegon','Garut','Ciamis','Kuningan','Majalengka','Subang','Purwakarta','Karawang','Indramayu'],
    'Jawa Tengah': ['Semarang','Solo','Yogyakarta','Magelang','Pekalongan','Tegal','Salatiga','Purwokerto','Cilacap','Kudus','Jepara','Demak','Ungaran','Klaten','Boyolali','Sukoharjo','Wonogiri','Purworejo','Kebumen','Banjarnegara','Wonosobo','Temanggung','Kendal','Batang','Pemalang','Brebes','Rembang','Blora','Grobogan','Sragen','Karanganyar'],
    'DKI Jakarta': ['Jakarta Pusat','Jakarta Utara','Jakarta Barat','Jakarta Selatan','Jakarta Timur'],
    'Banten':      ['Tangerang','Tangerang Selatan','Serang','Cilegon'],
    'Sumatera':    ['Medan','Palembang','Pekanbaru','Batam','Padang','Banda Aceh','Bandar Lampung','Jambi','Bengkulu','Pangkalpinang','Tanjungpinang','Dumai','Binjai','Tebing Tinggi','Pematangsiantar','Sibolga','Padangsidimpuan','Gunungsitoli'],
    'Kalimantan':  ['Balikpapan','Samarinda','Banjarmasin','Pontianak','Palangkaraya','Bontang','Tarakan','Singkawang','Kotabaru','Banjarbaru'],
    'Sulawesi':    ['Makassar','Manado','Kendari','Palu','Gorontalo','Ambon','Ternate','Mamuju','Pare-Pare','Palopo','Bau-Bau'],
    'Bali & NTT':  ['Denpasar','Mataram','Kupang','Singaraja','Gianyar','Tabanan','Negara','Sumbawa','Bima','Maumere','Ende','Ruteng','Labuan Bajo','Waingapu'],
    'Papua & Maluku': ['Jayapura','Sorong','Manokwari','Merauke','Timika','Biak','Nabire','Ambon','Ternate','Tual','Sofifi'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Branch' : 'Create Branch'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Ubah data cabang' : 'Tambah cabang baru ke sistem'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {errors.general && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.general}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nama Cabang <span className="text-red-500">*</span></label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('namaCabang')} placeholder="Contoh: Surabaya Pusat"
                value={namaCabang} onChange={e => { setNamaCabang(e.target.value); clearErr('namaCabang'); }} />
            </div>
            {errors.namaCabang && <p className="text-xs text-red-500 mt-1">{errors.namaCabang}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kode Cabang</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={inputCls('kode')} placeholder="SBY-01"
                  value={kode} onChange={e => { setKode(e.target.value.toUpperCase()); clearErr('kode'); }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kota <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.kota ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                  value={kota} onChange={e => { setKota(e.target.value); clearErr('kota'); }}>
                  <option value="">Pilih Kota</option>
                  {Object.entries(KOTA_GROUPS).map(([group, kotaList]) => (
                    <optgroup key={group} label={group}>
                      {kotaList.map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              {errors.kota && <p className="text-xs text-red-500 mt-1">{errors.kota}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Alamat</label>
            <textarea
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
              placeholder="Jl. Basuki Rahmat No. 10" rows={2}
              value={alamat} onChange={e => setAlamat(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inputCls('telepon')} placeholder="031-xxxxxxx" type="tel"
                value={telepon} onChange={e => setTelepon(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-2">
              {(['aktif', 'nonaktif'] as Branch['status'][]).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    status === s
                      ? s === 'aktif' ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                      : 'bg-slate-100 border-slate-300 text-slate-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}>
                  {s === 'aktif' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Batal
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
            {loading
              ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Menyimpan…</>
              : isEdit ? '✓ Simpan Perubahan' : '+ Create Branch'}
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
          Cabang <span className="font-semibold text-slate-700">{branch.nama_cabang}</span> ({branch.kode}) akan dihapus permanen.
        </p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
          <button type="button" onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
interface DetailDrawerProps {
  branch: Branch;
  onClose: () => void;
  onEdit: () => void;
  onViewUsers: () => void;
}

function DetailDrawer({ branch, onClose, onEdit, onViewUsers }: DetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white h-full w-80 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">Detail Cabang</span>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* hero card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white mb-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-lg leading-tight">{branch.nama_cabang}</p>
                <p className="text-blue-200 text-xs font-mono mt-1">{branch.kode}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                branch.status === 'aktif' ? 'bg-emerald-400/30 text-emerald-100' : 'bg-slate-400/30 text-slate-200'
              }`}>{statusLabel(branch.status)}</span>
            </div>

            {/* total users + tombol lihat user */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{branch.total_users.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs">Total Users</p>
                </div>
              </div>

              {/* ── TOMBOL LIHAT USER (di hero card) ── */}
              <button
                type="button" onClick={onViewUsers}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white border border-white/30 bg-white/15 hover:bg-white/25 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Lihat User
              </button>
            </div>
          </div>

          {/* info rows */}
          {([
            ['Kota',    branch.kota,    MapPin],
            ['Alamat',  branch.alamat,  Building2],
            ['Telepon', branch.telepon, Phone],
            ['Admin',   branch.admin,   Shield],
          ] as [string, string, React.ElementType][]).map(([label, value, Icon]) => (
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

        {/* footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button" onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Cabang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Branches() {
  const [branches, setBranches]         = useState<Branch[]>([]);
  const [cities,   setCities]           = useState<string[]>([]);
  const [loading,  setLoading]          = useState(true);
  const [exporting, setExporting]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKota,   setFilterKota]   = useState('');
  const [page, setPage]                 = useState(1);
  const [totalAll,    setTotalAll]      = useState(0);
  const [activeCount, setActiveCount]   = useState(0);

  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<Branch | null>(null);
  const [delTarget,    setDelTarget]    = useState<Branch | null>(null);
  const [detailTarget, setDetailTarget] = useState<Branch | null>(null);
  const [usersTarget,  setUsersTarget]  = useState<Branch | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterKota)   params.kota   = filterKota;

      const res = await api.get('/superadmin/cabang', { params });
      setBranches(res.data.data);
      setTotalAll(res.data.total);
      setActiveCount(res.data.active);
      setCities(res.data.cities ?? []);
    } catch {
      showToast('Gagal memuat data cabang.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterKota]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);
  useEffect(() => { setPage(1); }, [search, filterStatus, filterKota]);

  const totalPages = Math.max(1, Math.ceil(branches.length / PER_PAGE));
  const paged      = branches.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilter  = search || filterStatus || filterKota;
  const totalUsers = branches.reduce((s, b) => s + b.total_users, 0);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterKota)   params.kota   = filterKota;

      const res  = await api.get('/superadmin/cabang', { params });
      const data: Branch[] = res.data.data;
      if (!data.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }

      const headers = ['No','Nama Cabang','Kode','Kota','Alamat','Telepon','Admin','Total Users','Status'];
      const rows    = data.map((b, i) => [
        i + 1, `"${b.nama_cabang}"`, b.kode, b.kota,
        `"${b.alamat}"`, b.telepon, `"${b.admin}"`, b.total_users,
        b.status === 'aktif' ? 'Active' : 'Inactive',
      ]);

      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `branches_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast(`${data.length} cabang berhasil diekspor!`);
    } catch {
      showToast('Gagal mengekspor data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await api.delete(`/superadmin/cabang/${delTarget.id}`);
      setDelTarget(null); setDetailTarget(null);
      showToast(`Cabang "${delTarget.nama_cabang}" berhasil dihapus.`, 'error');
      fetchBranches();
    } catch (err: any) {
      setDelTarget(null);
      showToast(err.response?.data?.message || 'Gagal menghapus cabang.', 'error');
    }
  };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)               return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3)  return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const resetFilters = () => { setSearch(''); setFilterStatus(''); setFilterKota(''); setPage(1); };

  // Buka UsersModal — tutup DetailDrawer dulu agar tidak overlap
  const openUsersModal = (branch: Branch) => {
    setDetailTarget(null);
    setUsersTarget(branch);
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[70] flex items-center gap-2 bg-white border border-slate-200 border-l-4 ${
          toast.type === 'success' ? 'border-l-emerald-500 text-emerald-700' : 'border-l-red-500 text-red-700'
        } rounded-xl px-5 py-3 shadow-lg text-sm font-medium`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Branch Management</h2>
          <p className="text-slate-500 mt-1">
            Mengelola <span className="font-semibold text-slate-700">{totalAll} cabang</span> — {activeCount} aktif, total {totalUsers.toLocaleString()} users.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="w-4 h-4" /> Create Branch
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, code, or city..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterStatus ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}>
            <option value="">All Status</option>
            <option value="aktif">Active</option>
            <option value="nonaktif">Inactive</option>
          </select>
          <select value={filterKota} onChange={e => setFilterKota(e.target.value)}
            className={`flex-1 sm:flex-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterKota ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilter && (
            <button type="button" onClick={resetFilters}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors">Reset</button>
          )}
          <button type="button" onClick={handleExportCSV} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap">
            {exporting
              ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Mengekspor…</>
              : <><Download className="w-4 h-4" /> Export CSV</>}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              {[2, 1, 3, 2].map((w, j) => (
                <div key={j} className={`h-${j === 0 ? 5 : 3} bg-slate-100 animate-pulse rounded w-${w}/3`} />
              ))}
            </div>
          ))}
        </div>
      ) : paged.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paged.map(branch => (
            <div key={branch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">{branch.nama_cabang}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${statusStyle(branch.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(branch.status)}`} />
                        {statusLabel(branch.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">{branch.kode}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => setEditTarget(branch)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setDelTarget(branch)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2">{branch.alamat}, {branch.kota}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Admin: <span className="font-medium text-slate-900">{branch.admin}</span></span>
                  </div>
                </div>
              </div>

              {/* card footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 leading-none">Total Users</p>
                    <p className="text-base font-bold text-slate-900">{branch.total_users.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* shortcut icon lihat user langsung dari card */}
                  <button type="button" onClick={() => openUsersModal(branch)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors"
                    title="Lihat user cabang">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setDetailTarget(branch)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Lihat detail →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium">Tidak ada cabang yang ditemukan.</p>
          {hasFilter && <button type="button" onClick={resetFilters} className="text-xs text-blue-600 hover:underline mt-1">Reset semua filter</button>}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-slate-500">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, branches.length)} of {branches.length} cabang
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
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals & Drawers ── */}
      <BranchModal isOpen={showCreate} onClose={() => setShowCreate(false)}
        onSuccess={() => { showToast('Cabang berhasil dibuat!'); fetchBranches(); }}
        initialData={null} cities={cities} />

      <BranchModal isOpen={editTarget !== null} onClose={() => setEditTarget(null)}
        onSuccess={() => { showToast('Cabang berhasil diupdate!'); fetchBranches(); }}
        initialData={editTarget} cities={cities} />

      {delTarget && (
        <DeleteDialog branch={delTarget} onCancel={() => setDelTarget(null)} onConfirm={handleDelete} />
      )}

      {detailTarget && (
        <DetailDrawer
          branch={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null); }}
          onViewUsers={() => openUsersModal(detailTarget)}
        />
      )}

      {/* UsersModal — z-[60] di atas DrawerDetail z-50 */}
      {usersTarget && (
        <UsersModal branch={usersTarget} onClose={() => setUsersTarget(null)} />
      )}
    </div>
  );
}