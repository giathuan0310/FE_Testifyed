import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Student'
import { Login, ForgotPassword } from './pages/auth'
import StudentRoutes from './routes/StudentRoutes'
import InstructorRoutes from './routes/InstructorRoutes'
import AdminRoutes from './routes/AdminRoutes'
import { ProtectedRoute } from './components'

import './App.css'
import { mockUsers } from './mockData';
import { useAppStore } from './store/appStore'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSessionCheck } from './hooks/useSessionCheck';
function App() {
  const fetchAccount = useAppStore(state => state.fetchAccount);
  const instructorUser = mockUsers[1];
  useEffect(() => {
    fetchAccount();
  }, []);
  useSessionCheck();
  return (
    <div className="App bg-gray-50 min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <ProtectedRoute requiredRole={null} allowAuthenticated={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requiredRole={null} allowAuthenticated={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } />

          {/* Protected Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <StudentRoutes />
            </ProtectedRoute>
          } />

          {/* Protected Instructor Routes */}
          <Route path="/instructor/*" element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorRoutes user={instructorUser} />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
      
            <AdminRoutes />
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default App
