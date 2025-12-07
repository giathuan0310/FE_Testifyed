import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Target,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { StatsCard } from '../../../components/ui';
import { 
  useAdminStats, 
  useRoleDistribution, 
  useActivityData, 
  useRecentActivities,
  useScoreDistribution
} from '../../../hooks/useAdminDashboard';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [showAllActivities, setShowAllActivities] = React.useState(false);
  
  // Sử dụng hooks với dữ liệu thật từ API
  const stats = useAdminStats();
  const { data: roleData, loading: roleLoading } = useRoleDistribution();
  const { data: activityData, loading: activityLoading } = useActivityData();
  const { activities, loading: activitiesLoading } = useRecentActivities();
  const { data: scoreDistribution, loading: scoreLoading } = useScoreDistribution();

  // Hiển thị 3 hoạt động đầu hoặc tất cả
  const displayedActivities = showAllActivities ? activities : activities.slice(0, 3);

  // Stats data for cards
  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users size={24} />,
      color: 'blue',
      subtitle: `${stats.totalStudents} sinh viên, ${stats.totalInstructors} giảng viên`
    },
    {
      title: 'Lớp học',
      value: stats.totalClasses.toLocaleString(),
      icon: <GraduationCap size={24} />,
      color: 'green'
    },
    {
      title: 'Môn học',
      value: stats.totalSubjects.toLocaleString(),
      icon: <BookOpen size={24} />,
      color: 'purple'
    },
    {
      title: 'Bài thi',
      value: stats.totalExams.toLocaleString(),
      icon: <FileText size={24} />,
      color: 'orange'
    },
    {
      title: 'Câu hỏi',
      value: stats.totalQuestions.toLocaleString(),
      icon: <Target size={24} />,
      color: 'indigo',
      subtitle: 'Trong ngân hàng câu hỏi'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#dc2626'];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Admin</h1>
          <p>Tổng quan hệ thống quản lý thi trực tuyến</p>
        </div>
        <div className="dashboard-actions">
          <button className="refresh-btn">
            <Activity size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Role Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Phân bố vai trò</h3>
            <Users size={20} className="text-blue-500" />
          </div>
          <div className="chart-container">
            {roleLoading ? (
              <div className="chart-loading">Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Hoạt động theo ngày trong tuần</h3>
            <Activity size={20} className="text-purple-500" />
          </div>
          <div className="chart-container">
            {activityLoading ? (
              <div className="chart-loading">Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="exams" fill="#3b82f6" name="Số lượt làm bài" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Phân bố điểm số</h3>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="chart-container">
            {scoreLoading ? (
              <div className="chart-loading">Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Số bài thi" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Hoạt động gần đây</h3>
            <Clock size={20} className="text-purple-500" />
          </div>
          <div className="activities-list">
            {activitiesLoading ? (
              <div className="activities-loading">Đang tải hoạt động...</div>
            ) : activities.length === 0 ? (
              <div className="activities-empty">Chưa có hoạt động nào</div>
            ) : (
              <>
                {displayedActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'user' && <Users size={16} />}
                      {activity.type === 'exam' && <FileText size={16} />}
                      {activity.type === 'submission' && <CheckCircle size={16} />}
                      {activity.type === 'class' && <GraduationCap size={16} />}
                      {activity.type === 'system' && <TrendingUp size={16} />}
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
                
                {activities.length > 3 && (
                  <button 
                    className="view-more-btn"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? (
                      <>
                        <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <TrendingUp size={16} style={{ transform: 'rotate(90deg)' }} />
                        Xem thêm ({activities.length - 3} hoạt động)
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Thao tác nhanh</h3>
        <div className="actions-grid">
          <button className="action-card">
            <Users size={24} />
            <span>Quản lý người dùng</span>
          </button>
          <button className="action-card">
            <GraduationCap size={24} />
            <span>Quản lý lớp học</span>
          </button>
          <button className="action-card">
            <BookOpen size={24} />
            <span>Quản lý môn học</span>
          </button>
          <button className="action-card">
            <FileText size={24} />
            <span>Quản lý bài thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;