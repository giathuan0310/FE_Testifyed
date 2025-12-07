import { useEffect, useRef } from 'react';
import { getAccountApi } from '../service/api/apiUser';

export const useSessionCheck = () => {
    const isCheckingRef = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const checkSession = async () => {
            if (isCheckingRef.current) return;
            isCheckingRef.current = true;

            try {
                // ✅ GỌI API ACCOUNT CÓ SẴN
                await getAccountApi();
            } catch (error) {
                // Error đã được xử lý trong axios interceptor
            } finally {
                isCheckingRef.current = false;
            }
        };

        // Kiểm tra khi chuyển tab
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkSession();
            }
        };

        // Kiểm tra khi focus window
        const handleFocus = () => {
            checkSession();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return null;
};