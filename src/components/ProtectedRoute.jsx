import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

const ProtectedRoute = ({ children, requiredRole = null, allowAuthenticated = true }) => {
  const { isAuthenticated, user, isAppLoading } = useAppStore();
  const location = useLocation();

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (isAppLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu không cho phép user đã đăng nhập truy cập (cho trang login/register)
  if (!allowAuthenticated && isAuthenticated) {
    const userRole = user?.role?.toLowerCase();
    const redirectPath = userRole === 'student' ? '/student/dashboard' : 
                         userRole === 'instructor' ? '/instructor/dashboard' : 
                         userRole === 'admin' ? '/admin/dashboard' :
                         '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Nếu chưa đăng nhập, redirect về trang login và lưu vị trí hiện tại
  if (!isAuthenticated && allowAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu role cụ thể và user không có role đó
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    // Redirect về trang phù hợp với role của user
    const userRole = user?.role?.toLowerCase();
    const redirectPath = userRole === 'student' ? '/student/dashboard' : 
                         userRole === 'instructor' ? '/instructor/dashboard' : 
                         userRole === 'admin' ? '/admin/dashboard' :
                         '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, render children
  return children;
};

export default ProtectedRoute;