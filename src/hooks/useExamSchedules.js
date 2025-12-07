import { useState, useEffect, useCallback } from "react";
import {
    getAllExamSchedulesApi,
    getExamScheduleByIdApi,
    createExamScheduleApi,
    updateExamScheduleApi,
    deleteExamScheduleApi,
    getMyExamSchedulesApi,
    cancelExamScheduleApi
} from "../service/api/apiExamSchedule";

export const useExamSchedules = (subjects = [], classes = []) => {
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0
    });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('all');

    // Fetch all schedules
    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getAllExamSchedulesApi();
            const schedulesData = res.data || [];
            setSchedules(schedulesData);

            // Calculate stats with correct status names
            const newStats = {
                total: schedulesData.length,
                scheduled: schedulesData.filter(s => s.status === 'scheduled').length,
                in_progress: schedulesData.filter(s => s.status === 'in_progress').length,
                completed: schedulesData.filter(s => s.status === 'completed').length,
                cancelled: schedulesData.filter(s => s.status === 'cancelled').length,
            };
            setStats(newStats);
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError(err.message || "Không thể tải lịch thi");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Get schedule by ID
    const getScheduleById = useCallback(async (scheduleId) => {
        setError(null);
        try {
            const res = await getExamScheduleByIdApi(scheduleId);
            return res.data || res;
        } catch (err) {
            console.error('Error in getScheduleById:', err);
            setError(err.message || 'Không thể lấy thông tin lịch thi');
            return null;
        }
    }, []);

    // Add new schedule
    const addSchedule = useCallback(async (scheduleData) => {
        setError(null);
        try {
            const res = await createExamScheduleApi(scheduleData);
            if (res.success || res.data) {
                await fetchSchedules(); // Refresh list
                return { success: true, data: res.data };
            } else {
                return {
                    success: false,
                    error: res.message || 'Không thể tạo lịch thi',
                    errors: res.errors
                };
            }
        } catch (err) {
            console.error('Error in addSchedule:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo lịch thi';
            const errors = err.response?.data?.errors || {};
            setError(errorMessage);
            return { success: false, error: errorMessage, errors };
        }
    }, [fetchSchedules]);

    // Update schedule
    const updateSchedule = useCallback(async (scheduleId, scheduleData) => {
        setError(null);
        try {
            const res = await updateExamScheduleApi(scheduleId, scheduleData);
            if (res.success || res.data) {
                await fetchSchedules(); // Refresh list
                return { success: true, data: res.data };
            } else {
                return {
                    success: false,
                    error: res.message || 'Không thể cập nhật lịch thi',
                    errors: res.errors
                };
            }
        } catch (err) {
            console.error('Error in updateSchedule:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật lịch thi';
            const errors = err.response?.data?.errors || {};
            setError(errorMessage);
            return { success: false, error: errorMessage, errors };
        }
    }, [fetchSchedules]);

    // Delete schedule
    const deleteSchedule = useCallback(async (scheduleId) => {
        setError(null);
        try {
            const res = await deleteExamScheduleApi(scheduleId);
            if (res.success !== false) {
                await fetchSchedules(); // Refresh list
                return { success: true };
            } else {
                return {
                    success: false,
                    error: res.message || 'Không thể xóa lịch thi'
                };
            }
        } catch (err) {
            console.error('Error in deleteSchedule:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa lịch thi';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [fetchSchedules]);

    const cancelSchedule = useCallback(async (scheduleId) => {
        setError(null);
        setIsLoading(true); // Thêm dòng này
        try {
            const res = await cancelExamScheduleApi(scheduleId);
            if (res.success || res.data) {
                await fetchSchedules(); // Refresh data
                return { success: true, data: res.data };
            } else {
                return {
                    success: false,
                    error: res.message || 'Không thể hủy lịch thi',
                    errors: res.errors
                };
            }
        } catch (err) {
            console.error('Error in cancelSchedule:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi hủy lịch thi';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [fetchSchedules]); // Thêm fetchSchedules vào dependency

    // Get my schedules (for students)
    const getMySchedules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getMyExamSchedulesApi();
            const schedulesData = res.data || [];
            setSchedules(schedulesData);
            return { success: true, data: schedulesData };
        } catch (err) {
            console.error('Error in getMySchedules:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Không thể lấy lịch thi của bạn';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Filter schedules based on current filters
    const filteredSchedules = schedules.filter(schedule => {
        // Search filter - tìm theo tên exam hoặc tên class
        const examName = schedule.examId?.name || '';
        const className = schedule.classId?.name || '';
        const matchesSearch = !searchTerm ||
            examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            className.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' || schedule.currentStatus === statusFilter;

        // Subject filter - lọc theo môn học của class
        const classSubjectId = schedule.classId?.subjectId;
        const matchesSubject = subjectFilter === 'all' || classSubjectId === subjectFilter;

        // Class filter
        const scheduleClassId = typeof schedule.classId === 'object' ? schedule.classId._id : schedule.classId;
        const matchesClass = classFilter === 'all' || scheduleClassId === classFilter;

        return matchesSearch && matchesStatus && matchesSubject && matchesClass;
    });


    return {
        // Data
        schedules: filteredSchedules,
        allSchedules: schedules,
        isLoading,
        error,
        stats,

        // Filters
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        subjectFilter,
        setSubjectFilter,
        classFilter,
        setClassFilter,

        // Actions
        fetchSchedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getScheduleById,
        getMySchedules,
        cancelSchedule,

        // Utilities
        refreshData: fetchSchedules
    };
};

// Hook riêng cho student - giữ nguyên như code cũ của bạn
export const useMyExamSchedules = () => {
    const [examSchedules, setExamSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await getMyExamSchedulesApi();
                setExamSchedules(res.data || []);
            } catch (err) {
                console.error('Error fetching my schedules:', err);
                setError("Không thể tải lịch thi");
            }
            setIsLoading(false);
        };
        fetchSchedules();
    }, []);

    return { examSchedules, isLoading, error };
};