import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { AuthContext } from './context/AuthContext';

// Pages (We will create these next)
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LiveSession from './pages/teacher/LiveSession';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import GenerateQR from './pages/teacher/GenerateQR';
import ViewAttendance from './pages/teacher/ViewAttendance';

// Simple Redirect based on role
const DashboardRedirect = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<DashboardRedirect />} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
               <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  {/* Add other student sub-routes here */}
               </Routes>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          {/* // Inside App.jsx -> Teacher Routes */}
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="generate-qr" element={<GenerateQR />} />
                  {/* Course history & live session routes */}
                  <Route path="courses/:courseId" element={<ViewAttendance />} />
                  <Route path="sessions/:sessionId/live" element={<LiveSession />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
               <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
               </Routes>
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;