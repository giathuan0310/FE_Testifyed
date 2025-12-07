import { create } from "zustand";
import { getAccountApi } from "../service/api/apiUser";

export const useAppStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isAppLoading: true,
    isModalOpen: false,
    

    setUser: (user) => set({ user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setIsAppLoading: (value) => set({ isAppLoading: value }),
    setIsModalOpen: (value) => set({ isModalOpen: value }),
    
    clearUser: () => set({ user: null, isAuthenticated: false }),
    fetchAccount: async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return set({ isAppLoading: false });

            // Giả sử bạn có hàm fetchAccountApi gọi API /account
            const res = await getAccountApi();
            if (res.data) {
                set({ user: res.data.user, isAuthenticated: true });
            } else {
                localStorage.removeItem("accessToken");
            }
        } catch (err) {
            localStorage.removeItem("accessToken");
        }
        set({ isAppLoading: false });
    },
}));