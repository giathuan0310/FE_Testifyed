import axios from "axios";
import { Mutex } from "async-mutex";
import { toast } from "react-toastify";

const mutex = new Mutex();

const createInstanceAxios = (baseURL) => {
    const instance = axios.create({
        baseURL: baseURL,
        withCredentials: true,
    });

    const handleRefreshToken = async () => {
        return await mutex.runExclusive(async () => {
            const res = await instance.post("/v1/api/auth/refreshToken");
            if (res && res.data) return res.data.data && res.data.data.accessToken;
            else return null;
        });
    };

    // Add a request interceptor
    instance.interceptors.request.use(
        function (config) {
            const token = localStorage.getItem("accessToken");
            const auth = token ? `Bearer ${token}` : "";
            config.headers["Authorization"] = auth;
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    // Add a response interceptor
    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        async function (error) {
            const originalRequest = error.config;

            // ✅ XỬ LÝ SESSION EXPIRED (đăng nhập từ thiết bị khác)
            if (
                error.response?.status === 401 &&
                error.response?.data?.error === 'SESSION_EXPIRED' &&
                !originalRequest._sessionExpiredHandled
            ) {
                originalRequest._sessionExpiredHandled = true;

                const sessionInfo = error.response.data.data;
                const lastLogin = sessionInfo?.lastLogin
                    ? new Date(sessionInfo.lastLogin).toLocaleString('vi-VN')
                    : 'Không xác định';

                // ✅ HIỂN THỊ TOAST ĐƠN GIẢN
                toast.error(
                    `🚨 Tài khoản của bạn đã được đăng nhập từ thiết bị khác!\n\n` +
                    `⏰ Thời gian: ${lastLogin}\n` +
                    `📱 Thiết bị: ${sessionInfo?.userAgent || 'Không xác định'}\n\n` +
                    `⚠️ Nếu không phải bạn, hãy đổi mật khẩu ngay!\n\n` +
                    `Tự động đăng xuất sau 5 giây...`,
                    {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: false,
                        draggable: false,
                        closeButton: false,
                        style: {
                            fontSize: '14px',
                            whiteSpace: 'pre-line',
                            textAlign: 'left',
                            minWidth: '450px',
                            maxWidth: '500px'
                        }
                    }
                );

                // ✅ TỰ ĐỘNG LOGOUT SAU 5 GIÂY
                setTimeout(() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }, 5000);

                return Promise.reject(error);
            }

            // ✅ XỬ LÝ TOKEN EXPIRED (hết hạn bình thường - refresh token)
            if (
                error.config &&
                error.response &&
                +error.response.status === 401 &&
                error.response?.data?.error === 'TOKEN_EXPIRED' &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;

                const access_token = await handleRefreshToken();
                if (access_token) {
                    error.config.headers["Authorization"] = `Bearer ${access_token}`;
                    localStorage.setItem("accessToken", access_token);
                    return instance.request(error.config);
                } else {
                    // Refresh token thất bại
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
                }
            }

            // ✅ XỬ LÝ CÁC LỖI 401 KHÁC (không có error code đặc biệt)
            if (
                error.response?.status === 401 &&
                !error.response?.data?.error &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;

                const access_token = await handleRefreshToken();
                if (access_token) {
                    error.config.headers["Authorization"] = `Bearer ${access_token}`;
                    localStorage.setItem("accessToken", access_token);
                    return instance.request(error.config);
                }
            }

            // // ✅ XỬ LÝ LỖI 403 (Tài khoản bị khóa)
            // if (error.response?.status === 403) {
            //     console.log("Account disabled - redirecting to login", error.response);
            //     toast.error("Tài khoản của bạn đã bị khóa!");
            //     // localStorage.removeItem("accessToken");
            //     // localStorage.removeItem("user");
            //     // setTimeout(() => {
            //     //     window.location.href = "/login";
            //     // }, 2000);

            // }



            return Promise.reject(error);
        }
    );

    return instance;
};

export default createInstanceAxios;