/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser, getDashboardPath } from './pages/types';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Layout from './components/user/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Courses from './pages/user/Courses';
import CourseDetail from './pages/user/CourseDetail';
import Tasks from './pages/user/Tasks';
import Quiz from './pages/user/Quiz';
import Grades from './pages/user/Grades';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Trainer Pages
import TrainerDashboard from './pages/trainer/Dashboard';

// Superadmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminLayout from './components/superadmin/Header';
import Users from './pages/superadmin/Users';
import Branches from './pages/superadmin/Branches';


// Komponen untuk redirect root "/" berdasarkan role yang sedang login
function RootRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
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
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/quiz/:id" element={<Quiz />} />
          <Route path="grades" element={<Grades />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="branches" element={<Branches />} />
        </Route>

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
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="branches" element={<Branches />} />
        </Route>

        {/* Halaman unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-500">403</h1>
                <p className="mt-2 text-slate-600">Anda tidak memiliki akses ke halaman ini.</p>
                <a href="/login" className="mt-4 inline-block text-blue-600 underline">
                  Kembali ke Login
                </a>
              </div>
            </div>
          }
        />

        {/* 404 - halaman tidak ditemukan */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-700">404</h1>
                <p className="mt-2 text-slate-600">Halaman tidak ditemukan.</p>
                <a href="/" className="mt-4 inline-block text-blue-600 underline">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
