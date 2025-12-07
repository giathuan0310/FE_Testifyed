import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

// ============= DASHBOARD STATISTICS =============
// Lấy thống kê tổng quan
export const getDashboardStatsApi = async () => {
    const res = await axiosInstance.get("/v1/api/dashboard/stats", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy dữ liệu tăng trưởng người dùng
export const getUserGrowthDataApi = async () => {
    const res = await axiosInstance.get("/v1/api/dashboard/user-growth", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy phân bố vai trò
export const getRoleDistributionApi = async () => {
    const res = await axiosInstance.get("/v1/api/dashboard/role-distribution", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy dữ liệu hoạt động
export const getActivityDataApi = async () => {
    const res = await axiosInstance.get("/v1/api/dashboard/activity", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy hoạt động gần đây
export const getRecentActivitiesApi = async (limit = 10) => {
    const res = await axiosInstance.get(`/v1/api/dashboard/recent-activities?limit=${limit}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy phân bố điểm số
export const getScoreDistributionApi = async () => {
    const res = await axiosInstance.get("/v1/api/dashboard/score-distribution", {
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= USER MANAGEMENT =============
// Lấy tất cả người dùng
export const getAllUsersApi = async () => {
    const res = await axiosInstance.get("/v1/api/user", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Tạo người dùng mới
export const createUserApi = async (userData) => {
    const res = await axiosInstance.post("/v1/api/user", userData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy tất cả sinh viên
export const getAllStudentsApi = async () => {
    const res = await axiosInstance.get("/v1/api/user/students", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy user theo mã
export const getUserByCodeApi = async (code) => {
    const res = await axiosInstance.get(`/v1/api/user/${code}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật user
export const updateUserApi = async (code, data) => {
    const res = await axiosInstance.put(`/v1/api/user/${code}`, data, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa người dùng
export const deleteUserApi = async (code) => {
    const res = await axiosInstance.delete(`/v1/api/user/${code}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Vô hiệu hóa user
export const disableUserApi = async (code) => {
    const res = await axiosInstance.put(`/v1/api/user/disable/${code}`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Kích hoạt user
export const enableUserApi = async (code) => {
    const res = await axiosInstance.put(`/v1/api/user/enable/${code}`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Toggle trạng thái user (active/inactive)
export const toggleUserStatusApi = async (code) => {
    const res = await axiosInstance.put(`/v1/api/user/toggle-status/${code}`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Đổi mật khẩu user
export const updateUserPasswordApi = async (code, newPassword) => {
    const res = await axiosInstance.put(`/v1/api/user/${code}/password`, { newPassword }, {
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= CLASS MANAGEMENT =============
// Lấy tất cả lớp học (instructor)
export const getAllClassesApi = async () => {
    const res = await axiosInstance.get("/v1/api/class", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Admin: Lấy tất cả lớp học với thông tin đầy đủ
export const getAllClassesForAdminApi = async () => {
    const res = await axiosInstance.get("/v1/api/class/admin/all", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Tạo lớp học mới
export const createClassApi = async (classData) => {
    const res = await axiosInstance.post("/v1/api/class", classData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật lớp học
export const updateClassApi = async (id, classData) => {
    const res = await axiosInstance.put(`/v1/api/class/${id}`, classData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Kiểm tra ràng buộc trước khi xóa lớp học (API thật từ backend)
export const checkClassConstraintsApi = async (classId) => {
    const res = await axiosInstance.get(`/v1/api/class/${classId}/check-constraints`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa lớp học (cần kiểm tra ràng buộc trước)
export const deleteClassApi = async (id) => {
    const res = await axiosInstance.delete(`/v1/api/class/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Thêm sinh viên vào lớp
export const addStudentToClassApi = async (classId, studentCode) => {
    const res = await axiosInstance.post(`/v1/api/class/${classId}/students`, { studentCode }, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa sinh viên khỏi lớp
export const removeStudentFromClassApi = async (classId, studentCode) => {
    const res = await axiosInstance.delete(`/v1/api/class/${classId}/students`, {
        data: { studentCode },
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= SUBJECT MANAGEMENT =============
// Lấy tất cả môn học
export const getAllSubjectsApi = async () => {
    const res = await axiosInstance.get("/v1/api/subject", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Tạo môn học mới
export const createSubjectApi = async (subjectData) => {
    const res = await axiosInstance.post("/v1/api/subject", subjectData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật môn học
export const updateSubjectApi = async (id, subjectData) => {
    const res = await axiosInstance.put(`/v1/api/subject/${id}`, subjectData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Kiểm tra ràng buộc trước khi xóa môn học (API thật từ backend)
export const checkSubjectConstraintsApi = async (id) => {
    const res = await axiosInstance.get(`/v1/api/subject/${id}/check-constraints`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa môn học (với kiểm tra ràng buộc)
export const deleteSubjectApi = async (id) => {
    const res = await axiosInstance.delete(`/v1/api/subject/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= EXAM MANAGEMENT =============
// Lấy tất cả bài thi
export const getAllExamsApi = async () => {
    const res = await axiosInstance.get("/v1/api/exam", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy bài thi theo ID
export const getExamByIdApi = async (id) => {
    const res = await axiosInstance.get(`/v1/api/exam/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Tạo bài thi mới
export const createExamApi = async (examData) => {
    const res = await axiosInstance.post("/v1/api/exam", examData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật bài thi
export const updateExamApi = async (id, examData) => {
    const res = await axiosInstance.put(`/v1/api/exam/${id}`, examData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật trạng thái bài thi
export const updateExamStatusApi = async (id, status) => {
    const res = await axiosInstance.patch(`/v1/api/exam/${id}/status`, { status }, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Kiểm tra ràng buộc trước khi xóa bài thi (kiểm tra có lịch thi phụ thuộc không)
export const checkExamConstraintsApi = async (examId) => {
    const res = await axiosInstance.get(`/v1/api/exam/${examId}/check-constraints`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa bài thi (cần kiểm tra ràng buộc trước)
export const deleteExamApi = async (id) => {
    const res = await axiosInstance.delete(`/v1/api/exam/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy danh sách exam instances
export const getExamInstancesApi = async (examId) => {
    const res = await axiosInstance.get(`/v1/api/exam/${examId}/instances`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Validate câu hỏi cho bài thi
export const validateExamQuestionsApi = async (examData) => {
    const res = await axiosInstance.post("/v1/api/exam/validate-questions", examData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= QUESTION MANAGEMENT =============
// Lấy tất cả câu hỏi
export const getAllQuestionsApi = async () => {
    const res = await axiosInstance.get("/v1/api/question", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy câu hỏi theo ID
export const getQuestionByIdApi = async (id) => {
    const res = await axiosInstance.get(`/v1/api/question/${id}`, {
        headers: getAuthHeader()
    });
    return res.data.data || res.data;
};

// Tạo câu hỏi mới
export const createQuestionApi = async (questionData) => {
    const res = await axiosInstance.post("/v1/api/question", questionData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật câu hỏi
export const updateQuestionApi = async (id, questionData) => {
    const res = await axiosInstance.put(`/v1/api/question/${id}`, questionData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa câu hỏi
export const deleteQuestionApi = async (id) => {
    const res = await axiosInstance.delete(`/v1/api/question/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy chapters theo subject ID
export const getChaptersBySubjectIdApi = async (subjectId) => {
    const res = await axiosInstance.get(`/v1/api/question/chapters/${subjectId}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Alias cho ManageQuestions component
export const getQuestionChaptersBySubjectApi = getChaptersBySubjectIdApi;

// Lấy topics theo subject và chapter
export const getTopicsBySubjectAndChapterApi = async (subjectId, chapter) => {
    const res = await axiosInstance.get(`/v1/api/question/topics/${subjectId}/${chapter}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Alias cho ManageQuestions component
export const getQuestionTopicsBySubjectChapterApi = getTopicsBySubjectAndChapterApi;

// ============= EXAM SCHEDULE MANAGEMENT =============
// Lấy tất cả lịch thi
export const getAllExamSchedulesApi = async () => {
    const res = await axiosInstance.get("/v1/api/exam-schedule", {
        headers: getAuthHeader()
    });
    return res.data;
};

// Lấy lịch thi theo ID
export const getExamScheduleByIdApi = async (id) => {
    const res = await axiosInstance.get(`/v1/api/exam-schedule/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Tạo lịch thi mới
export const createExamScheduleApi = async (scheduleData) => {
    const res = await axiosInstance.post("/v1/api/exam-schedule", scheduleData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Cập nhật lịch thi
export const updateExamScheduleApi = async (id, scheduleData) => {
    const res = await axiosInstance.put(`/v1/api/exam-schedule/${id}`, scheduleData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa lịch thi
export const deleteExamScheduleApi = async (id) => {
    const res = await axiosInstance.delete(`/v1/api/exam-schedule/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

// ============= BULK OPERATIONS =============
// Preview Excel data trước khi import
export const previewExcelDataApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post("/v1/api/user/preview", formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};

// Import users từ Excel
export const importUsersFromExcelApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post("/v1/api/user/import", formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};

// Import users từ preview data đã được filter
export const importFilteredUsersApi = async (usersData) => {
    const res = await axiosInstance.post("/v1/api/user/import-filtered", usersData, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Export users ra Excel
export const exportUsersApi = async (filters = {}) => {
    const res = await axiosInstance.get("/v1/api/user/export", {
        headers: getAuthHeader(),
        params: filters,
        responseType: 'blob'
    });
    return res;
};

// Tạo nhiều users cùng lúc
export const bulkCreateUsersApi = async (usersData) => {
    const res = await axiosInstance.post("/v1/api/user/bulk", { users: usersData }, {
        headers: getAuthHeader()
    });
    return res.data;
};

// Xóa nhiều users cùng lúc
export const bulkDeleteUsersApi = async (userCodes) => {
    const res = await axiosInstance.delete("/v1/api/user/bulk", {
        data: { userCodes },
        headers: getAuthHeader()
    });
    return res.data;
};

export const cancelExamScheduleApi = async (id) => {
    const response = await axiosInstance.patch(`/v1/api/exam-schedule/${id}/cancel`, null, {
        headers: getAuthHeader()
    });
    return response.data;
};

