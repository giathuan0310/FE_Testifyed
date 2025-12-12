import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiBookOpen,

} from 'react-icons/fi';
import './InstructorLayout.css';
import { useAppStore } from '../../store/appStore';
import { logoutApi } from '../../service/api/apiUser';
import { toast } from 'react-toastify';
const InstructorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore(state => state.user);
  const clearUser = useAppStore(state => state.clearUser);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/instructor/dashboard' },
    { id: 'classes', label: 'Quản lý lớp học', icon: FiBook, path: '/instructor/classes' },
    { id: 'subjects', label: 'Quản lý môn học', icon: FiBookOpen, path: '/instructor/subjects' },
    { id: 'exams', label: 'Quản lý kỳ thi', icon: FiCalendar, path: '/instructor/exams' },
    { id: 'questions', label: 'Ngân hàng câu hỏi', icon: FiFileText, path: '/instructor/questions' },
    { id: 'schedules', label: 'Quản lý lịch thi', icon: FiCalendar, path: '/instructor/schedules' },
    { id: 'results', label: 'Quản lý kết quả', icon: FiFileText, path: '/instructor/results' },
    { id: 'settings', label: 'Cài đặt', icon: FiSettings, path: '/instructor/settings' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("accessToken");
    clearUser();
    navigate("/login");
    toast.success("Đăng xuất thành công");
  };


  return (
    <div className="instructor-layout">
      {/* Sidebar */}
      <div className={`instructor-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="https://testifyed.lhgt.id.vn/assets/Logo2T-Dm7vfVsN.png" alt="Logo" />
            {isSidebarOpen && <h2>Testifyed</h2>}
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
                  <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}</span>
                )}

                <div className="user-details">
                  <h3>{user.fullName}</h3>
                  <p>{user.role}</p>
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
      <div className="instructor-main">
        {/* Top Header */}
        <header className="instructor-header">
          <div className="header-title">
            <h1>{menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-user">
            <div className="header-user-info">
              <FiUser size={16} />
              <span>{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="instructor-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
