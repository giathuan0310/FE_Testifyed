import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store/appStore';
import { logoutApi } from '../../../service/api/apiUser';
import {
  FiHome,
  FiUsers,
  FiBook,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiBookOpen
} from 'react-icons/fi';
import logoIUH from '../../../assets/Logo2T.png';
import './AdminSidebar.css';
import { toast } from 'react-toastify';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const clearUser = useAppStore(state => state.clearUser);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
    { id: 'users', label: 'Quản lý người dùng', icon: FiUsers, path: '/admin/users' },
    { id: 'subjects', label: 'Quản lý môn học', icon: FiBookOpen, path: '/admin/subjects' },
    { id: 'questions', label: 'Quản lý câu hỏi', icon: FiFileText, path: '/admin/questions' },
    { id: 'exams', label: 'Quản lý kỳ thi', icon: FiCalendar, path: '/admin/exams' },
    { id: 'classes', label: 'Quản lý lớp học', icon: FiBook, path: '/admin/classes' },
    { id: 'settings', label: 'Cài đặt', icon: FiSettings, path: '/admin/settings' }
  ];

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("accessToken");
    clearUser();
    navigate("/login");
    toast.success("Đăng xuất thành công");
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'closed' : 'open'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logoIUH} alt="Logo" />
          {isCollapsed === false && <h2>Admin Panel</h2>}
        </div>
        <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
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
              {isCollapsed === false && <span className="nav-item-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="sidebar-user">
        {isCollapsed === false ? (
          <div>
            <div className="user-info">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="user-avatar" />
              ) : (
                <div className="user-avatar">
                  <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}</span>
                </div>
              )}
              <div className="user-details">
                <h3>{user?.fullName}</h3>
                <p>Administrator</p>
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
  );
};

export default AdminSidebar;