/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getUser, getDashboardPath } from "./pages/types";
import ProtectedRoute from "./components/ProtectedRoute";

// USER LAYOUT
import Layout from "./components/user/Layout";

// TRAINER LAYOUT
import TrainerLayout from "./components/trainer/Layout";

// AUTH
import Login from "./pages/Login";
import Register from "./pages/Register";

// USER PAGES
import UserDashboard from "./pages/user/Dashboard";
import Courses from "./pages/user/Courses";
import CourseDetail from "./pages/user/CourseDetail";
import Tasks from "./pages/user/Tasks";
import Quiz from "./pages/user/Quiz";
import Grades from "./pages/user/Grades";
import Profile from "./pages/user/Profile";

// TRAINER PAGES
import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerCourses from "./pages/trainer/Course";
import TrainerMaterials from "./pages/trainer/Materials";
import TrainerAssignments from "./pages/trainer/Assignments";
import TrainerProgress from "./pages/trainer/Progress";
import TrainerFeedback from "./pages/trainer/Feedback";


// ADMIN
import AdminDashboard from "./pages/admin/Dashboard";

// SUPERADMIN
import SuperAdminDashboard from "./pages/superadmin/Dashboard";


// Redirect root sesuai role login
function RootRedirect() {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}