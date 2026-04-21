import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, MoreVertical,
  Shield, X, ChevronLeft, ChevronRight,
  User, Mail, Lock, Building2, Download,
  Wifi, SlidersHorizontal, Users as UsersIcon,
} from 'lucide-react';
import api from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserItem {
  id: number; nama: string; username: string; email: string | null;
  role: 'admin' | 'trainer' | 'user'; id_role: number; id_cabang: number;
  nama_cabang: string; status: 'aktif' | 'nonaktif';
  last_login: string | null; is_online: boolean;
}
interface Branch { id: number; nama_cabang: string; kota: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (n: string) => n.trim().split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()).join('');
const getRoleLabel = (r: string) => ({ admin:'Admin Cabang', trainer:'Trainer', user:'User' }[r] ?? r);
const ROLE_COLOR: Record<string, string> = {
  admin:   'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  trainer: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  user:    'bg-muted text-secondary border-theme',
};

const parseWIB = (dt: string) =>
  /Z|[+-]\d{2}:\d{2}$/.test(dt) ? new Date(dt) : new Date(dt.replace(' ','T')+'+07:00');

const formatLastLogin = (dt: string | null) => {
  if (!dt) return { relative:'Never', full:'Belum pernah login' };
  const date = parseWIB(dt);
  const diff  = Math.floor((Date.now()-date.getTime())/1000);
  const full  = date.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric',timeZone:'Asia/Jakarta'})
    + ' pukul ' + date.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'}).replace(':','.');
  let relative = diff<60 ? 'Baru saja' : diff<3600 ? `${Math.floor(diff/60)} menit lalu`
    : diff<86400 ? `${Math.floor(diff/3600)} jam lalu` : diff<604800 ? `${Math.floor(diff/86400)} hari lalu`
    : date.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Jakarta'});
  return { relative, full };
};

// ─── Online Badge ─────────────────────────────────────────────────────────────
function OnlineBadge({ isOnline, lastLogin }: { isOnline: boolean; lastLogin: string | null }) {
  const [tip, setTip] = useState(false);
  const { relative, full } = formatLastLogin(lastLogin);
  return (
    <div className="relative inline-flex items-center gap-1.5 cursor-default" onMouseEnter={()=>setTip(true)} onMouseLeave={()=>setTip(false)}>
      {isOnline ? (
        <>
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-muted shrink-0 border border-theme" />
          <span className="text-xs text-label">{relative}</span>
        </>
      )}
      {tip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 whitespace-nowrap pointer-events-none">
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <p className={`font-semibold mb-0.5 ${isOnline?'text-emerald-400':'text-slate-300'}`}>
              {isOnline ? '● Sedang Online' : '● Offline'}
            </p>
            <p className="text-slate-400">{lastLogin ? `Terakhir: ${full}` : 'Belum pernah login'}</p>
          </div>
          <div className="w-2 h-2 bg-slate-900 rotate-45 ml-3 -mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── Skel ─────────────────────────────────────────────────────────────────────
const Skel = ({ className='' }) => <div className={`bg-muted animate-pulse rounded ${className}`} />;

// ─── UserModal ────────────────────────────────────────────────────────────────
function UserModal({ isOpen, onClose, onSuccess, initialData, branches }:
  { isOpen:boolean; onClose:()=>void; onSuccess:()=>void; initialData?:UserItem|null; branches:Branch[] }) {
  const isEdit = Boolean(initialData);
  const [nama,setNama]=useState(''); const [username,setUsername]=useState('');
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [confirmPw,setConfirmPw]=useState(''); const [idRole,setIdRole]=useState('');
  const [idCabang,setIdCabang]=useState(''); const [status,setStatus]=useState<'aktif'|'nonaktif'>('aktif');
  const [errors,setErrors]=useState<Record<string,string>>({}); const [loading,setLoading]=useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setNama(initialData.nama); setUsername(initialData.username); setEmail(initialData.email??'');
      setIdRole(String(initialData.id_role)); setIdCabang(String(initialData.id_cabang));
      setStatus(initialData.status); setPassword(''); setConfirmPw('');
    } else { setNama(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPw(''); setIdRole(''); setIdCabang(''); setStatus('aktif'); }
    setErrors({});
  }, [isOpen, initialData]);

  if (!isOpen) return null;
  const ce = (k:string) => setErrors(e=>({...e,[k]:''}));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!nama.trim()) e.nama='Nama wajib diisi';
    if (!username.trim()) e.username='Username wajib diisi';
    if (!isEdit && !password) e.password='Password wajib diisi';
    if (password && password.length<6) e.password='Minimal 6 karakter';
    if (password && password!==confirmPw) e.confirmPw='Password tidak cocok';
    if (!idRole) e.idRole='Role wajib dipilih';
    if (!idCabang) e.idCabang='Branch wajib dipilih';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const p: Record<string,any> = { nama,username,email:email||null,id_role:Number(idRole),id_cabang:Number(idCabang),status };
      if (password) p.password = password;
      if (isEdit && initialData) await api.put(`/superadmin/users/${initialData.id}`,p);
      else await api.post('/superadmin/users',p);
      onSuccess(); onClose();
    } catch (err:any) { setErrors({general:err.response?.data?.message||'Terjadi kesalahan.'}); }
    finally { setLoading(false); }
  };

  const inp = (k:string) => `w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${errors[k]?'border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10':'border-theme bg-card'}`;
  const sel = (k:string) => `w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors bg-card ${errors[k]?'border-red-300 dark:border-red-500/40':'border-theme'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-subtle">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
              <UsersIcon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">{isEdit?'Edit User':'Tambah User Baru'}</h2>
              <p className="text-xs text-muted">{isEdit?'Ubah data pengguna':'Tambah pengguna baru ke sistem'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-muted transition-colors"><X size={16}/></button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-3 px-6 pt-4 pb-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(nama)||'?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{nama||'Nama Pengguna'}</p>
            <p className="text-xs text-muted">{email||'email@domain.com'}</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {errors.general && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{errors.general}</p>}

          {[
            { label:'Nama Lengkap', key:'nama',     icon:User, type:'text',  val:nama,     set:(v:string)=>{setNama(v);ce('nama')},         ph:'Contoh: Budi Santoso', req:true },
            { label:'Username',     key:'username', icon:User, type:'text',  val:username, set:(v:string)=>{setUsername(v);ce('username')},  ph:'username123',           req:true },
            { label:'Email',        key:'email',    icon:Mail, type:'email', val:email,    set:(v:string)=>{setEmail(v);ce('email')},        ph:'budi@domain.com',       req:false },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-secondary mb-1">{f.label} {f.req&&<span className="text-red-500">*</span>}</label>
              <div className="relative"><f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input type={f.type} className={inp(f.key)} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} />
              </div>
              {errors[f.key] && <p className="text-xs text-red-500 mt-0.5">{errors[f.key]}</p>}
            </div>
          ))}

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:`Password${isEdit?' (opsional)':''}`, key:'password',  val:password,  set:(v:string)=>{setPassword(v);ce('password')},  req:!isEdit },
              { label:'Konfirmasi',                          key:'confirmPw', val:confirmPw, set:(v:string)=>{setConfirmPw(v);ce('confirmPw')}, req:!isEdit },
            ].map(f=>(
              <div key={f.key}>
                <label className="block text-xs font-semibold text-secondary mb-1">{f.label} {f.req&&<span className="text-red-500">*</span>}</label>
                <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="password" className={inp(f.key)} placeholder="••••••" value={f.val} onChange={e=>f.set(e.target.value)} />
                </div>
                {errors[f.key] && <p className="text-xs text-red-500 mt-0.5">{errors[f.key]}</p>}
              </div>
            ))}
          </div>

          {/* Role + Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Role <span className="text-red-500">*</span></label>
              <div className="relative"><Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <select className={sel('idRole')} value={idRole} onChange={e=>{setIdRole(e.target.value);ce('idRole')}}>
                  <option value="">Pilih Role</option>
                  <option value="2">Admin Cabang</option>
                  <option value="3">Trainer</option>
                  <option value="4">User</option>
                </select>
              </div>
              {errors.idRole && <p className="text-xs text-red-500 mt-0.5">{errors.idRole}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Branch <span className="text-red-500">*</span></label>
              <div className="relative"><Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <select className={sel('idCabang')} value={idCabang} onChange={e=>{setIdCabang(e.target.value);ce('idCabang')}}>
                  <option value="">Pilih Branch</option>
                  {branches.map(b=><option key={b.id} value={b.id}>{b.nama_cabang}</option>)}
                </select>
              </div>
              {errors.idCabang && <p className="text-xs text-red-500 mt-0.5">{errors.idCabang}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">Status Akun</label>
            <div className="flex gap-2">
              {(['aktif','nonaktif'] as const).map(s=>(
                <button key={s} type="button" onClick={()=>setStatus(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    status===s
                      ? s==='aktif'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-700 dark:bg-slate-600 border-slate-700 dark:border-slate-600 text-white'
                      : 'bg-card border-theme text-label hover:bg-muted'}`}>
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
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-60 transition-colors shadow-sm">
            {loading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</>
              : isEdit ? 'Simpan Perubahan' : 'Buat User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({ user, onCancel, onConfirm }:{ user:UserItem; onCancel:()=>void; onConfirm:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onCancel()}}>
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center border border-subtle">
        <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-sm font-bold text-primary">Hapus User?</h3>
        <p className="text-xs text-label mt-2">User <span className="font-semibold text-secondary">"{user.nama}"</span> akan dihapus permanen dan tidak bisa dipulihkan.</p>
        <div className="flex gap-2 mt-5">
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-theme text-xs font-semibold text-secondary hover:bg-muted transition-colors">Batal</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ user, onClose, onEdit }:{ user:UserItem; onClose:()=>void; onEdit:()=>void }) {
  const { relative, full } = formatLastLogin(user.last_login);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-card h-full w-72 flex flex-col shadow-2xl border-l border-theme">
        <div className="flex items-center justify-between px-5 py-4 border-b border-subtle bg-muted/50">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Detail User</span>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted transition-colors"><X size={15}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center gap-2 pb-5 border-b border-subtle">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(user.nama)}
              </div>
              {user.is_online && (
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#161b22]">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              )}
            </div>
            <p className="font-bold text-primary mt-1 text-center">{user.nama}</p>
            <p className="text-xs text-muted text-center">{user.email ?? user.username}</p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.status==='aktif'?'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20':'bg-muted text-label border-theme'}`}>
                {user.status==='aktif'?'Aktif':'Nonaktif'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_COLOR[user.role]}`}>
                {getRoleLabel(user.role)}
              </span>
              {user.is_online && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Online
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 space-y-0">
            {([['Branch', user.nama_cabang], ['Username', user.username]] as [string,string][]).map(([label,value]) => (
              <div key={label} className="flex justify-between py-3 border-b border-theme">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-xs font-semibold text-secondary">{value}</span>
              </div>
            ))}
            <div className="py-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-muted">Last Login</span>
                <div className="text-right">
                  {user.is_online ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Wifi size={11} /> Sedang Online
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-secondary">{relative}</span>
                  )}
                  {user.last_login && <p className="text-[10px] text-muted mt-0.5">{full}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-subtle">
          <button type="button" onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors">
            <Edit2 size={13} /> Edit User
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
  const [editTarget,   setEditTarget]   = useState<UserItem|null>(null);
  const [delTarget,    setDelTarget]    = useState<UserItem|null>(null);
  const [detailTarget, setDetailTarget] = useState<UserItem|null>(null);
  const [toast,        setToast]        = useState<{msg:string;type:'success'|'error'}|null>(null);

  const showToast = (msg:string, type:'success'|'error'='success') => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  useEffect(()=>{ api.get('/superadmin/branches').then(r=>setBranches(r.data.data ?? r.data)).catch(()=>{}); },[]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string,any> = { page };
      if (search) p.search=search; if (filterRole) p.role=filterRole; if (filterCabang) p.id_cabang=filterCabang;
      const res = await api.get('/superadmin/users',{params:p});
      setUsers(res.data.data); setLastPage(res.data.last_page); setTotal(res.data.total);
    } catch { showToast('Gagal memuat data user.','error'); }
    finally { setLoading(false); }
  },[page,search,filterRole,filterCabang]);

  useEffect(()=>{ fetchUsers(); },[fetchUsers]);
  useEffect(()=>{ setPage(1); },[search,filterRole,filterCabang]);
  useEffect(()=>{ const t=setInterval(fetchUsers,30_000); return ()=>clearInterval(t); },[fetchUsers]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const p: Record<string,any> = { per_page:99999 };
      if (search) p.search=search; if (filterRole) p.role=filterRole; if (filterCabang) p.id_cabang=filterCabang;
      const res = await api.get('/superadmin/users',{params:p});
      const all: UserItem[] = res.data.data;
      if (!all.length) { showToast('Tidak ada data.','error'); return; }
      const headers = ['No','Nama','Username','Email','Role','Branch','Status','Last Login','Online'];
      const rows = all.map((u,i) => {
        const { relative } = formatLastLogin(u.last_login);
        return [i+1,`"${u.nama}"`,u.username,u.email??'-',getRoleLabel(u.role),`"${u.nama_cabang}"`,
          u.status==='aktif'?'Aktif':'Nonaktif', relative, u.is_online?'Online':'Offline'];
      });
      const csv  = [headers.join(','),...rows.map(r=>r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
      const url  = URL.createObjectURL(blob), a = document.createElement('a');
      a.href=url; a.download=`users_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      showToast(`${all.length} data diekspor!`);
    } catch { showToast('Gagal mengekspor.','error'); }
    finally { setExporting(false); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await api.delete(`/superadmin/users/${delTarget.id}`);
      setDelTarget(null); setDetailTarget(null);
      showToast(`User "${delTarget.nama}" dihapus.`,'error');
      fetchUsers();
    } catch { showToast('Gagal menghapus user.','error'); }
  };

  const pageNumbers = (): (number|'...')[] => {
    if (lastPage<=7) return Array.from({length:lastPage},(_,i)=>i+1);
    if (page<=4) return [1,2,3,4,5,'...',lastPage];
    if (page>=lastPage-3) return [1,'...',lastPage-4,lastPage-3,lastPage-2,lastPage-1,lastPage];
    return [1,'...',page-1,page,page+1,'...',lastPage];
  };

  const hasFilter    = search||filterRole||filterCabang;
  const resetFilters = () => { setSearch(''); setFilterRole(''); setFilterCabang(''); setPage(1); };
  const onlineCount  = users.filter(u=>u.is_online).length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 bg-card border-l-4 border border-subtle
          ${toast.type==='success'?'border-l-emerald-500 text-emerald-700 dark:text-emerald-400':'border-l-red-500 text-red-600 dark:text-red-400'}
          rounded-xl px-4 py-3 shadow-xl text-xs font-semibold`}>
          {toast.type==='success'?'✓':'✕'} {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">User Management</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted">Kelola pengguna, role, dan penugasan cabang</p>
            {onlineCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{onlineCount} online
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={()=>setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0">
          <Plus size={14}/> Tambah User
        </button>
      </div>

      {/* Table card */}
      <div className="card rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-subtle bg-muted/40 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Cari nama, email, username..."
              className="w-full pl-9 pr-4 py-2 border border-theme rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-card"
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          {/* Filters + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={13} className="text-muted hidden sm:block" />
            <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${filterRole?'border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400':'border-theme bg-card text-secondary'}`}>
              <option value="">Semua Role</option>
              <option value="admin">Admin Cabang</option>
              <option value="trainer">Trainer</option>
              <option value="user">User</option>
            </select>
            <select value={filterCabang} onChange={e=>setFilterCabang(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${filterCabang?'border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400':'border-theme bg-card text-secondary'}`}>
              <option value="">Semua Cabang</option>
              {branches.map(b=><option key={b.id} value={b.id}>{b.nama_cabang}</option>)}
            </select>
            {hasFilter && (
              <button type="button" onClick={resetFilters}
                className="px-3 py-2 border border-theme rounded-lg text-xs text-label hover:bg-muted transition-colors">Reset</button>
            )}
            <button type="button" onClick={handleExportCSV} disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 border border-theme rounded-lg text-xs font-semibold text-secondary hover:bg-muted disabled:opacity-50 transition-colors">
              {exporting ? <span className="w-3 h-3 border-2 border-muted border-t-transparent rounded-full animate-spin" /> : <Download size={12}/>}
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-subtle">
                {['Pengguna','Role','Cabang','Status','Last Login',''].map((h,i)=>(
                  <th key={i} className={`px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider ${i===5?'text-right':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                Array.from({length:6}).map((_,i)=>(
                  <tr key={i}>{Array.from({length:6}).map((_,j)=>(
                    <td key={j} className="px-5 py-3.5"><Skel className="h-3.5 w-20" /></td>
                  ))}</tr>
                ))
              ) : users.length===0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <UsersIcon size={20} className="text-muted" />
                    </div>
                    <p className="text-sm font-semibold text-muted">Tidak ada pengguna</p>
                    <p className="text-xs text-muted mt-1">Coba ubah filter atau tambah user baru</p>
                    {hasFilter && <button type="button" onClick={resetFilters} className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2">Reset filter</button>}
                  </td>
                </tr>
              ) : users.map(user=>(
                <tr key={user.id} className="hover:bg-muted/60 transition-colors group">
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                          {getInitials(user.nama)}
                        </div>
                        {user.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#161b22]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary leading-tight">{user.nama}</p>
                        <p className="text-xs text-muted">{user.email??user.username}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_COLOR[user.role]}`}>
                      <Shield size={10}/>{getRoleLabel(user.role)}
                    </span>
                  </td>
                  {/* Cabang */}
                  <td className="px-5 py-3.5 text-xs font-medium text-secondary">{user.nama_cabang}</td>
                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${user.status==='aktif'?'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20':'bg-muted text-label border-theme'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status==='aktif'?'bg-emerald-500':'bg-muted border border-theme'}`} />
                      {user.status==='aktif'?'Aktif':'Nonaktif'}
                    </span>
                  </td>
                  {/* Last Login */}
                  <td className="px-5 py-3.5"><OnlineBadge isOnline={user.is_online} lastLogin={user.last_login} /></td>
                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={()=>setEditTarget(user)}
                        className="p-1.5 rounded-lg text-muted hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Edit"><Edit2 size={13}/></button>
                      <button type="button" onClick={()=>setDelTarget(user)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Hapus"><Trash2 size={13}/></button>
                      <button type="button" onClick={()=>setDetailTarget(user)}
                        className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-muted transition-all" title="Detail"><MoreVertical size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-subtle bg-muted/30 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-muted">
            {total===0 ? 'Tidak ada hasil'
              : `${(page-1)*10+1}–${Math.min(page*10,total)} dari ${total} pengguna`}
            {hasFilter && <span className="text-red-500 dark:text-red-400 font-semibold ml-1">(difilter)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-theme rounded-lg text-xs font-medium text-label hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={13}/> Prev
            </button>
            {pageNumbers().map((p,i) =>
              p==='...' ? <span key={`e${i}`} className="px-1 text-muted text-xs">…</span>
              : <button key={p} type="button" onClick={()=>setPage(Number(p))}
                  className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${page===p?'bg-red-600 border-red-600 text-white':'border-theme text-label hover:bg-muted'}`}>
                  {p}
                </button>
            )}
            <button type="button" onClick={()=>setPage(p=>Math.min(lastPage,p+1))} disabled={page===lastPage}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-theme rounded-lg text-xs font-medium text-label hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal isOpen={showCreate} onClose={()=>setShowCreate(false)}
        onSuccess={()=>{ showToast('User berhasil dibuat!'); fetchUsers(); }} branches={branches} />
      <UserModal isOpen={editTarget!==null} onClose={()=>setEditTarget(null)}
        onSuccess={()=>{ showToast('User berhasil diupdate!'); fetchUsers(); }}
        initialData={editTarget} branches={branches} />
      {delTarget    && <DeleteDialog user={delTarget}    onCancel={()=>setDelTarget(null)}    onConfirm={handleDelete} />}
      {detailTarget && <DetailDrawer user={detailTarget} onClose={()=>setDetailTarget(null)}  onEdit={()=>{ setEditTarget(detailTarget); setDetailTarget(null); }} />}
    </div>
  );
}
