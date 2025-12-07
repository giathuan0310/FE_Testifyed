import { useState, useCallback, useEffect } from 'react';
import { 
    generateExamQuestionsApi, 
    startExamApi, 
    submitAnswerApi, 
    submitExamApi, 
    getExamResultApi,
    getExamInstancesApi 
} from '../service/api/apiExam';

export const useExamInstance = () => {
    const [examInstance, setExamInstance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Timer effect để đếm ngược thời gian
    useEffect(() => {
        let timer;
        if (examInstance && examInstance.status === 'in_progress' && examInstance.endTime) {
            timer = setInterval(() => {
                const now = new Date().getTime();
                const endTime = new Date(examInstance.endTime).getTime();
                const remaining = Math.max(0, endTime - now);
                
                setTimeRemaining(remaining);
                
                // Tự động nộp bài khi hết thời gian
                if (remaining <= 0 && examInstance.status === 'in_progress') {
                    handleAutoSubmit();
                }
            }, 1000);
        }
        
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [examInstance]);

    const handleAutoSubmit = useCallback(async () => {
        if (examInstance && examInstance.examId && examInstance.studentId) {
            try {
                await submitExamApi(examInstance.examId, examInstance.studentId);
                setExamInstance(prev => prev ? { ...prev, status: 'completed' } : null);
            } catch (err) {
                console.error('Auto submit failed:', err);
            }
        }
    }, [examInstance]);

    /**
     * Tạo hoặc lấy đề thi cho sinh viên
     */
    const generateExamQuestions = useCallback(async (examId, studentId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await generateExamQuestionsApi(examId, studentId);
            if (response.success) {
                setExamInstance(response.data);
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to generate exam questions');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Bắt đầu làm bài thi
     */
    const startExam = useCallback(async (examId, studentId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await startExamApi(examId, studentId);
            if (response.success) {
                setExamInstance(response.data);
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to start exam');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Nộp câu trả lời
     */
    const submitAnswer = useCallback(async (examId, studentId, questionId, answer) => {
        setError(null);
        try {
            const response = await submitAnswerApi(examId, studentId, questionId, answer);
            
            if (response.success) {
                // Cập nhật local state để theo dõi câu trả lời
                setExamInstance(prev => {
                    if (!prev) return prev;
                    
                    const newAnswers = [...(prev.answers || [])];
                    const existingIndex = newAnswers.findIndex(a => a.questionId === questionId);
                    
                    if (existingIndex >= 0) {
                        newAnswers[existingIndex] = { 
                            questionId, 
                            answer, 
                            answeredAt: new Date().toISOString() 
                        };
                    } else {
                        newAnswers.push({ 
                            questionId, 
                            answer, 
                            answeredAt: new Date().toISOString() 
                        });
                    }
                    
                    return { ...prev, answers: newAnswers };
                });
                
                return response;
            } else {
                throw new Error(response.error || 'Failed to submit answer');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    /**
     * Nộp bài thi
     */
    const submitExam = useCallback(async (examId, studentId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await submitExamApi(examId, studentId);
            if (response.success) {
                setExamInstance(prev => prev ? { ...prev, status: 'completed' } : null);
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to submit exam');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy kết quả thi
     */
    const getExamResult = useCallback(async (examId, studentId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getExamResultApi(examId, studentId);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to get exam result');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy danh sách exam instances (cho instructor)
     */
    const getExamInstances = useCallback(async (examId, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getExamInstancesApi(examId, params);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to get exam instances');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reset hook state
     */
    const resetExamInstance = useCallback(() => {
        setExamInstance(null);
        setError(null);
        setTimeRemaining(0);
    }, []);

    /**
     * Lấy câu trả lời của sinh viên cho một câu hỏi
     */
    const getStudentAnswer = useCallback((questionId) => {
        if (!examInstance || !examInstance.answers) return null;
        const answer = examInstance.answers.find(a => a.questionId === questionId);
        return answer ? answer.answer : null;
    }, [examInstance]);

    /**
     * Kiểm tra xem tất cả câu hỏi đã được trả lời chưa
     */
    const isAllQuestionsAnswered = useCallback(() => {
        if (!examInstance || !examInstance.questions || !examInstance.answers) return false;
        return examInstance.questions.length === examInstance.answers.length;
    }, [examInstance]);

    /**
     * Format thời gian còn lại
     */
    const formatTimeRemaining = useCallback(() => {
        if (timeRemaining <= 0) return '00:00:00';
        
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    return {
        // State
        examInstance,
        loading,
        error,
        timeRemaining,
        
        // Actions
        generateExamQuestions,
        startExam,
        submitAnswer,
        submitExam,
        getExamResult,
        getExamInstances,
        resetExamInstance,
        
        // Utilities
        getStudentAnswer,
        isAllQuestionsAnswered,
        formatTimeRemaining
    };
};