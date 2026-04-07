import { useNavigate } from 'react-router-dom';
import { getUser, getDashboardPath, logout } from '../pages/types';

// Halaman ini muncul jika user mencoba akses halaman yang bukan haknya
// Contoh: user biasa coba akses /admin/dashboard

export default function Unauthorized() {
  const navigate = useNavigate();
  const user = getUser();

  const handleBack = () => {
    if (user) {
      navigate(getDashboardPath(user.role));
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚫</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 text-sm mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          {user && (
            <span className="block mt-1">
              Role Anda saat ini: <span className="font-semibold text-slate-700">{user.role}</span>
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleBack}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Kembali ke Dashboard Saya
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
