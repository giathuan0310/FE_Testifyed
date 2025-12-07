import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiBook,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiBarChart2
} from 'react-icons/fi';
import './AdminLayout.css';
import { useAppStore } from '../../store/appStore';
import { logoutApi } from '../../service/api/apiUser';
import { toast } from 'react-toastify';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore(state => state.user);
  const clearUser = useAppStore(state => state.clearUser);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const menuItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: FiHome, path: '/admin/dashboard' },
    { id: 'users', label: 'Quản lý người dùng', icon: FiUsers, path: '/admin/users' },
    { id: 'classes', label: 'Quản lý lớp học', icon: FiBookOpen, path: '/admin/classes' },
    { id: 'subjects', label: 'Quản lý môn học', icon: FiBook, path: '/admin/subjects-enhanced' },
    { id: 'exams', label: 'Quản lý bài thi', icon: FiFileText, path: '/admin/exams' },
    { id: 'schedules', label: 'Lịch thi', icon: FiCalendar, path: '/admin/exam-schedules' },
    { id: 'questions', label: 'Ngân hàng câu hỏi', icon: FiBook, path: '/admin/questions' },
    { id: 'results', label: 'Quản lý kết quả', icon: FiFileText, path: '/admin/results' },
    // { id: 'reports', label: 'Báo cáo thống kê', icon: FiBarChart2, path: '/admin/reports' },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: FiSettings, path: '/admin/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutApi();
      localStorage.removeItem("accessToken");
      clearUser();
      navigate("/login");
      toast.success("Đăng xuất thành công");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/src/assets/Logo2T.png" alt="Logo" />
            {isSidebarOpen && <h2>Admin Panel</h2>}
          </div>
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="nav-item-icon" size={20} />
                {isSidebarOpen && <span className="nav-item-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          {isSidebarOpen ? (
            <div>
              <div className="user-info">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}</span>
                  </div>
                )}
                <div className="user-details">
                  <h3>{user?.fullName || 'Admin'}</h3>
                  <p>{user?.role || 'Quản trị viên'}</p>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  color: '#64748b'
                }}
              >
                <FiLogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FiMenu size={20} />
            </button>
            <div className="header-title">
              <h1>{menuItems.find(item => isActive(item.path))?.label || 'Trang chủ'}</h1>
            </div>
          </div>
          <div className="header-user">
            <div className="header-user-info">
              <FiUser size={16} />
              <span>{user?.fullName || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          <div className="content-container">
            <Outlet />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
