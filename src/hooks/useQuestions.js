import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  generateQuestionId,
  validateQuestionForm,
  calculateQuestionStats,
  filterItems
} from '../utils/instructor';
import { DEFAULT_VALUES, QUESTION_STATUS, QUESTION_LEVELS } from '../constants/instructor';

// ✅ Import API từ instructor
import {
  getAllQuestionApi as getAllQuestionInstructorApi,
  getQuestionByIdApi as getQuestionByIdInstructorApi,
  createQuestionApi as createQuestionInstructorApi,
  updateQuestionApi as updateQuestionInstructorApi,
  deleteQuestionApi as deleteQuestionInstructorApi
} from '../service/api/apiQuestion';

// ✅ Import API từ admin
import {
  getAllQuestionsApi as getAllQuestionsAdminApi,
  getQuestionByIdApi as getQuestionByIdAdminApi,
  createQuestionApi as createQuestionAdminApi,
  updateQuestionApi as updateQuestionAdminApi,
  deleteQuestionApi as deleteQuestionAdminApi
} from '../service/api/apiAdmin';

export const useQuestions = (subjects = [], userRole = 'instructor') => {
  // ✅ Chọn API theo role
  const apis = useMemo(() => {
    if (userRole === 'admin') {
      return {
        getAll: getAllQuestionsAdminApi,
        getById: getQuestionByIdAdminApi,
        create: createQuestionAdminApi,
        update: updateQuestionAdminApi,
        delete: deleteQuestionAdminApi
      };
    }
    return {
      getAll: getAllQuestionInstructorApi,
      getById: getQuestionByIdInstructorApi,
      create: createQuestionInstructorApi,
      update: updateQuestionInstructorApi,
      delete: deleteQuestionInstructorApi
    };
  }, [userRole]);

  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apis.getAll();
        // Handle both response formats
        const questionsData = res.data || res;
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
      } catch (err) {
        setError('Không thể tải danh sách câu hỏi');
        console.error('Error fetching questions:', err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [apis]);

  // Filtered questions based on search and filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      // Search filter
      const matchesSearch = !searchTerm ||
        question.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.topic?.toLowerCase().includes(searchTerm.toLowerCase());

      // Level filter
      const matchesLevel = levelFilter === 'all' || question.level === levelFilter;

      // Subject filter - Xử lý cả object và string
      let matchesSubject = subjectFilter === 'all';
      if (!matchesSubject) {
        if (question.subjectId && typeof question.subjectId === 'object') {
          // Nếu subjectId là object (populated)
          matchesSubject = question.subjectId._id === subjectFilter;
        } else if (typeof question.subjectId === 'string') {
          // Nếu subjectId là string
          matchesSubject = question.subjectId === subjectFilter;
        }
      }

      // Status filter
      const matchesStatus = statusFilter === 'all' || question.status === statusFilter;

      return matchesSearch && matchesLevel && matchesSubject && matchesStatus;
    });
  }, [questions, searchTerm, levelFilter, subjectFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return calculateQuestionStats(questions);
  }, [questions]);

  // ✅ Add new question (call API)
  const addQuestion = useCallback(async (questionData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Question data:', questionData); // Debug log

      // Validate form data
      const errors = validateQuestionForm(questionData);
      if (Object.keys(errors).length > 0) {
        console.error('Validation errors:', errors);
        throw new Error('Dữ liệu không hợp lệ');
      }

      const res = await apis.create(questionData);
      const newQuestion = res.data || res;
      setQuestions(prev => [...prev, newQuestion]);
      return { success: true, data: newQuestion };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Thêm câu hỏi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apis]);

  // ✅ Update question (call API)
  const updateQuestion = useCallback(async (questionId, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const errors = validateQuestionForm(updateData);
      if (Object.keys(errors).length > 0) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      const res = await apis.update(questionId, updateData);
      const updatedQuestion = res.data || res;
      setQuestions(prev =>
        prev.map(question =>
          question._id === questionId ? updatedQuestion : question
        )
      );
      return { success: true, data: updatedQuestion };
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Cập nhật câu hỏi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apis]);

  // ✅ Delete question (call API)
  const deleteQuestion = useCallback(async (questionId) => {
    setIsLoading(true);
    setError(null);

    try {
      await apis.delete(questionId);
      setQuestions(prev => prev.filter(question => question._id !== questionId));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Xóa câu hỏi thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apis]);

  // ✅ Get question by ID (call API)
  const getQuestionById = useCallback(async (questionId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apis.getById(questionId);
      return res; // API service đã handle response format
    } catch (err) {
      setError(err.message || 'Không thể lấy thông tin câu hỏi');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apis]);

  // Get questions by subject
  const getQuestionsBySubject = useCallback((subjectId) => {
    return questions.filter(question => {
      if (typeof question.subjectId === 'object') {
        return question.subjectId?._id === subjectId;
      }
      return question.subjectId === subjectId;
    });
  }, [questions]);

  // Option management helpers
  const addOption = useCallback((currentOptions) => {
    return [...currentOptions, { text: '', isCorrect: false }];
  }, []);

  const removeOption = useCallback((currentOptions, index) => {
    return currentOptions.filter((_, i) => i !== index);
  }, []);

  const updateOption = useCallback((currentOptions, index, field, value) => {
    return currentOptions.map((option, i) => {
      if (i === index) {
        return { ...option, [field]: value };
      }
      // If setting this option as correct, unset others
      if (field === 'isCorrect' && value) {
        return { ...option, isCorrect: false };
      }
      return option;
    });
  }, []);

  // Format question data for form
  const formatQuestionForForm = useCallback((question) => {
    if (!question) return DEFAULT_VALUES.QUESTION;

    return {
      content: question.content || '',
      questionType: question.questionType || 'multiple_choice',
      subjectId: question.subjectId?._id || question.subjectId || '',
      chapter: question.chapter || '',
      topic: question.topic || '',
      level: question.level || 'Nhận biết',
      explanation: question.explanation || '',
      status: question.status || 'active',
      media: question.media || [],
      // Fields cho multiple choice
      options: question.options && question.options.length > 0
        ? question.options
        : DEFAULT_VALUES.QUESTION.options,
      // Fields cho fill in blank
      textAnswer: question.textAnswer || '',
      acceptableAnswers: question.acceptableAnswers || [],
      caseSensitive: question.caseSensitive || false
    };
  }, []);

  return {
    // Data
    questions,
    filteredQuestions,
    stats,

    // State
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    subjectFilter,
    setSubjectFilter,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,

    // Actions
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getQuestionsBySubject,
    formatQuestionForForm,

    // Option helpers
    addOption,
    removeOption,
    updateOption,

    // Utils
    defaultValues: DEFAULT_VALUES.QUESTION,
    levelOptions: Object.values(QUESTION_LEVELS)
  };
};