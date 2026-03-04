import { Navigate } from 'react-router-dom';
import { getUser, Role } from '../pages/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

// Komponen ini membungkus setiap halaman yang butuh login & role tertentu.
// Cara pakai di App.tsx:
//   <ProtectedRoute allowedRoles={["admin"]}>
//     <AdminDashboard />
//   </ProtectedRoute>

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = getUser();

  // Belum login → ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login tapi role tidak sesuai → ke halaman unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
