import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const getAllExamSchedulesApi = async () => {
    const response = await axiosInstance.get("/v1/api/exam-schedule", {
        headers: getAuthHeader()
    });
    return response.data;
};
export const getExamScheduleByIdApi = async (id) => {
    const response = await axiosInstance.get(`/v1/api/exam-schedule/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};
export const createExamScheduleApi = async (examScheduleData) => {
    const response = await axiosInstance.post("/v1/api/exam-schedule", examScheduleData, {
        headers: getAuthHeader()
    });
    return response.data;
};
export const updateExamScheduleApi = async (id, examScheduleData) => {
    const response = await axiosInstance.put(`/v1/api/exam-schedule/${id}`, examScheduleData, {
        headers: getAuthHeader()
    });
    return response.data;
};
export const deleteExamScheduleApi = async (id) => {
    const response = await axiosInstance.delete(`/v1/api/exam-schedule/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Lấy lịch thi cua student hiện tại

export const getMyExamSchedulesApi = async () => {
    const response = await axiosInstance.get("/v1/api/exam-schedule/my", {
        headers: getAuthHeader()
    });
    return response.data;
};

export const cancelExamScheduleApi = async (id) => {
    const response = await axiosInstance.patch(`/v1/api/exam-schedule/${id}/cancel`, null, {
        headers: getAuthHeader()
    });
    return response.data;
};