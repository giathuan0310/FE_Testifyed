import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Home
} from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: Home,
      label: 'Trang chủ',
      exact: true
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Quản lý người dùng'
    },
    {
      path: '/admin/classes',
      icon: GraduationCap,
      label: 'Quản lý lớp học'
    },
    {
      path: '/admin/subjects',
      icon: BookOpen,
      label: 'Quản lý môn học'
    },
    {
      path: '/admin/exams',
      icon: FileText,
      label: 'Quản lý bài thi'
    },
    {
      path: '/admin/schedules',
      icon: Calendar,
      label: 'Lịch thi'
    },
    // {
    //   path: '/admin/reports',
    //   icon: BarChart3,
    //   label: 'Báo cáo thống kê'
    // },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Cài đặt hệ thống'
    }
  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-header">
        <h2>Quản trị hệ thống</h2>
      </div>

      <ul className="admin-navbar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? location.pathname === item.path
            : isActive(item.path);

          return (
            <li key={item.path} className={`menu-item ${active ? 'active' : ''}`}>
              <Link to={item.path} className="menu-link">
                <Icon size={20} className="menu-icon" />
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminNavbar;