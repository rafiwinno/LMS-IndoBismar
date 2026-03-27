/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUser, getDashboardPath } from "./pages/types";
import ProtectedRoute from "./components/ProtectedRoute";

// LAYOUTS (loaded eagerly — needed immediately)
import Layout from "./components/user/Layout";
import TrainerLayout from "./components/trainer/Layout";

// AUTH
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// USER PAGES
const UserDashboard = lazy(() => import("./pages/user/Dashboard"));
const Courses = lazy(() => import("./pages/user/Courses"));
const CourseDetail = lazy(() => import("./pages/user/CourseDetail"));
const Tasks = lazy(() => import("./pages/user/Tasks"));
const Quiz = lazy(() => import("./pages/user/Quiz"));
const Grades = lazy(() => import("./pages/user/Grades"));
const Profile = lazy(() => import("./pages/user/Profile"));

// TRAINER PAGES
const TrainerDashboard = lazy(() => import("./pages/trainer/Dashboard"));
const TrainerCourses = lazy(() => import("./pages/trainer/Course"));
const TrainerMaterials = lazy(() => import("./pages/trainer/Materials"));
const TrainerAssignments = lazy(() => import("./pages/trainer/Assignments"));
const TrainerProgress = lazy(() => import("./pages/trainer/Progress"));
const TrainerFeedback = lazy(() => import("./pages/trainer/Feedback"));

// ADMIN
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// SUPERADMIN
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/Dashboard"));


// Redirect root sesuai role login
function RootRedirect() {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ROOT */}
          <Route path="/" element={<RootRedirect />} />

          {/* ================= USER ================= */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
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

          {/* ================= TRAINER ================= */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="courses" element={<TrainerCourses />} />
            <Route path="courses/:id/materials" element={<TrainerMaterials />} />
            <Route path="assignments"  element={<TrainerAssignments />} />
            <Route path="progress"     element={<TrainerProgress />} />
            <Route path="feedback"     element={<TrainerFeedback />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================= SUPERADMIN ================= */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================= UNAUTHORIZED ================= */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-500">403</h1>
                  <p className="mt-2 text-slate-600">
                    Anda tidak memiliki akses ke halaman ini.
                  </p>
                  <a href="/login" className="mt-4 inline-block text-blue-600 underline">
                    Kembali ke Login
                  </a>
                </div>
              </div>
            }
          />

          {/* ================= 404 ================= */}
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
      </Suspense>
    </Router>
  );
}
