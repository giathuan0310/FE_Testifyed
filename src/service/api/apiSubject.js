import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);


const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const getAllSubjectsApi = async () => {
    const response = await axiosInstance.get("/v1/api/subject", {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getSubjectByIdApi = async (subjectId) => {
    const response = await axiosInstance.get(`/v1/api/subject/${subjectId}`, {
        headers: getAuthHeader()
    });
    return response.data;
}

export const createSubjectApi = async (data) => {
    const response = await axiosInstance.post("/v1/api/subject", data, {
        headers: getAuthHeader()
    });
    return response.data;
}

export const updateSubjectApi = async (subjectId, data) => {
    const response = await axiosInstance.put(`/v1/api/subject/${subjectId}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
}

export const deleteSubjectApi = async (subjectId) => {
    const response = await axiosInstance.delete(`/v1/api/subject/${subjectId}`, {
        headers: getAuthHeader()
    });
    return response.data;
}