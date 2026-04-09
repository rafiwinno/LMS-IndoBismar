import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, getDashboardPath } from './pages/types';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';

// Layouts
import Layout from './components/user/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// ── User Pages ────────────────────────────────────────────────────────────────
const UserDashboard  = lazy(() => import('./pages/user/Dashboard'));
const Courses        = lazy(() => import('./pages/user/Courses'));
const CourseDetail   = lazy(() => import('./pages/user/CourseDetail'));
const Tasks          = lazy(() => import('./pages/user/Tasks'));
const Quiz           = lazy(() => import('./pages/user/Quiz'));
const Grades         = lazy(() => import('./pages/user/Grades'));
const Profile        = lazy(() => import('./pages/user/Profile'));
const Documents      = lazy(() => import('./pages/user/Documents'));

// ── Admin Pages ───────────────────────────────────────────────────────────────
const AdminLayout    = lazy(() => import('./components/admin/Layout'));

// ── Trainer Pages ─────────────────────────────────────────────────────────────
const TrainerLayout      = lazy(() => import('./components/trainer/Layout'));
const TrainerDashboard   = lazy(() => import('./pages/trainer/Dashboard'));
const TrainerCourse      = lazy(() => import('./pages/trainer/Course'));
const TrainerMaterials   = lazy(() => import('./pages/trainer/Materials'));
const TrainerAssignments = lazy(() => import('./pages/trainer/Assignments'));
const TrainerProgress    = lazy(() => import('./pages/trainer/Progress'));
const TrainerFeedback    = lazy(() => import('./pages/trainer/Feedback'));

// ── Superadmin Pages ──────────────────────────────────────────────────────────
const SuperAdminLayout   = lazy(() => import('./components/superadmin/Header')); // full layout w/ Outlet
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));
const SuperAdminUsers     = lazy(() => import('./pages/superadmin/Users'));
const SuperAdminBranches  = lazy(() => import('./pages/superadmin/Branches'));

function RootRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-700">404</h1>
      <p className="mt-2 text-slate-600">Halaman tidak ditemukan.</p>
      <a href="/" className="mt-4 inline-block text-blue-600 underline">Kembali ke Beranda</a>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-500">403</h1>
      <p className="mt-2 text-slate-600">Anda tidak memiliki akses ke halaman ini.</p>
      <a href="/login" className="mt-4 inline-block text-blue-600 underline">Kembali ke Login</a>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Auth ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* ── User / Peserta ── */}
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

          {/* ── Admin Cabang ── */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* ── Superadmin (Admin Pusat) ── */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users"     element={<SuperAdminUsers />} />
            <Route path="branches"  element={<SuperAdminBranches />} />
          </Route>

          {/* ── Trainer ── */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"              element={<TrainerDashboard />} />
            <Route path="courses"                element={<TrainerCourse />} />
            <Route path="courses/:id/materials" element={<TrainerMaterials />} />
            <Route path="assignments"            element={<TrainerAssignments />} />
            <Route path="progress"               element={<TrainerProgress />} />
            <Route path="feedback"               element={<TrainerFeedback />} />
          </Route>

          {/* ── Misc ── */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
