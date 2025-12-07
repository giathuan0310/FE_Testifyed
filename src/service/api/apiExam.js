import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const getAllExamApi = async () => {
    const response = await axiosInstance.get("/v1/api/exam", {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

export const getExamByIdApi = async (id) => {
    const response = await axiosInstance.get(`/v1/api/exam/${id}`, {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

export const createExamApi = async (examData) => {
    const response = await axiosInstance.post("/v1/api/exam", examData, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: exam }
};

export const updateExamApi = async (id, examData) => {
    const response = await axiosInstance.put(`/v1/api/exam/${id}`, examData, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: exam }
};

export const checkExamConstraintsApi = async (examId) => {
    const response = await axiosInstance.get(`/v1/api/exam/${examId}/check-constraints`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const deleteExamApi = async (id) => {
    const response = await axiosInstance.delete(`/v1/api/exam/${id}`, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, message: "..." }
};

// === EXAM INSTANCE APIs ===

/**
 * Tạo hoặc lấy đề thi cho sinh viên
 */
export const generateExamQuestionsApi = async (examId, studentId) => {
    const response = await axiosInstance.get(`/v1/api/exam/${examId}/generate/${studentId}`, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: examInstance }
};

/**
 * Bắt đầu làm bài thi
 */
export const startExamApi = async (examId, studentId) => {
    try {
        const response = await axiosInstance.post(`/v1/api/exam/${examId}/start/${studentId}`, {}, {
            headers: getAuthHeader()
        });

        console.log('Raw startExam response:', response);

        // Handle both response.data and direct response formats
        if (response && response.data) {
            return response.data; // Standard axios response
        } else if (response && (response.success !== undefined)) {
            return response; // Intercepted error response
        } else {
            console.error('Unexpected response format:', response);
            return { success: false, error: 'Unexpected response format' };
        }
    } catch (error) {
        console.error('StartExam API error:', error);
        // This should not happen due to interceptor, but just in case
        throw error;
    }
};

/**
 * Nộp câu trả lời
 */
export const submitAnswerApi = async (examId, studentId, questionId, answer) => {
    const response = await axiosInstance.post(`/v1/api/exam/${examId}/answer/${studentId}`, {
        questionId,
        answer
    }, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, message: "..." }
};

/**
 * Nộp bài thi
 */
export const submitExamApi = async (examId, studentId) => {
    const response = await axiosInstance.post(`/v1/api/exam/${examId}/submit/${studentId}`, {}, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: result }
};

/**
 * Lấy kết quả thi
 */
export const getExamResultApi = async (examId, studentId, attempt = null) => {
    let url = `/v1/api/exam/${examId}/result/${studentId}`;
    if (attempt) {
        url += `?attempt=${attempt}`;
    }

    const response = await axiosInstance.get(url, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Lấy danh sách exam instances (cho instructor)
 */
export const getExamInstancesApi = async (examId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/v1/api/exam/${examId}/instances?${queryParams}` : `/v1/api/exam/${examId}/instances`;

    const response = await axiosInstance.get(url, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: { examInstances, pagination } }
};

/**
 * Debug endpoint - kiểm tra exam instance
 */
export const debugExamInstanceApi = async (examId, studentId) => {
    const response = await axiosInstance.get(`/v1/api/exam/${examId}/debug/${studentId}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Debug endpoint - kiểm tra câu hỏi có thể dùng để tạo đề thi
 */
export const validateExamQuestionsApi = async (generationConfig) => {
    console.log('🔍 validateExamQuestionsApi called with:', generationConfig);
    const response = await axiosInstance.post("/v1/api/exam/validate-questions", {
        generationConfig
    }, {
        headers: getAuthHeader()
    });
    console.log('📥 validateExamQuestionsApi response:', response.data);
    return response.data;
};

/**
 * Lấy danh sách tất cả attempts của sinh viên
 */
export const getStudentAttemptsApi = async (examId, studentId) => {
    const response = await axiosInstance.get(`/v1/api/exam/${examId}/attempts/${studentId}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Lấy trạng thái exam instance của sinh viên
 */
export const getExamInstanceStatusApi = async (examId, studentId) => {
    const response = await axiosInstance.get(`/v1/api/exam/${examId}/status/${studentId}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

/**
 * Lấy kết quả thi của tất cả sinh viên trong lớp
 */
export const getClassExamResultsApi = async (classId) => {
    try {
        const response = await axiosInstance.get(`/v1/api/exam/results/class/${classId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching class exam results:', error);
        throw error;
    }
};
/**
 * ✅ Cập nhật IP restriction cho exam
 */
export const updateExamIPRestrictionApi = async (examId, config) => {
    const response = await axiosInstance.put(`/v1/api/exam/${examId}/ip-restriction`, config, {
        headers: getAuthHeader()
    });
    return response.data;
};