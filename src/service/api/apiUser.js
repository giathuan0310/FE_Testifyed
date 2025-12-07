import createInstanceAxios from "../axios.customize";

const axiosInstance = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
};

//login
export const loginApi = async (code, password) => {
    const res = await axiosInstance.post("/v1/api/auth/login", { code, password });
    return res.data;
};


//get account
export const getAccountApi = async () => {
    const res = await axiosInstance.get("/v1/api/auth/account", {
        headers: getAuthHeader()
    });
    return res.data;
};

//logout
export const logoutApi = async () => {
    const res = await axiosInstance.post("/v1/api/auth/logout", {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

//forgot password
export const forgotPasswordApi = async (email) => {
    const res = await axiosInstance.post("/v1/api/auth/forgotPassword", { email });
    return res.data;
};

//verify otp
export const verifyOtpApi = async (email, otp) => {
    const res = await axiosInstance.post("/v1/api/auth/verifyOtp", { email, otp });
    return res.data;
};

//reset password
export const resetPasswordApi = async (email, newPassword) => {
    const res = await axiosInstance.post("/v1/api/auth/resetPassword", { email, newPassword });
    return res.data;
};


//update profile
export const updateProfileApi = async (code, data) => {
    // data là FormData (có thể chứa avatar file)
    const res = await axiosInstance.put(`/v1/api/user/${code}`, data, {
        headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

//update password
export const updatePasswordApi = async (code, newPassword) => {
    const res = await axiosInstance.put(`/v1/api/user/${code}/password`, { newPassword }, {
        headers: getAuthHeader()
    });
    return res.data;
}