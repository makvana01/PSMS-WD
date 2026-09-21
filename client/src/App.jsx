/**
 * MAIN APP COMPONENT (App.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Imported by: main.jsx
 * - Sets up: AuthProvider, BrowserRouter, Navbar, App Pages & Routes, Footer
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import ManageStudents from './pages/ManageStudents';
import ManageCompanies from './pages/ManageCompanies';
import Applications from './pages/Applications';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow-1 py-3">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/manage-students" element={<ManageStudents />} />
                <Route path="/manage-companies" element={<ManageCompanies />} />
              </Route>

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
              </Route>

              {/* Company Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['company']} />}>
                <Route path="/company-dashboard" element={<CompanyDashboard />} />
              </Route>

              {/* Shared Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'student', 'company']} />}>
                <Route path="/applications" element={<Applications />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
