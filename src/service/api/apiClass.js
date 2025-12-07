import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const getAllClassApi = async () => {
    const response = await axiosInstance.get("/v1/api/class", {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getClassByIdApi = async (id) => {
    const response = await axiosInstance.get(`/v1/api/class/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const createClassApi = async (classData) => {
    const response = await axiosInstance.post("/v1/api/class", classData, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateClassApi = async (id, classData) => {
    const response = await axiosInstance.put(`/v1/api/class/${id}`, classData, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const deleteClassApi = async (id) => {
    const response = await axiosInstance.delete(`/v1/api/class/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const joinClassApi = async (codeJoin, passJoin) => {
    try {
        const response = await axiosInstance.post("/v1/api/class/join", { codeJoin, passJoin }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const addStudentToClassApi = async (classId, studentCode) => {
    const response = await axiosInstance.post(`/v1/api/class/${classId}/add-student`, { studentCode }, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const removeStudentFromClassApi = async (classId, studentCode) => {
    const response = await axiosInstance.post(`/v1/api/class/${classId}/remove-student`, { studentCode }, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const getMyClassesApi = async () => {
    const response = await axiosInstance.get("/v1/api/class/my-classes", {
        headers: getAuthHeader()
    });
    return response.data;
};

