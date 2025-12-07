import React, { useState, useEffect } from 'react';
import { PageHeader, StatsCard } from '../../components/ui';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Calendar,
  TrendingUp,
  UserCheck,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalSubjects: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
    totalClasses: 0
  });

  // Mock data - thay thế bằng API call thực tế
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalStudents: 1000,
        totalInstructors: 45,
        totalSubjects: 25,
        totalQuestions: 2500,
        totalExams: 150,
        activeExams: 12,
        totalClasses: 80
      });
    }, 1000);
  }, []);

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: 'blue',
      trend: '+12%',
      subtitle: 'So với tháng trước'
    },
    {
      title: 'Sinh viên',
      value: stats.totalStudents,
      icon: <UserCheck size={24} />,
      color: 'green',
      trend: '+8%',
      subtitle: 'Đã đăng ký'
    },
    {
      title: 'Giảng viên',
      value: stats.totalInstructors,
      icon: <GraduationCap size={24} />,
      color: 'purple',
      trend: '+2%',
      subtitle: 'Hoạt động'
    },
    {
      title: 'Môn học',
      value: stats.totalSubjects,
      icon: <BookOpen size={24} />,
      color: 'orange',
      trend: '+5%',
      subtitle: 'Đang giảng dạy'
    },
    {
      title: 'Câu hỏi',
      value: stats.totalQuestions,
      icon: <FileText size={24} />,
      color: 'cyan',
      trend: '+25%',
      subtitle: 'Trong ngân hàng'
    },
    {
      title: 'Kỳ thi',
      value: stats.totalExams,
      icon: <Calendar size={24} />,
      color: 'red',
      trend: '+15%',
      subtitle: 'Đã tạo'
    },
    {
      title: 'Thi đang diễn ra',
      value: stats.activeExams,
      icon: <ClipboardList size={24} />,
      color: 'yellow',
      trend: 'Hiện tại',
      subtitle: 'Đang hoạt động'
    },
    {
      title: 'Lớp học',
      value: stats.totalClasses,
      icon: <Users size={24} />,
      color: 'indigo',
      trend: '+10%',
      subtitle: 'Đang học'
    }
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Dashboard Admin"
        subtitle="Tổng quan về hệ thống quản lý thi trắc nghiệm"
        showAddButton={false}
        showRefreshButton={false}
      />

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card-wrapper">
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              subtitle={stat.subtitle}
            />
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <div className="chart-container">
            <h3 className="chart-title">
              <TrendingUp size={20} />
              Thống kê hoạt động hệ thống
            </h3>
            <div className="chart-placeholder">
              <div className="placeholder-content">
                <TrendingUp size={48} color="#6b7280" />
                <p>Biểu đồ thống kê sẽ được hiển thị tại đây</p>
                <span className="placeholder-note">
                  Tích hợp với thư viện biểu đồ như Chart.js hoặc Recharts
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-container">
            <h3 className="activity-title">
              <ClipboardList size={20} />
              Hoạt động gần đây
            </h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    5 sinh viên mới đăng ký vào hệ thống
                  </p>
                  <span className="activity-time">2 giờ trước</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <Calendar size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Kỳ thi "Toán cao cấp A1" đã được tạo
                  </p>
                  <span className="activity-time">4 giờ trước</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <FileText size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Thêm 25 câu hỏi mới vào ngân hàng câu hỏi
                  </p>
                  <span className="activity-time">6 giờ trước</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <BookOpen size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Môn học "Lập trình Web" đã được cập nhật
                  </p>
                  <span className="activity-time">1 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="actions-container">
          <h3 className="actions-title">Thao tác nhanh</h3>
          <div className="actions-grid">
            <button className="quick-action-btn">
              <Users size={20} />
              <span>Thêm người dùng</span>
            </button>
            <button className="quick-action-btn">
              <BookOpen size={20} />
              <span>Tạo môn học</span>
            </button>
            <button className="quick-action-btn">
              <FileText size={20} />
              <span>Thêm câu hỏi</span>
            </button>
            <button className="quick-action-btn">
              <Calendar size={20} />
              <span>Tạo kỳ thi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;