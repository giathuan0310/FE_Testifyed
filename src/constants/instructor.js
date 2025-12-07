// Status Constants
export const EXAM_STATUS = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DRAFT: 'draft',
};

export const QUESTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
};

export const QUESTION_LEVELS = [
  'Nhận biết',
  'Thông hiểu',
  'Vận dụng',
  'Vận dụng cao'
];

// Exam Schedule Status
export const EXAM_SCHEDULE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const EXAM_SCHEDULE_STATUS_TEXT = {
  [EXAM_SCHEDULE_STATUS.SCHEDULED]: 'Đã lên lịch',
  [EXAM_SCHEDULE_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [EXAM_SCHEDULE_STATUS.COMPLETED]: 'Hoàn thành',
  [EXAM_SCHEDULE_STATUS.CANCELLED]: 'Đã hủy'
};


// Status Text Mappings
export const EXAM_STATUS_TEXT = {
  [EXAM_STATUS.SCHEDULED]: 'Đã lên lịch',
  [EXAM_STATUS.ACTIVE]: 'Đang diễn ra',
  [EXAM_STATUS.COMPLETED]: 'Hoàn thành',
  [EXAM_STATUS.DRAFT]: 'Bản nháp'
};

export const QUESTION_STATUS_TEXT = {
  [QUESTION_STATUS.ACTIVE]: 'Đang sử dụng',
  [QUESTION_STATUS.INACTIVE]: 'Không sử dụng',
  [QUESTION_STATUS.DRAFT]: 'Nháp'
};

export const QUESTION_LEVEL_TEXT = {
  [QUESTION_LEVELS.EASY]: 'Dễ',
  [QUESTION_LEVELS.MEDIUM]: 'Trung bình',
  [QUESTION_LEVELS.HARD]: 'Khó'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  CLASS_NAME: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  CLASS_CODE: {
    required: true,
    pattern: /^[A-Z0-9]+$/,
    minLength: 3,
    maxLength: 10
  },
  EXAM_NAME: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  EXAM_DURATION: {
    required: true,
    min: 15,
    max: 300
  },
  QUESTION_CONTENT: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  OPTION_TEXT: {
    required: true,
    minLength: 1,
    maxLength: 200
  }
};

// Default Values
export const DEFAULT_VALUES = {
  CLASS: {
    name: '',
    code: '',
    passJoin: ''
  },
  SUBJECT: {
    name: '',
    code: '',
    description: ''
  },
  EXAM: {
    name: '',
    subjectId: '',
    description: '',
    duration: 60,
    questionCount: 10,
    maxScore: 10,
    attemptLimit: 1,
    randomizeQuestions: false,
    randomizeAnswers: false,
    generationConfig: {
      totalQuestions: 10,
      structure: []
    }
  },
  QUESTION: {
    content: '',
    questionType: 'multiple_choice', // Thêm field questionType
    subjectId: '',
    chapter: '',
    topic: '',
    level: 'Nhận biết',
    explanation: '',
    status: 'active',
    media: [],
    // Fields cho multiple choice
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    // Fields cho fill in blank
    textAnswer: '',
    acceptableAnswers: [],
    caseSensitive: false
  },
  EXAM_SCHEDULE: {
    examId: '',
    classId: '',
    startTime: '',
    endTime: '',
    status: 'scheduled'
  }
};

// Table Configurations
export const TABLE_CONFIGS = {
  CLASSES: {
    pageSize: 10,
    sortBy: 'name'
  },
  EXAMS: {
    pageSize: 10,
    sortBy: 'createdAt'
  },
  QUESTIONS: {
    pageSize: 10,
    sortBy: 'content'
  }
};