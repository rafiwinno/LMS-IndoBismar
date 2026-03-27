import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, MapPin, Users, Edit2, Trash2, Shield, X,
  Building2, Hash, ChevronLeft, ChevronRight, Phone, Download,
  Eye, Loader2, AlertCircle, SlidersHorizontal,
} from 'lucide-react';
import api from '../../services/api';
import type { Branch, BranchUser, BranchUserRole, BranchUsersResponse } from '../types/cabang';

const PER_PAGE = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (n: string) => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

const AVATAR_PALETTE = ['#2563EB','#7C3AED','#059669','#D97706','#DC2626','#0891B2','#65A30D','#DB2777'];
const avatarColor = (n: string) => AVATAR_PALETTE[n.charCodeAt(0) % AVATAR_PALETTE.length];

const Skel = ({ className='' }) => <div className={`bg-muted animate-pulse rounded ${className}`} />;

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_ORDER: BranchUserRole[] = ['admin', 'trainer', 'user'];
const ROLE_CFG: Record<BranchUserRole, { label:string; sectionBg:string; sectionText:string; badgeBg:string; badgeText:string; }> = {
  superadmin: { label:'Superadmin', sectionBg:'bg-rose-50',   sectionText:'text-rose-700',   badgeBg:'bg-rose-100',   badgeText:'text-rose-700' },
  admin:      { label:'Admin',      sectionBg:'bg-purple-50', sectionText:'text-purple-700', badgeBg:'bg-purple-100', badgeText:'text-purple-700' },
  trainer:    { label:'Trainer',    sectionBg:'bg-blue-50',   sectionText:'text-blue-700',   badgeBg:'bg-blue-100',   badgeText:'text-blue-700' },
  user:       { label:'User',       sectionBg:'bg-muted',  sectionText:'text-secondary',  badgeBg:'bg-muted',  badgeText:'text-label' },
};

// ─── Users Modal ──────────────────────────────────────────────────────────────
function UsersModal({ branch, onClose }: { branch: Branch; onClose: ()=>void }) {
  const [users,   setUsers]   = useState<BranchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string|null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await api.get<BranchUsersResponse>(`/superadmin/cabang/${branch.id}/users`,{ signal:ctrl.signal });
        setUsers(res.data.data ?? []);
      } catch (err: any) {
        if (err.name !== 'CanceledError') setError(err.response?.data?.message ?? 'Gagal memuat user.');
      } finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, [branch.id]);

  const grouped = ROLE_ORDER.reduce<Record<BranchUserRole, BranchUser[]>>(
    (acc, role) => { acc[role] = users.filter(u=>u.role===role); return acc; },
    { admin:[], trainer:[], user:[], superadmin:[] },
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-subtle"
        style={{ maxHeight:'88vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-muted/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Users size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-tight">{branch.nama_cabang}</p>
              <p className="text-xs text-muted mt-0.5">
                {loading ? 'Memuat…' : (
                  <span>
                    <span className="font-semibold text-secondary">{users.length}</span> user terdaftar
                    {ROLE_ORDER.filter(r=>grouped[r].length>0).map(r=>` · ${grouped[r].length} ${ROLE_CFG[r].label.toLowerCase()}`).join('')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg bg-muted hover:bg-slate-200 text-label transition-colors">
            <X size={15}/>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
              <p className="text-xs text-muted">Memuat data…</p>
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-xs text-label">{error}</p>
            </div>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Users size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-muted">Belum ada user di cabang ini</p>
            </div>
          )}
          {!loading && !error && users.length > 0 && (
            <div className="p-5 space-y-6">
              {ROLE_ORDER.map(role => {
                const group = grouped[role];
                if (!group.length) return null;
                const cfg = ROLE_CFG[role];
                return (
                  <section key={role}>
                    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl mb-3 ${cfg.sectionBg}`}>
                      <Shield size={12} className={cfg.sectionText} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.sectionText}`}>{cfg.label}</span>
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>{group.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.map(user => (
                        <div key={user.id}
                          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-subtle hover:border-blue-200 hover:shadow-sm transition-all">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: avatarColor(user.nama) }}>
                            {getInitials(user.nama)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary truncate">{user.nama}</p>
                            <p className="text-[10px] text-muted truncate">@{user.username}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status==='aktif'?'bg-emerald-400':'bg-slate-300'}`} />
                              <span className={`text-[10px] font-semibold ${user.status==='aktif'?'text-emerald-600':'text-muted'}`}>
                                {user.status==='aktif'?'Aktif':'Nonaktif'}
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

        {/* Footer */}
        {!loading && !error && users.length > 0 && (
          <div className="px-6 py-3.5 border-t border-subtle bg-muted/40 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ROLE_ORDER.filter(r=>grouped[r].length>0).map(role => {
                const cfg = ROLE_CFG[role];
                return (
                  <span key={role} className={`text-[10px] font-bold flex items-center gap-1 ${cfg.sectionText}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.badgeBg}`} />
                    {grouped[role].length} {cfg.label}
                  </span>
                );
              })}
            </div>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors">
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Branch Modal ─────────────────────────────────────────────────────────────
const KOTA_GROUPS: Record<string, string[]> = {
  'Jawa Timur':     ['Surabaya','Malang','Sidoarjo','Gresik','Mojokerto','Pasuruan','Probolinggo','Blitar','Kediri','Madiun','Batu','Jember','Banyuwangi','Bondowoso','Situbondo','Lumajang','Jombang','Nganjuk','Tulungagung','Trenggalek','Ponorogo','Magetan','Ngawi','Bojonegoro','Tuban','Lamongan','Bangkalan','Sampang','Pamekasan','Sumenep','Pacitan'],
  'Jawa Barat':     ['Bandung','Bekasi','Depok','Bogor','Cimahi','Tasikmalaya','Cirebon','Sukabumi','Banjar','Garut','Ciamis','Kuningan','Majalengka','Subang','Purwakarta','Karawang','Indramayu'],
  'Jawa Tengah':    ['Semarang','Solo','Yogyakarta','Magelang','Pekalongan','Tegal','Salatiga','Purwokerto','Cilacap','Kudus','Jepara','Demak','Klaten','Boyolali','Sukoharjo','Wonogiri','Purworejo','Kebumen','Banjarnegara','Wonosobo','Temanggung','Kendal','Batang','Pemalang','Brebes','Rembang','Blora','Grobogan','Sragen','Karanganyar'],
  'DKI Jakarta':    ['Jakarta Pusat','Jakarta Utara','Jakarta Barat','Jakarta Selatan','Jakarta Timur'],
  'Banten':         ['Tangerang','Tangerang Selatan','Serang','Cilegon'],
  'Sumatera':       ['Medan','Palembang','Pekanbaru','Batam','Padang','Banda Aceh','Bandar Lampung','Jambi','Bengkulu','Pangkalpinang','Tanjungpinang','Dumai','Binjai'],
  'Kalimantan':     ['Balikpapan','Samarinda','Banjarmasin','Pontianak','Palangkaraya','Bontang','Tarakan','Singkawang','Banjarbaru'],
  'Sulawesi':       ['Makassar','Manado','Kendari','Palu','Gorontalo','Ambon','Mamuju','Pare-Pare','Palopo'],
  'Bali & NTT':     ['Denpasar','Mataram','Kupang','Singaraja','Gianyar','Tabanan','Sumbawa','Bima','Labuan Bajo'],
  'Papua & Maluku': ['Jayapura','Sorong','Manokwari','Merauke','Timika','Biak','Ambon','Ternate'],
};

function BranchModal({ isOpen, onClose, onSuccess, initialData, cities }:
  { isOpen:boolean; onClose:()=>void; onSuccess:()=>void; initialData?:Branch|null; cities:string[] }) {
  const isEdit = Boolean(initialData);
  const [namaCabang,setNamaCabang]=useState(''); const [kode,setKode]=useState('');
  const [kota,setKota]=useState(''); const [alamat,setAlamat]=useState('');
  const [telepon,setTelepon]=useState(''); const [status,setStatus]=useState<Branch['status']>('aktif');
  const [errors,setErrors]=useState<Record<string,string>>({}); const [loading,setLoading]=useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setNamaCabang(initialData.nama_cabang); setKode(initialData.kode==='-'?'':initialData.kode);
      setKota(initialData.kota); setAlamat(initialData.alamat==='-'?'':initialData.alamat);
      setTelepon(initialData.telepon==='-'?'':initialData.telepon); setStatus(initialData.status);
    } else { setNamaCabang(''); setKode(''); setKota(''); setAlamat(''); setTelepon(''); setStatus('aktif'); }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;
  const ce = (k:string) => setErrors(e=>({...e,[k]:''}));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!namaCabang.trim()) e.namaCabang='Nama cabang wajib diisi';
    if (!kota.trim()) e.kota='Kota wajib dipilih';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { nama_cabang:namaCabang, kode:kode||null, kota, alamat:alamat||null, telepon:telepon||null, status };
      if (isEdit && initialData) await api.put(`/superadmin/cabang/${initialData.id}`,payload);
      else await api.post('/superadmin/cabang',payload);
      onSuccess(); onClose();
    } catch (err:any) { setErrors({general:err.response?.data?.message||'Terjadi kesalahan.'}); }
    finally { setLoading(false); }
  };

  const inp = (k:string) => `w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors[k]?'border-red-300 bg-red-50':'border-slate-200 bg-white'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-subtle">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Building2 size={16} className="text-blue-600"/>
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">{isEdit?'Edit Cabang':'Tambah Cabang Baru'}</h2>
              <p className="text-xs text-muted">{isEdit?'Ubah data cabang':'Tambah cabang baru ke sistem'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-muted transition-colors"><X size={15}/></button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-3">
          {errors.general && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.general}</p>}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Nama Cabang <span className="text-red-500">*</span></label>
            <div className="relative"><Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
              <input className={inp('namaCabang')} placeholder="Contoh: Surabaya Pusat"
                value={namaCabang} onChange={e=>{setNamaCabang(e.target.value);ce('namaCabang')}}/>
            </div>
            {errors.namaCabang && <p className="text-xs text-red-500 mt-0.5">{errors.namaCabang}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Kode Cabang</label>
              <div className="relative"><Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
                <input className={inp('kode')} placeholder="SBY-01"
                  value={kode} onChange={e=>{setKode(e.target.value.toUpperCase());ce('kode')}}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Kota <span className="text-red-500">*</span></label>
              <div className="relative"><MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
                <select className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.kota?'border-red-300 bg-red-50':'border-slate-200'}`}
                  value={kota} onChange={e=>{setKota(e.target.value);ce('kota')}}>
                  <option value="">Pilih Kota</option>
                  {Object.entries(KOTA_GROUPS).map(([group,list])=>(
                    <optgroup key={group} label={group}>
                      {list.map(c=><option key={c}>{c}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              {errors.kota && <p className="text-xs text-red-500 mt-0.5">{errors.kota}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Alamat</label>
            <textarea className="w-full px-3 py-2 rounded-lg border border-theme text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
              placeholder="Jl. Basuki Rahmat No. 10" rows={2}
              value={alamat} onChange={e=>setAlamat(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Telepon</label>
            <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
              <input type="tel" className={inp('telepon')} placeholder="031-xxxxxxx"
                value={telepon} onChange={e=>setTelepon(e.target.value)}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">Status Cabang</label>
            <div className="flex gap-2">
              {(['aktif','nonaktif'] as Branch['status'][]).map(s=>(
                <button key={s} type="button" onClick={()=>setStatus(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    status===s ? s==='aktif' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-700 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-label hover:border-slate-300'}`}>
                  {s==='aktif'?'Aktif':'Nonaktif'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-subtle bg-muted/50">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-theme text-xs font-semibold text-secondary hover:bg-muted transition-colors">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-60 transition-colors shadow-sm">
            {loading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Menyimpan…</>
              : isEdit ? 'Simpan Perubahan' : 'Buat Cabang'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ branch, onCancel, onConfirm }:{ branch:Branch; onCancel:()=>void; onConfirm:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onCancel()}}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center border border-subtle">
        <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={18} className="text-red-600"/>
        </div>
        <h3 className="text-sm font-bold text-primary">Hapus Cabang?</h3>
        <p className="text-xs text-label mt-2">
          Cabang <span className="font-semibold text-secondary">"{branch.nama_cabang}"</span> ({branch.kode}) akan dihapus permanen.
        </p>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-theme text-xs font-semibold text-secondary hover:bg-muted transition-colors">Batal</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ branch, onClose, onEdit, onViewUsers }:
  { branch:Branch; onClose:()=>void; onEdit:()=>void; onViewUsers:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white h-full w-72 flex flex-col shadow-2xl border-l border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-subtle bg-muted/50">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Detail Cabang</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted transition-colors"><X size={15}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Hero */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-base leading-tight">{branch.nama_cabang}</p>
                <p className="text-muted text-xs font-mono mt-1">{branch.kode}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                branch.status==='aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-muted0/20 text-muted'
              }`}>{branch.status==='aktif'?'AKTIF':'NONAKTIF'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{branch.total_users.toLocaleString()}</p>
                <p className="text-muted text-xs">Total Users</p>
              </div>
              <button type="button" onClick={onViewUsers}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all">
                <Eye size={13}/> Lihat User
              </button>
            </div>
          </div>

          {/* Info */}
          {([['Kota',    branch.kota,    MapPin], ['Alamat',branch.alamat,Building2], ['Telepon',branch.telepon,Phone], ['Admin',branch.admin,Shield]] as [string,string,any][]).map(([label,value,Icon])=>(
            <div key={label} className="flex gap-3 py-3 border-b border-slate-50">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-label"/>
              </div>
              <div>
                <p className="text-[10px] text-muted">{label}</p>
                <p className="text-xs font-semibold text-secondary mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-subtle">
          <button type="button" onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors">
            <Edit2 size={13}/> Edit Cabang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Branch Card ──────────────────────────────────────────────────────────────
function BranchCard({ branch, onEdit, onDelete, onDetail, onUsers }:
  { branch:Branch; onEdit:()=>void; onDelete:()=>void; onDetail:()=>void; onUsers:()=>void }) {
  return (
    <div className="card rounded-xl hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col group">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm font-bold text-primary truncate leading-tight">{branch.nama_cabang}</h3>
            <p className="text-[10px] text-muted font-mono mt-0.5">{branch.kode}</p>
          </div>
          {/* actions — visible on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button type="button" onClick={onEdit}
              className="p-1.5 text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
              <Edit2 size={13}/>
            </button>
            <button type="button" onClick={onDelete}
              className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
              <Trash2 size={13}/>
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            branch.status==='aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-label border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${branch.status==='aktif'?'bg-emerald-500':'bg-slate-300'}`}/>
            {branch.status==='aktif'?'Aktif':'Nonaktif'}
          </span>
        </div>

        {/* Info rows */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-muted mt-0.5 shrink-0"/>
            <span className="text-xs text-secondary line-clamp-2">{branch.alamat}, {branch.kota}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-muted shrink-0"/>
            <span className="text-xs text-secondary truncate">Admin: <span className="font-semibold text-primary">{branch.admin}</span></span>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-subtle bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users size={12} className="text-blue-600"/>
          </div>
          <div>
            <p className="text-[10px] text-muted leading-none">Total Users</p>
            <p className="text-sm font-bold text-primary">{branch.total_users.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onUsers}
            className="p-1.5 rounded-lg text-muted hover:text-blue-600 hover:bg-blue-50 transition-all" title="Lihat user">
            <Eye size={13}/>
          </button>
          <button type="button" onClick={onDetail}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Detail →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Branches() {
  const [branches,     setBranches]     = useState<Branch[]>([]);
  const [cities,       setCities]       = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKota,   setFilterKota]   = useState('');
  const [page,         setPage]         = useState(1);
  const [totalAll,     setTotalAll]     = useState(0);
  const [activeCount,  setActiveCount]  = useState(0);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<Branch|null>(null);
  const [delTarget,    setDelTarget]    = useState<Branch|null>(null);
  const [detailTarget, setDetailTarget] = useState<Branch|null>(null);
  const [usersTarget,  setUsersTarget]  = useState<Branch|null>(null);
  const [toast,        setToast]        = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = (msg:string, type:'success'|'error'='success') => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (search) params.search=search; if (filterStatus) params.status=filterStatus; if (filterKota) params.kota=filterKota;
      const res = await api.get('/superadmin/cabang',{params});
      setBranches(res.data.data); setTotalAll(res.data.total);
      setActiveCount(res.data.active); setCities(res.data.cities??[]);
    } catch { showToast('Gagal memuat data cabang.','error'); }
    finally { setLoading(false); }
  },[search,filterStatus,filterKota]);

  useEffect(()=>{ fetchBranches(); },[fetchBranches]);
  useEffect(()=>{ setPage(1); },[search,filterStatus,filterKota]);

  const totalPages = Math.max(1,Math.ceil(branches.length/PER_PAGE));
  const paged      = branches.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const hasFilter  = search||filterStatus||filterKota;
  const totalUsers = branches.reduce((s,b)=>s+b.total_users,0);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: Record<string,string> = {};
      if (search) params.search=search; if (filterStatus) params.status=filterStatus; if (filterKota) params.kota=filterKota;
      const res = await api.get('/superadmin/cabang',{params});
      const data: Branch[] = res.data.data;
      if (!data.length) { showToast('Tidak ada data.','error'); return; }
      const headers = ['No','Nama Cabang','Kode','Kota','Alamat','Telepon','Admin','Total Users','Status'];
      const rows    = data.map((b,i)=>[i+1,`"${b.nama_cabang}"`,b.kode,b.kota,`"${b.alamat}"`,b.telepon,`"${b.admin}"`,b.total_users,b.status==='aktif'?'Aktif':'Nonaktif']);
      const csv     = [headers.join(','),...rows.map(r=>r.join(','))].join('\n');
      const blob    = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
      const url     = URL.createObjectURL(blob), a = document.createElement('a');
      a.href=url; a.download=`branches_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast(`${data.length} cabang diekspor!`);
    } catch { showToast('Gagal mengekspor.','error'); }
    finally { setExporting(false); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await api.delete(`/superadmin/cabang/${delTarget.id}`);
      setDelTarget(null); setDetailTarget(null);
      showToast(`Cabang "${delTarget.nama_cabang}" dihapus.`,'error');
      fetchBranches();
    } catch (err:any) {
      setDelTarget(null);
      showToast(err.response?.data?.message||'Gagal menghapus.','error');
    }
  };

  const pageNumbers = (): (number|'...')[] => {
    if (totalPages<=7) return Array.from({length:totalPages},(_,i)=>i+1);
    if (page<=4) return [1,2,3,4,5,'...',totalPages];
    if (page>=totalPages-3) return [1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return [1,'...',page-1,page,page+1,'...',totalPages];
  };

  const resetFilters  = () => { setSearch(''); setFilterStatus(''); setFilterKota(''); setPage(1); };
  const openUsersModal = (b:Branch) => { setDetailTarget(null); setUsersTarget(b); };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[70] flex items-center gap-2 bg-white border-l-4 border border-subtle
          ${toast.type==='success'?'border-l-emerald-500 text-emerald-700':'border-l-red-500 text-red-600'}
          rounded-xl px-4 py-3 shadow-xl text-xs font-semibold`}>
          {toast.type==='success'?'✓':'✕'} {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Branch Management</h1>
          <p className="text-xs text-muted mt-0.5">
            <span className="font-semibold text-secondary">{totalAll} cabang</span> — {activeCount} aktif · {totalUsers.toLocaleString()} total user
          </p>
        </div>
        <button type="button" onClick={()=>setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0">
          <Plus size={14}/> Tambah Cabang
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input type="text" placeholder="Cari nama, kode, atau kota..."
            className="w-full pl-9 pr-4 py-2 border border-theme rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-muted hidden sm:block"/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterStatus?'border-blue-300 bg-blue-50 text-blue-700':'border-slate-200 bg-white text-secondary'}`}>
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
          <select value={filterKota} onChange={e=>setFilterKota(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${filterKota?'border-blue-300 bg-blue-50 text-blue-700':'border-slate-200 bg-white text-secondary'}`}>
            <option value="">Semua Kota</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilter && (
            <button type="button" onClick={resetFilters}
              className="px-3 py-2 border border-theme rounded-lg text-xs text-label hover:bg-muted transition-colors">Reset</button>
          )}
          <button type="button" onClick={handleExportCSV} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 border border-theme rounded-lg text-xs font-semibold text-secondary hover:bg-muted disabled:opacity-50 transition-colors">
            {exporting ? <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/> : <Download size={12}/>}
            Export
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="card rounded-xl p-5 space-y-3">
              <Skel className="h-4 w-3/4"/>
              <Skel className="h-3 w-1/4"/>
              <Skel className="h-3 w-full"/>
              <Skel className="h-3 w-2/3"/>
            </div>
          ))}
        </div>
      ) : paged.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(branch=>(
            <BranchCard key={branch.id} branch={branch}
              onEdit={()=>setEditTarget(branch)}
              onDelete={()=>setDelTarget(branch)}
              onDetail={()=>setDetailTarget(branch)}
              onUsers={()=>openUsersModal(branch)}/>
          ))}
        </div>
      ) : (
        <div className="card rounded-xl py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Building2 size={20} className="text-slate-300"/>
          </div>
          <p className="text-sm font-semibold text-muted">Tidak ada cabang</p>
          <p className="text-xs text-slate-300 mt-1">Coba ubah filter atau tambah cabang baru</p>
          {hasFilter && <button type="button" onClick={resetFilters} className="text-xs text-blue-600 hover:underline mt-2">Reset filter</button>}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-muted">
            {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,branches.length)} dari {branches.length} cabang
            {hasFilter && <span className="text-blue-500 font-semibold ml-1">(difilter)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-theme rounded-lg text-xs font-medium text-label hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={13}/> Prev
            </button>
            {pageNumbers().map((p,i)=>
              p==='...' ? <span key={`e${i}`} className="px-1 text-slate-300 text-xs">…</span>
              : <button key={p} type="button" onClick={()=>setPage(Number(p))}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${page===p?'bg-slate-900 border-slate-900 text-white':'border-slate-200 text-label hover:bg-muted'}`}>
                  {p}
                </button>
            )}
            <button type="button" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-theme rounded-lg text-xs font-medium text-label hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BranchModal isOpen={showCreate} onClose={()=>setShowCreate(false)}
        onSuccess={()=>{ showToast('Cabang berhasil dibuat!'); fetchBranches(); }} cities={cities}/>
      <BranchModal isOpen={editTarget!==null} onClose={()=>setEditTarget(null)}
        onSuccess={()=>{ showToast('Cabang berhasil diupdate!'); fetchBranches(); }}
        initialData={editTarget} cities={cities}/>
      {delTarget    && <DeleteDialog branch={delTarget}    onCancel={()=>setDelTarget(null)}    onConfirm={handleDelete}/>}
      {detailTarget && <DetailDrawer branch={detailTarget} onClose={()=>setDetailTarget(null)}  onEdit={()=>{ setEditTarget(detailTarget); setDetailTarget(null); }} onViewUsers={()=>openUsersModal(detailTarget)}/>}
      {usersTarget  && <UsersModal   branch={usersTarget}  onClose={()=>setUsersTarget(null)}/>}
    </div>
  );
}