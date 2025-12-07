import { useState, useCallback } from 'react';
import { getClassExamResultsApi } from '../service/api/apiExam';

export const useClassResults = () => {
    const [classResults, setClassResults] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch class exam results từ API
     */
    const fetchClassResults = useCallback(async (classId) => {
        if (!classId) {
            const errorMsg = 'Class ID is required';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getClassExamResultsApi(classId);

            if (response && response.success) {
                setClassResults(response.data);
                setSelectedClassId(classId);
                return { success: true, data: response.data };
            } else {
                const errorMsg = response?.error || 'Failed to fetch class results';
                setError(errorMsg);
                return { success: false, error: errorMsg };
            }

        } catch (err) {
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Không thể kết nối đến server';

            setError(errorMessage);
            setClassResults(null);
            setSelectedClassId(null);

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reset error
     */
    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Data
        classResults,
        selectedClassId,

        // State
        loading,
        error,

        // Actions
        fetchClassResults,
        resetError
    };
};