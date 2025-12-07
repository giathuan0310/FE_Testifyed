import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

export const getAllQuestionApi = async () => {
    const response = await axiosInstance.get("/v1/api/question", {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

export const getQuestionByIdApi = async (id) => {
    const response = await axiosInstance.get(`/v1/api/question/${id}`, {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

export const createQuestionApi = async (questionData) => {
    const response = await axiosInstance.post("/v1/api/question", questionData, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: question }
};

export const updateQuestionApi = async (id, questionData) => {
    const response = await axiosInstance.put(`/v1/api/question/${id}`, questionData, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, data: question }
};

export const deleteQuestionApi = async (id) => {
    const response = await axiosInstance.delete(`/v1/api/question/${id}`, {
        headers: getAuthHeader()
    });
    return response.data; // Returns { success: true, message: "..." }
};

export const getChaptersBySubjectIdApi = async (subjectId) => {
    const response = await axiosInstance.get(`/v1/api/question/chapters/${subjectId}`, {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

export const getTopicsBySubjectAndChapterApi = async (subjectId, chapter) => {
    const response = await axiosInstance.get(`/v1/api/question/topics/${subjectId}/${encodeURIComponent(chapter)}`, {
        headers: getAuthHeader()
    });
    return response.data.data || response.data; // Handle both formats
};

// ============= IMPORT/EXPORT QUESTIONS =============

export const exportQuestionsApi = async () => {
    const response = await axiosInstance.get("/v1/api/question/export", {
        headers: getAuthHeader(),
        responseType: 'blob'
    });
    return response;
};

export const previewExcelQuestionsApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post("/v1/api/question/preview", formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data; // Returns { success: true, data: previewArray }
};

export const importQuestionsApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post("/v1/api/question/import", formData, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data; // Returns { success: true, data: importResult }
};

export const importFilteredQuestionsApi = async (questions) => {
    const response = await axiosInstance.post("/v1/api/question/import-filtered", 
        { questions }, 
        {
            headers: getAuthHeader()
        }
    );
    return response.data; // Returns { success: true, data: importResult }
};