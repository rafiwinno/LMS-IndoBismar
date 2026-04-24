import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, saveUser, Role } from '../pages/types';
import API from '../api/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated' | 'unauthorized';

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const user = getUser();
    if (!user) return 'checking';
    if (!allowedRoles.includes(user.role)) return 'unauthorized';
    return 'authenticated';
  });

  useEffect(() => {
    if (authState !== 'checking') return;

    API.get('/me')
      .then(res => {
        const u = res.data.user;
        const idRole = u.id_role;
        const role: Role = idRole === 1 ? 'superadmin' : idRole === 2 ? 'admin' : idRole === 3 ? 'trainer' : 'user';
        saveUser({ id: u.id_pengguna, nama: u.nama, email: u.email, role });

        if (!allowedRoles.includes(role)) {
          setAuthState('unauthorized');
        } else {
          setAuthState('authenticated');
        }
      })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f1117]">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated') return <Navigate to="/login" replace />;
  if (authState === 'unauthorized') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}