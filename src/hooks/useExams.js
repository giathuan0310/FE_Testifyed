import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  generateExamId,
  validateExamForm,
  calculateExamStats,
  filterItems,
  formatDateTimeForInput
} from '../utils/instructor';
import { DEFAULT_VALUES, EXAM_STATUS } from '../constants/instructor';
import {
  getAllExamApi,
  getExamByIdApi,
  createExamApi,
  updateExamApi,
  deleteExamApi,
  validateExamQuestionsApi,
  updateExamIPRestrictionApi
} from '../service/api/apiExam';

export const useExams = (subjects = []) => {
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Thêm state cho validation
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Fetch exams from API on component mount
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAllExamApi();
        setExams(Array.isArray(res) ? res : []);
      } catch (err) {
        setError('Không thể tải danh sách kỳ thi');
        console.error('Error fetching exams:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Filtered exams based on search and status
  const filteredExams = useMemo(() => {
    let filtered = filterItems(exams, searchTerm, ['name', 'subjectName', 'description']);

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    return filtered;
  }, [exams, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return calculateExamStats(exams);
  }, [exams]);

  //Validation Question
  const validateExamQuestions = useCallback(async (generationConfig) => {
    // Reset validation state
    setValidationError(null);

    // Kiểm tra cấu trúc có hợp lệ không
    if (!generationConfig || !generationConfig.structure || generationConfig.structure.length === 0) {
      setValidationResult(null);
      return null;
    }

    // Kiểm tra có structure nào complete không
    const hasCompleteStructure = generationConfig.structure.some(s =>
      s.subjectId && s.chapter && s.topic && s.level && s.count > 0
    );

    if (!hasCompleteStructure) {
      setValidationResult(null);
      return null;
    }

    setIsValidating(true);

    try {
      console.log('📤 Validating exam questions:', generationConfig);

      const result = await validateExamQuestionsApi(generationConfig);

      console.log('📥 Validation API response:', result);

      // ✅ SỬA: Backend trả về { success: true, data: {...} }
      if (result.success && result.data) {
        setValidationResult(result.data);
        return result.data;
      } else {
        // Nếu không có data, có thể backend trả về format cũ
        setValidationResult(result);
        return result;
      }
    } catch (error) {
      console.error('❌ Validation error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể kiểm tra ngân hàng câu hỏi';
      setValidationError(errorMessage);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Reset validation khi cần
  const resetValidation = useCallback(() => {
    setValidationResult(null);
    setValidationError(null);
    setIsValidating(false);
  }, []);

  // Add new exam (call API)
  const addExam = useCallback(async (examData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate questions trước khi tạo exam
      const validationResult = await validateExamQuestions(examData.generationConfig);

      if (validationResult && !validationResult.isValid) {
        const message = 'Ngân hàng câu hỏi không đủ để tạo đề thi này';
        setError(message);
        return {
          success: false,
          error: message,
          validationDetails: validationResult.details
        };
      }

      // Transform form data to match API structure
      const examPayload = {
        name: examData.name,
        duration: parseInt(examData.duration),
        status: examData.status,
        questionCount: parseInt(examData.questionCount),
        maxScore: parseInt(examData.maxScore),
        attemptLimit: parseInt(examData.attemptLimit),
        randomizeQuestions: examData.randomizeQuestions,
        randomizeAnswers: examData.randomizeAnswers,
        generationConfig: {
          totalQuestions: parseInt(examData.generationConfig.totalQuestions),
          structure: examData.generationConfig.structure.map(item => ({
            subjectId: item.subjectId,
            chapter: item.chapter,
            topic: item.topic,
            level: item.level,
            count: parseInt(item.count)
          }))
        }
      };

      console.log('Exam payload to send:', examPayload);

      const res = await createExamApi(examPayload);
      setExams(prev => [...prev, res.data]);

      // Reset validation sau khi tạo thành công
      resetValidation();

      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Thêm kỳ thi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [validateExamQuestions, resetValidation]);

  // Update exam (call API)
  const updateExam = useCallback(async (examId, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Transform data to match backend model
      const examPayload = { ...updateData };

      // If it's a simple form update (basic fields only)
      if (updateData.title && !updateData.name) {
        examPayload.name = updateData.title;
        delete examPayload.title;
      }

      const res = await updateExamApi(examId, examPayload);
      setExams(prev =>
        prev.map(exam =>
          exam._id === examId ? res.data : exam
        )
      );
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật kỳ thi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete exam (call API)
  const deleteExam = useCallback(async (examId) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteExamApi(examId);
      setExams(prev => prev.filter(exam => exam._id !== examId));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Xóa kỳ thi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Get exam by ID (call API)
  const getExamById = useCallback(async (examId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getExamByIdApi(examId);

      // Xử lý response data dựa trên structure API trả về
      const examData = res.data || res; // Handle both formats

      return examData;
    } catch (err) {

      setError(err.message || 'Không thể lấy thông tin kỳ thi');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const updateExamIPRestriction = useCallback(async (examId, config) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await updateExamIPRestrictionApi(examId, config);

      // Update local state
      setExams(prev =>
        prev.map(exam =>
          exam._id === examId
            ? { ...exam, ipRestriction: res.data.ipRestriction }
            : exam
        )
      );

      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Cập nhật IP restriction thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);



  return {
    // Data
    exams,
    filteredExams,
    stats,

    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,

    // Validation state
    validationResult,
    isValidating,
    validationError,
    validateExamQuestions,
    resetValidation,

    // Actions
    addExam,
    updateExam,
    deleteExam,
    getExamById,
    updateExamIPRestriction,


    // Utils
    defaultValues: DEFAULT_VALUES.EXAM,
    statusOptions: Object.values(EXAM_STATUS)
  };
};