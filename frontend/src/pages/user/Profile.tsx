import { useEffect, useState, useCallback } from 'react';
import { User, Mail, Phone, Lock, Save, LogOut } from 'lucide-react';
import API from '../../api/api';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import Spinner from '../../components/ui/Spinner';
import { saveUser, getUser } from '../types';

interface Profil {
  nama: string;
  username: string;
  email: string;
  nomor_hp: string;
  status: string;
}

export default function Profile() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoutingAll, setLogoutingAll] = useState(false);
  const [form, setForm] = useState({ nama: '', nomor_hp: '' });
  const [passwordForm, setPasswordForm] = useState({ password_lama: '', password_baru: '', konfirmasi: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfil = useCallback(async () => {
    try {
      const res = await API.get('/user/profil');
      const data = res.data.data;
      setProfil(data);
      setForm({ nama: data.nama, nomor_hp: data.nomor_hp ?? '' });
    } catch { setErrorMsg('Gagal memuat profil.'); }
  }, []);

  useEffect(() => { fetchProfil().finally(() => setLoading(false)); }, [fetchProfil]);

  const handleSaveProfil = async () => {
    setSaving(true); setSuccessMsg(''); setErrorMsg('');
    try {
      await API.put('/user/profil', { nama: form.nama, nomor_hp: form.nomor_hp });
      await fetchProfil();
      const currentUser = getUser();
      if (currentUser) saveUser({ ...currentUser, nama: form.nama });
      window.dispatchEvent(new Event('lms_user_updated'));
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan profil.');
    } finally { setSaving(false); }
  };

  const handleSavePassword = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!passwordForm.password_lama) {
      setErrorMsg('Password lama wajib diisi.'); return;
    }
    if (passwordForm.password_baru !== passwordForm.konfirmasi) {
      setErrorMsg('Konfirmasi password tidak cocok.'); return;
    }
    setSaving(true);
    try {
      await API.put('/user/profil', {
        current_password: passwordForm.password_lama,
        password: passwordForm.password_baru,
      });
      setSuccessMsg('Password berhasil diperbarui!');
      setPasswordForm({ password_lama: '', password_baru: '', konfirmasi: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah password.');
    } finally { setSaving(false); }
  };

  const handleLogoutSemua = async () => {
    if (!confirm('Keluar dari semua perangkat? Anda harus login ulang.')) return;
    setLogoutingAll(true);
    try {
      await API.post('/logout-semua');
      sessionStorage.removeItem('lms_user');
      window.location.href = '/login';
    } catch {
      setErrorMsg('Gagal keluar dari semua perangkat.');
      setLogoutingAll(false);
    }
  };

  const initials = profil?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kelola informasi pribadi dan pengaturan akun Anda</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-[#161b27] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/8 text-center">
            <div className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-3xl mx-auto shadow-md mb-4">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{profil?.nama}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">@{profil?.username}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              profil?.status === 'aktif'
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}>
              {profil?.status ?? 'pending'}
            </span>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/8">
              <button
                onClick={handleLogoutSemua}
                disabled={logoutingAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              >
                <LogOut size={15} />
                {logoutingAll ? 'Memproses...' : 'Keluar semua perangkat'}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Informasi Pribadi */}
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-red-500" />
                Informasi Pribadi
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
                  <Mail size={16} /> {profil?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor HP</label>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={form.nomor_hp}
                    onChange={e => setForm({ ...form, nomor_hp: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm outline-none transition-colors"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveProfil}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <><Spinner size="sm" /> Menyimpan...</> : <><Save size={16} /> Simpan Perubahan</>}
                </button>
              </div>
            </div>
          </div>

          {/* Ganti Password */}
          <div className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-red-500" />
                Ganti Password
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Lama</label>
                <input
                  type="password"
                  value={passwordForm.password_lama}
                  onChange={e => setPasswordForm({ ...passwordForm, password_lama: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.password_baru}
                  onChange={e => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.konfirmasi}
                  onChange={e => setPasswordForm({ ...passwordForm, konfirmasi: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={saving || !passwordForm.password_lama || !passwordForm.password_baru}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <><Spinner size="sm" /> Menyimpan...</> : <><Save size={16} /> Simpan Password</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}