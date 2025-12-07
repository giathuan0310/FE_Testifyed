import {
  EXAM_STATUS_TEXT,
  QUESTION_STATUS_TEXT,
  QUESTION_LEVEL_TEXT,
  VALIDATION_RULES
} from '../constants/instructor';

// Status text helpers
export const getExamStatusText = (status) => {
  return EXAM_STATUS_TEXT[status] || status;
};

export const getQuestionStatusText = (status) => {
  return QUESTION_STATUS_TEXT[status] || status;
};

export const getQuestionLevelText = (level) => {
  return QUESTION_LEVEL_TEXT[level] || level;
};

// Date/Time helpers
// Note: This is used for formatting schedule dates (startTime/endTime), not exam dates
export const formatExamDateTime = (examDate) => {
  const date = new Date(examDate);
  return {
    date: date.toLocaleDateString('vi-VN'),
    time: date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

export const formatDateTime = (dateTime, type = 'both') => {
  if (!dateTime) return '';
  const date = new Date(dateTime);

  if (type === 'date') {
    return date.toLocaleDateString('vi-VN');
  } else if (type === 'time') {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
};

export const formatDuration = (minutes) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim();
  }
  return `${mins}m`;
};

// export const formatDateTimeForInput = (dateTime) => {
//   if (!dateTime) return '';
//   const date = new Date(dateTime);
//   return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
// };

// ID generation helpers

//mới
export const formatDateTimeForInput = (dateTime) => {
  if (!dateTime) return '';

  try {
    const date = new Date(dateTime);

    // Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) return '';

    // Format theo local timezone cho input datetime-local
    // KHÔNG dùng toISOString() vì nó convert về UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime for input:', error);
    return '';
  }
};
export const convertInputDateTimeToISO = (inputDateTime) => {
  if (!inputDateTime) return '';

  try {
    // Input datetime-local format: YYYY-MM-DDTHH:mm
    // Convert thành Date object theo local timezone rồi chuyển về ISO
    const date = new Date(inputDateTime);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting input datetime to ISO:', error);
    return '';
  }
};
export const generateClassId = () => `class${Date.now()}`;
export const generateExamId = () => `exam${Date.now()}`;
export const generateQuestionId = () => `ques${Date.now()}`;

// PassJoin generator
export const generatePassJoin = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Copy to clipboard helper
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

// Form validation helpers
export function validateClassForm(formData) {
  const errors = {};
  const { CLASS_NAME, CLASS_CODE } = VALIDATION_RULES;

  if (!formData.name || formData.name.length < CLASS_NAME.minLength) {
    errors.name = 'Tên lớp học phải có ít nhất 2 ký tự';
  }
  if (!formData.codeJoin || formData.codeJoin.length < CLASS_CODE.minLength || formData.codeJoin.length > CLASS_CODE.maxLength) {
    errors.codeJoin = `Mã lớp học phải từ ${CLASS_CODE.minLength} đến ${CLASS_CODE.maxLength} ký tự`;
  } else if (!CLASS_CODE.pattern.test(formData.codeJoin)) {
    errors.codeJoin = 'Mã lớp học chỉ gồm chữ in hoa và số, không có dấu cách hoặc ký tự đặc biệt';
  }
  if (!formData.passJoin) {
    errors.passJoin = 'Mã tham gia không được để trống';
  }
  return errors;
}

export const validateExamForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.length < VALIDATION_RULES.EXAM_NAME.minLength) {
    errors.name = `Tên kỳ thi phải có ít nhất ${VALIDATION_RULES.EXAM_NAME.minLength} ký tự`;
  }

  if (!formData.subjectId) {
    errors.subjectId = 'Vui lòng chọn môn học';
  }

  if (!formData.duration || formData.duration < VALIDATION_RULES.EXAM_DURATION.min) {
    errors.duration = `Thời gian thi phải ít nhất ${VALIDATION_RULES.EXAM_DURATION.min} phút`;
  }

  if (!formData.questionCount || formData.questionCount < 1) {
    errors.questionCount = 'Số câu hỏi phải ít nhất 1';
  }

  if (!formData.maxScore || formData.maxScore < 0.5) {
    errors.maxScore = 'Điểm tối đa phải ít nhất 0.5';
  }

  if (!formData.attemptLimit || formData.attemptLimit < 1) {
    errors.attemptLimit = 'Số lần làm bài phải ít nhất 1';
  }

  return errors;
};

export const validateQuestionForm = (formData) => {
  const errors = {};

  if (!formData.content || formData.content.length < VALIDATION_RULES.QUESTION_CONTENT.minLength) {
    errors.content = `Nội dung câu hỏi phải có ít nhất ${VALIDATION_RULES.QUESTION_CONTENT.minLength} ký tự`;
  }

  if (!formData.subjectId) {
    errors.subjectId = 'Vui lòng chọn môn học';
  }

  // Validate based on question type
  if (formData.questionType === 'fill_in_blank') {
    // Validate textAnswer for fill in blank questions
    if (!formData.textAnswer || formData.textAnswer.trim().length === 0) {
      errors.textAnswer = 'Đáp án chính xác không được để trống';
    }
  } else {
    // Validate options for multiple choice questions
    const validOptions = formData.options.filter(opt => opt.text.trim().length > 0);
    if (validOptions.length < 2) {
      errors.options = 'Phải có ít nhất 2 lựa chọn';
    }

    const correctOptions = formData.options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      errors.correctAnswer = 'Phải có ít nhất 1 đáp án đúng';
    }
  }

  return errors;
};

// Array filtering and sorting helpers
export const filterItems = (items, searchTerm, searchFields) => {
  if (!searchTerm) return items;

  return items.filter(item => {
    return searchFields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
};

export const sortItems = (items, sortBy, order = 'asc') => {
  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy);
    const bValue = getNestedValue(b, sortBy);

    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

// Helper to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Statistics calculators
export const calculateClassStats = (classes) => {
  const totalStudents = classes.reduce((sum, classItem) => sum + classItem.studentIds.length, 0);
  const averageStudentsPerClass = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;
  const classesWithStudents = classes.filter(c => c.studentIds.length > 0).length;

  return {
    totalClasses: classes.length,
    totalStudents,
    averageStudentsPerClass,
    classesWithStudents
  };
};

export const calculateExamStats = (exams) => {
  const scheduled = exams.filter(exam => exam.status === 'scheduled').length;
  const active = exams.filter(exam => exam.status === 'active').length;
  const completed = exams.filter(exam => exam.status === 'completed').length;
  const draft = exams.filter(exam => exam.status === 'draft').length;
  return {
    totalExams: exams.length,
    scheduledExams: scheduled,
    activeExams: active,
    completedExams: completed,
    draftExams: draft
  };
};

export const calculateQuestionStats = (questions) => {
  if (!questions || !Array.isArray(questions)) {
    return {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      advanced: 0,
      active: 0
    };
  }

  const easy = questions.filter(q => q.level === 'Nhận biết').length;
  const medium = questions.filter(q => q.level === 'Thông hiểu').length;
  const hard = questions.filter(q => q.level === 'Vận dụng').length;
  const advanced = questions.filter(q => q.level === 'Vận dụng cao').length;
  const active = questions.filter(q => q.status === 'active').length;

  return {
    total: questions.length,
    easy: easy,
    medium: medium,
    hard: hard,
    advanced: advanced,
    active: active
  };
};



/**
 * Các function dành cho Exam
 */
// Simple exam form validation
export const validateSimpleExamForm = (formData) => {
  const errors = {};

  // Title validation
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Tên kỳ thi không được để trống';
  } else if (formData.title.length < 3) {
    errors.title = 'Tên kỳ thi phải có ít nhất 3 ký tự';
  } else if (formData.title.length > 100) {
    errors.title = 'Tên kỳ thi không được vượt quá 100 ký tự';
  }

  // Question count validation
  if (!formData.questionCount || formData.questionCount === '') {
    errors.questionCount = 'Số lượng câu hỏi không được để trống';
  } else {
    const count = parseInt(formData.questionCount);
    if (isNaN(count) || count <= 0) {
      errors.questionCount = 'Số lượng câu hỏi phải là số nguyên dương';
    } else if (count > 200) {
      errors.questionCount = 'Số lượng câu hỏi không được vượt quá 200';
    }
  }

  // Duration validation
  if (!formData.duration || formData.duration === '') {
    errors.duration = 'Thời gian làm bài không được để trống';
  } else {
    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      errors.duration = 'Thời gian làm bài phải là số nguyên dương';
    } else if (duration < 5) {
      errors.duration = 'Thời gian làm bài tối thiểu là 5 phút';
    } else if (duration > 300) {
      errors.duration = 'Thời gian làm bài không được vượt quá 300 phút';
    }
  }

  return errors;
};

// Exam config validation
export const validateExamConfig = (configData) => {
  const errors = {};

  // Max score validation
  if (configData.maxScore <= 0) {
    errors.maxScore = 'Điểm tối đa phải lớn hơn 0';
  } else if (configData.maxScore > 100) {
    errors.maxScore = 'Điểm tối đa không được vượt quá 100';
  }

  // Attempt limit validation
  if (configData.attemptLimit <= 0) {
    errors.attemptLimit = 'Số lần làm bài phải lớn hơn 0';
  } else if (configData.attemptLimit > 10) {
    errors.attemptLimit = 'Số lần làm bài không được vượt quá 10';
  }

  // Structure validation
  if (configData.structure && configData.structure.length > 0) {
    configData.structure.forEach((item, index) => {
      if (item.count <= 0) {
        errors[`structure_${index}_count`] = 'Số câu phải lớn hơn 0';
      }
      if (item.pointsPerQuestion <= 0) {
        errors[`structure_${index}_points`] = 'Điểm mỗi câu phải lớn hơn 0';
      }
    });
  }

  return errors;
};

// Validate exam structure configuration
export const validateExamStructure = (structure) => {
  const errors = {};

  if (!structure || !Array.isArray(structure) || structure.length === 0) {
    errors.structure = 'Phải có ít nhất một cấu trúc đề thi';
    return errors;
  }

  structure.forEach((item, index) => {
    const prefix = `structure_${index}`;

    if (!item.subjectId) {
      errors[`${prefix}_subjectId`] = 'Vui lòng chọn môn học';
    }

    if (!item.chapter || item.chapter.trim() === '') {
      errors[`${prefix}_chapter`] = 'Vui lòng chọn chương';
    }

    if (!item.topic || item.topic.trim() === '') {
      errors[`${prefix}_topic`] = 'Vui lòng chọn chủ đề';
    }

    if (!item.level || item.level.trim() === '') {
      errors[`${prefix}_level`] = 'Vui lòng chọn mức độ';
    }

    if (!item.count || item.count <= 0) {
      errors[`${prefix}_count`] = 'Số câu hỏi phải lớn hơn 0';
    } else if (item.count > 50) {
      errors[`${prefix}_count`] = 'Số câu hỏi mỗi cấu trúc không được vượt quá 50';
    }
  });

  return errors;
};

// Validate generation config
export const validateGenerationConfig = (generationConfig) => {
  const errors = {};

  if (!generationConfig) {
    errors.generationConfig = 'Cấu hình tạo đề thi là bắt buộc';
    return errors;
  }

  // Validate totalQuestions
  if (!generationConfig.totalQuestions || generationConfig.totalQuestions <= 0) {
    errors.totalQuestions = 'Tổng số câu hỏi phải lớn hơn 0';
  } else if (generationConfig.totalQuestions > 200) {
    errors.totalQuestions = 'Tổng số câu hỏi không được vượt quá 200';
  }

  // Validate structure
  const structureErrors = validateExamStructure(generationConfig.structure);
  Object.assign(errors, structureErrors);

  // Validate tổng câu hỏi khớp với structure
  if (generationConfig.structure && Array.isArray(generationConfig.structure)) {
    const totalFromStructure = generationConfig.structure.reduce((sum, item) => {
      return sum + (parseInt(item.count) || 0);
    }, 0);

    if (totalFromStructure !== generationConfig.totalQuestions) {
      errors.structureTotal = `Tổng câu hỏi trong cấu trúc (${totalFromStructure}) không khớp với tổng số câu hỏi (${generationConfig.totalQuestions})`;
    }
  }

  return errors;
};

// Enhanced exam form validation với structure
export const validateCompleteExamForm = (formData) => {
  const errors = {};

  // Basic exam info validation
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Tên kỳ thi phải có ít nhất 3 ký tự';
  } else if (formData.name.length > 100) {
    errors.name = 'Tên kỳ thi không được vượt quá 100 ký tự';
  }

  // Duration validation
  if (!formData.duration || formData.duration < 5) {
    errors.duration = 'Thời gian thi phải ít nhất 5 phút';
  } else if (formData.duration > 300) {
    errors.duration = 'Thời gian thi không được vượt quá 300 phút (5 giờ)';
  }

  // Question count validation
  if (!formData.questionCount || formData.questionCount <= 0) {
    errors.questionCount = 'Số câu hỏi phải lớn hơn 0';
  } else if (formData.questionCount > 200) {
    errors.questionCount = 'Số câu hỏi không được vượt quá 200';
  }

  // Max score validation
  if (!formData.maxScore || formData.maxScore <= 0) {
    errors.maxScore = 'Điểm tối đa phải lớn hơn 0';
  } else if (formData.maxScore > 100) {
    errors.maxScore = 'Điểm tối đa không được vượt quá 100';
  }

  // Attempt limit validation
  if (!formData.attemptLimit || formData.attemptLimit <= 0) {
    errors.attemptLimit = 'Số lần làm bài phải lớn hơn 0';
  } else if (formData.attemptLimit > 10) {
    errors.attemptLimit = 'Số lần làm bài không được vượt quá 10';
  }

  // Status validation
  const validStatuses = ['draft', 'active', 'closed'];
  if (!formData.status || !validStatuses.includes(formData.status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  // Generation config validation
  if (formData.generationConfig) {
    const configErrors = validateGenerationConfig(formData.generationConfig);
    Object.assign(errors, configErrors);
  } else {
    errors.generationConfig = 'Cấu hình tạo đề thi là bắt buộc';
  }

  return errors;
};

// Validate exam can be started
export const validateExamCanStart = (exam) => {
  const errors = {};

  if (exam.status !== 'active') {
    errors.status = 'Chỉ có thể bắt đầu kỳ thi ở trạng thái "Đang diễn ra"';
  }

  return errors;
};

// Calculate automatic values
export const calculateExamTotals = (structure) => {
  if (!structure || !Array.isArray(structure)) {
    return {
      totalQuestions: 0,
      questionCount: 0
    };
  }

  const total = structure.reduce((sum, item) => {
    return sum + (parseInt(item.count) || 0);
  }, 0);

  return {
    totalQuestions: total,
    questionCount: total
  };
};

// Normalize exam data before submission
export const normalizeExamData = (formData) => {
  const totals = calculateExamTotals(formData.generationConfig?.structure);

  return {
    ...formData,
    name: formData.name.trim(),
    duration: parseInt(formData.duration),
    questionCount: totals.questionCount,
    maxScore: parseFloat(formData.maxScore),
    attemptLimit: parseInt(formData.attemptLimit),
    generationConfig: {
      ...formData.generationConfig,
      totalQuestions: totals.totalQuestions,
      structure: formData.generationConfig.structure.map(item => ({
        subjectId: item.subjectId,
        chapter: item.chapter.trim(),
        topic: item.topic.trim(),
        level: item.level,
        count: parseInt(item.count)
      }))
    }
  };
};

// Check if exam form has unsaved changes
export const hasUnsavedChanges = (currentForm, initialForm) => {
  const normalize = (obj) => JSON.stringify(obj, Object.keys(obj).sort());
  return normalize(currentForm) !== normalize(initialForm);
};