/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/user/Dashboard';
import Courses from './pages/user/Courses';
import CourseDetail from './pages/user/CourseDetail';
import Tasks from './pages/user/Tasks';
import Quiz from './pages/user/Quiz';
import Grades from './pages/user/Grades';
import Profile from './pages/user/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/quiz/:id" element={<Quiz />} />
          <Route path="grades" element={<Grades />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
