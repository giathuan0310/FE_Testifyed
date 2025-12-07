import { useState, useEffect } from 'react';
import { 
  getDashboardStatsApi,
  getUserGrowthDataApi,
  getRoleDistributionApi,
  getActivityDataApi,
  getRecentActivitiesApi,
  getScoreDistributionApi
} from '../service/api/apiAdmin';

// Hook cho thống kê tổng quan
export const useAdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalExamAttempts: 0,
    completedExams: 0,
    inProgressExams: 0,
    averageScore: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        const response = await getDashboardStatsApi();

        if (response.status) {
          const data = response.data;
          
          setStats({
            totalUsers: data.users.total,
            totalStudents: data.users.students,
            totalInstructors: data.users.instructors,
            totalAdmins: data.users.admins,
            totalClasses: data.classes,
            totalSubjects: data.subjects,
            totalExams: data.exams,
            totalQuestions: data.questions,
            totalExamAttempts: data.examAttempts.total,
            completedExams: data.examAttempts.completed,
            inProgressExams: data.examAttempts.inProgress,
            averageScore: data.averageScore,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Không thể tải thống kê'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};

// Hook cho biểu đồ user growth
export const useUserGrowthData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGrowthData = async () => {
      try {
        const response = await getUserGrowthDataApi();
        if (response.status) {
          // Format month để hiển thị đẹp hơn
          const formattedData = response.data.map(item => ({
            ...item,
            month: formatMonth(item.month)
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching user growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGrowthData();
  }, []);

  return { data, loading };
};

// Helper function để format tháng
const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return monthNames[parseInt(month) - 1];
};

// Hook cho phân bố vai trò
export const useRoleDistribution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await getRoleDistributionApi();
        if (response.status) {
          const pieData = response.data.map(item => ({
            name: item.name,
            value: item.value,
            fill: item.name === 'Sinh viên' ? '#3b82f6' : 
                  item.name === 'Giảng viên' ? '#10b981' : '#f59e0b'
          }));
          setData(pieData);
        }
      } catch (error) {
        console.error('Error fetching role distribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, []);

  return { data, loading };
};

// Hook cho thống kê hoạt động
export const useActivityData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await getActivityDataApi();
        if (response.status) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  return { data, loading };
};

// Hook cho recent activities
export const useRecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await getRecentActivitiesApi(10);
        if (response.status) {
          const formattedActivities = response.data.map((activity, index) => ({
            id: index,
            type: activity.type,
            message: activity.message,
            time: formatTimeAgo(activity.time),
            icon: activity.icon
          }));
          setActivities(formattedActivities);
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return { activities, loading };
};

// Helper function để format thời gian thành "x phút trước", "x giờ trước"
const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return past.toLocaleDateString('vi-VN');
};

// Hook cho phân bố điểm số
export const useScoreDistribution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoreDistribution = async () => {
      try {
        const response = await getScoreDistributionApi();
        if (response.status) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching score distribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreDistribution();
  }, []);

  return { data, loading };
};