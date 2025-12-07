import { useState, useCallback, useEffect } from 'react';
import {
    getAllSubjectsApi,
    getSubjectByIdApi,
    createSubjectApi,
    updateSubjectApi,
    deleteSubjectApi
} from '../service/api/apiSubject';
import { DEFAULT_VALUES } from '../constants/instructor';

export const useSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSubjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getAllSubjectsApi();
            setSubjects(res.data || []);
        } catch (err) {
            setError('Không thể tải danh sách môn học');
            setSubjects([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const addSubject = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await createSubjectApi(data);
            await fetchSubjects();
            return { success: true };
        } catch (err) {
            setError(err.message || 'Thêm môn học thất bại');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [fetchSubjects]);

    const updateSubject = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);
        try {
            await updateSubjectApi(id, data);
            await fetchSubjects();
            return { success: true };
        } catch (err) {
            setError(err.message || 'Cập nhật môn học thất bại');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [fetchSubjects]);
    const deleteSubject = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            await deleteSubjectApi(id);
            await fetchSubjects();
            return { success: true };
        } catch (err) {
            // Xử lý axios error
            let errorMessage = 'Xóa môn học thất bại';
            let constraints = null;

            if (err.response && err.response.data) {
                // Lỗi từ server (400, 500, etc.)
                errorMessage = err.response.data.message || errorMessage;
                constraints = err.response.data.constraints || null;
            } else if (err.message) {
                // Lỗi network hoặc khác
                errorMessage = err.message;
            }
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage,
                constraints: constraints
            };
        } finally {
            setIsLoading(false);
        }
    }, [fetchSubjects]);


    return {
        subjects,
        isLoading,
        error,
        addSubject,
        updateSubject,
        deleteSubject,
        fetchSubjects,
        defaultValues: DEFAULT_VALUES.SUBJECT
    };
};