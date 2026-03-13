import { useEffect, useState, useCallback } from 'react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import API from '../../api/api';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import Spinner from '../../components/ui/Spinner';

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
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProfil().finally(() => setLoading(false));
  }, [fetchProfil]);

  const handleSaveProfil = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await API.put('/user/profil', { nama: form.nama, nomor_hp: form.nomor_hp });
      await fetchProfil();
      const currentUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
      localStorage.setItem('lms_user', JSON.stringify({ ...currentUser, nama: form.nama }));
      window.dispatchEvent(new Event('lms_user_updated'));
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (passwordForm.password_baru !== passwordForm.konfirmasi) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setSaving(true);
    try {
      await API.put('/user/profil', { password: passwordForm.password_baru });
      setSuccessMsg('Password berhasil diperbarui!');
      setPasswordForm({ password_lama: '', password_baru: '', konfirmasi: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSaving(false);
    }
  };

  const initials = profil?.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

  // Skeleton saat loading
  if (loading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola informasi pribadi dan pengaturan akun Anda</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl mx-auto border-4 border-white shadow-md mb-4">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{profil?.nama}</h2>
            <p className="text-sm text-slate-500 mb-4">@{profil?.username}</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              profil?.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {profil?.status ?? 'pending'}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Informasi Pribadi
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
                  <Mail size={16} /> {profil?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor HP</label>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={form.nomor_hp}
                    onChange={e => setForm({ ...form, nomor_hp: e.target.value })}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveProfil}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {/* Spinner saat menyimpan */}
                  {saving
                    ? <><Spinner size="sm" /> Menyimpan...</>
                    : <><Save size={16} /> Simpan Perubahan</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Ganti Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Ganti Password
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.password_baru}
                  onChange={e => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.konfirmasi}
                  onChange={e => setPasswordForm({ ...passwordForm, konfirmasi: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={saving || !passwordForm.password_baru}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving
                    ? <><Spinner size="sm" /> Menyimpan...</>
                    : <><Save size={16} /> Simpan Password</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}