import { User, Mail, School, MapPin, Calendar, Lock, Camera } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola informasi pribadi dan pengaturan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl mx-auto border-4 border-white shadow-md">
                BW
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-slate-600 shadow-sm border border-slate-200 hover:text-blue-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">Budi Wibowo</h2>
            <p className="text-sm text-slate-500 mb-4">Peserta PKL</p>
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Aktif
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Informasi Pribadi
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <User size={16} className="text-slate-400" /> Budi Wibowo
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Mail size={16} className="text-slate-400" /> budi.wibowo@smkn1sby.sch.id
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Asal Sekolah/Universitas</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <School size={16} className="text-slate-400" /> SMK Negeri 1 Surabaya
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Cabang PKL</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <MapPin size={16} className="text-slate-400" /> Surabaya Pusat
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Periode PKL</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar size={16} className="text-slate-400" /> 1 Agustus 2023 - 31 Januari 2024 (6 Bulan)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" />
                Ganti Password
              </h3>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Saat Ini</label>
                  <input
                    type="password"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                    <input
                      type="password"
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Simpan Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
