import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, getDashboardPath } from './pages/types';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';

// Layout
import Layout from './components/user/Layout';

// Auth Pages (tidak di-lazy karena selalu dibutuhkan pertama kali)
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages — lazy loaded (hanya dimuat saat halaman dikunjungi)
const UserDashboard  = lazy(() => import('./pages/user/Dashboard'));
const Courses        = lazy(() => import('./pages/user/Courses'));
const CourseDetail   = lazy(() => import('./pages/user/CourseDetail'));
const Tasks          = lazy(() => import('./pages/user/Tasks'));
const Quiz           = lazy(() => import('./pages/user/Quiz'));
const Grades         = lazy(() => import('./pages/user/Grades'));
const Profile        = lazy(() => import('./pages/user/Profile'));
const Documents      = lazy(() => import('./pages/user/Documents'));

// Admin/Trainer/Superadmin — lazy loaded
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'));
const TrainerDashboard    = lazy(() => import('./pages/trainer/Dashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));

function RootRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <Router>
      {/* Suspense fallback tampil saat halaman lazy sedang dimuat */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root: redirect sesuai role */}
          <Route path="/" element={<RootRedirect />} />

          {/* ===== USER ROUTES ===== */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard"      element={<UserDashboard />} />
            <Route path="courses"        element={<Courses />} />
            <Route path="courses/:id"    element={<CourseDetail />} />
            <Route path="tasks"          element={<Tasks />} />
            <Route path="tasks/quiz/:id" element={<Quiz />} />
            <Route path="grades"         element={<Grades />} />
            <Route path="documents"      element={<Documents />} />
            <Route path="profile"        element={<Profile />} />
          </Route>

          {/* ===== ADMIN ROUTES ===== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ===== TRAINER ROUTES ===== */}
          <Route
            path="/trainer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ===== SUPERADMIN ROUTES ===== */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 403 */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-500">403</h1>
                  <p className="mt-2 text-slate-600">Anda tidak memiliki akses ke halaman ini.</p>
                  <a href="/login" className="mt-4 inline-block text-blue-600 underline">Kembali ke Login</a>
                </div>
              </div>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-slate-700">404</h1>
                  <p className="mt-2 text-slate-600">Halaman tidak ditemukan.</p>
                  <a href="/" className="mt-4 inline-block text-blue-600 underline">Kembali ke Beranda</a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}