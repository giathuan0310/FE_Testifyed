import React from 'react';
import {
  FiBook,
  FiHelpCircle,
  FiClipboard,
  FiUsers,
  FiPlus,
  FiEdit3,
  FiCalendar,
  FiSettings
} from 'react-icons/fi';
import { StatsGrid, QuickActions, RecentActivities } from './components';
import './DashBoard.css';

const DashBoard = () => {
  const stats = [
    {
      id: 'courses',
      title: 'Khóa học',
      value: '12',
      description: 'Khóa học đang quản lý',
      icon: FiBook,
      color: 'courses'
    },
    {
      id: 'questions',
      title: 'Câu hỏi',
      value: '248',
      description: 'Câu hỏi trong ngân hàng',
      icon: FiHelpCircle,
      color: 'questions'
    },
    {
      id: 'exams',
      title: 'Bài thi',
      value: '8',
      description: 'Bài thi đã tạo',
      icon: FiClipboard,
      color: 'exams'
    },
    {
      id: 'students',
      title: 'Sinh viên',
      value: '156',
      description: 'Sinh viên đang theo học',
      icon: FiUsers,
      color: 'students'
    }
  ];

  const quickActions = [
    {
      title: 'Tạo khóa học mới',
      description: 'Thêm khóa học vào danh sách',
      icon: FiPlus,
      link: '/instructor/courses/new'
    },
    {
      title: 'Thêm câu hỏi',
      description: 'Bổ sung ngân hàng câu hỏi',
      icon: FiEdit3,
      link: '/instructor/questions'
    },
    {
      title: 'Tạo bài thi',
      description: 'Lập lịch thi cho sinh viên',
      icon: FiCalendar,
      link: '/instructor/exams/new'
    },
    {
      title: 'Cài đặt tài khoản',
      description: 'Quản lý thông tin cá nhân',
      icon: FiSettings,
      link: '/instructor/settings'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'course',
      message: 'Đã tạo khóa học "Lập trình Web nâng cao"',
      time: '2 giờ trước',
      icon: FiBook
    },
    {
      id: 2,
      type: 'question',
      message: 'Đã thêm 15 câu hỏi vào môn "React.js"',
      time: '4 giờ trước',
      icon: FiHelpCircle
    },
    {
      id: 3,
      type: 'exam',
      message: 'Đã lên lịch bài thi "Kiểm tra giữa kỳ"',
      time: '1 ngày trước',
      icon: FiClipboard
    },
    {
      id: 4,
      type: 'student',
      message: '23 sinh viên mới đăng ký khóa học',
      time: '2 ngày trước',
      icon: FiUsers
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng trở lại! Dưới đây là tổng quan về hoạt động giảng dạy của bạn.</p>
      </div>

      <StatsGrid stats={stats} />
      <QuickActions actions={quickActions} />
      <RecentActivities activities={recentActivities} />
    </div>
  );
};

export default DashBoard;
