// src/mockData.js
// Dữ liệu mẫu chuẩn hóa cho toàn bộ hệ thống

export const mockUsers = [
    {
        _id: 'u1',
        code: 'B1809367',
        fullName: 'Nguyễn Văn B',
        passwordHash: '...',
        email: 'b@example.com',
        role: 'student',
        avatar: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/11/avatar-vo-tri-thumbnail.jpg',
        isActive: true,
        sessionToken: null,
        isLoggedIn: false,
        lastLogin: null,
        sessionInfo: { ip: '', userAgent: '' },
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-01T10:00:00Z'
    },
    {
        _id: 'u2',
        code: 'GV001',
        fullName: 'Nguyễn Văn Giáo Viên',
        passwordHash: '...',
        email: 'gv@example.com',
        role: 'teacher',
        avatar: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/11/avatar-vo-tri-thumbnail.jpg',
        isActive: true,
        sessionToken: null,
        isLoggedIn: false,
        lastLogin: null,
        sessionInfo: { ip: '', userAgent: '' },
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-01T10:00:00Z'
    },
    // 10 user mới
    {
        _id: 'u3', code: 'B1809368', fullName: 'Trần Thị C', role: 'student', email: 'c@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u4', code: 'B1809369', fullName: 'Lê Văn D', role: 'student', email: 'd@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u5', code: 'B1809370', fullName: 'Phạm Thị E', role: 'student', email: 'e@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u6', code: 'B1809371', fullName: 'Hoàng Văn F', role: 'student', email: 'f@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u7', code: 'B1809372', fullName: 'Ngô Thị G', role: 'student', email: 'g@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u8', code: 'B1809373', fullName: 'Vũ Văn H', role: 'student', email: 'h@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u9', code: 'B1809374', fullName: 'Đặng Thị I', role: 'student', email: 'i@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u10', code: 'B1809375', fullName: 'Phan Văn K', role: 'student', email: 'k@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u11', code: 'B1809376', fullName: 'Bùi Thị L', role: 'student', email: 'l@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    },
    {
        _id: 'u12', code: 'B1809377', fullName: 'Nguyễn Văn M', role: 'student', email: 'm@example.com', avatar: '', isActive: true, passwordHash: '', sessionToken: null, isLoggedIn: false, lastLogin: null, sessionInfo: {}, createdAt: '', updatedAt: ''
    }
];

export const mockCategories = [
    {
        _id: 'cat1',
        name: 'Anh văn 3',
        description: 'Môn học Anh văn 3',
        parentId: null,
        creatorId: 'u2',
        type: 'subject'
    },
    {
        _id: 'cat2',
        name: 'Anh văn 4',
        description: 'Môn học Anh văn 4',
        parentId: null,
        creatorId: 'u2',
        type: 'subject'
    },
    {
        _id: 'cat3',
        name: 'Phân Tích Dữ Liệu',
        description: 'Môn học Phân Tích Dữ Liệu',
        parentId: null,
        creatorId: 'u2',
        type: 'subject'
    },
    {
        _id: 'cat4',
        name: 'Công nghệ phần mềm',
        description: 'Môn học Công nghệ phần mềm',
        parentId: null,
        creatorId: 'u2',
        type: 'subject'
    },
    {
        _id: 'cat1-chap1',
        name: 'Chương 1',
        parentId: 'cat1',
        creatorId: 'u2',
        type: 'chapter'
    },
    {
        _id: 'cat1-topic1',
        name: 'Chủ đề 1',
        parentId: 'cat1-chap1',
        creatorId: 'u2',
        type: 'topic'
    }
];

export const mockQuestions = [
    {
        _id: 'q1',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Thủ đô của Việt Nam là gì?',
        media: [],
        options: [
            { text: 'Hà Nội', isCorrect: true },
            { text: 'TP. Hồ Chí Minh', isCorrect: false },
            { text: 'Đà Nẵng', isCorrect: false },
            { text: 'Huế', isCorrect: false }
        ],
        level: 'Nhận biết',
        explanation: 'Hà Nội là thủ đô của Việt Nam.',
        status: 'active'
    },
    {
        _id: 'q2',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Sông nào dài nhất Việt Nam?',
        media: [],
        options: [
            { text: 'Sông Hồng', isCorrect: false },
            { text: 'Sông Mekong', isCorrect: true },
            { text: 'Sông Đà', isCorrect: false },
            { text: 'Sông Đồng Nai', isCorrect: false }
        ],
        level: 'Thông hiểu',
        explanation: 'Sông Mekong là sông dài nhất Việt Nam.',
        status: 'active'
    },
    {
        _id: 'q3',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Ai là tác giả của Truyện Kiều?',
        media: [],
        options: [
            { text: 'Nguyễn Du', isCorrect: true },
            { text: 'Nguyễn Trãi', isCorrect: false },
            { text: 'Hồ Xuân Hương', isCorrect: false },
            { text: 'Tố Hữu', isCorrect: false }
        ],
        level: 'Nhận biết',
        explanation: 'Nguyễn Du là tác giả của Truyện Kiều.',
        status: 'active'
    },
    {
        _id: 'q4',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Đơn vị tiền tệ của Việt Nam là gì?',
        media: [],
        options: [
            { text: 'Đô la Mỹ', isCorrect: false },
            { text: 'Euro', isCorrect: false },
            { text: 'Yên Nhật', isCorrect: false },
            { text: 'Đồng', isCorrect: true }
        ],
        level: 'Nhận biết',
        explanation: 'Đồng là đơn vị tiền tệ của Việt Nam.',
        status: 'active'
    },
    {
        _id: 'q5',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Biển lớn nhất Việt Nam là gì?',
        media: [],
        options: [
            { text: 'Biển Đông', isCorrect: true },
            { text: 'Biển Tây', isCorrect: false },
            { text: 'Biển Bắc', isCorrect: false },
            { text: 'Biển Nam', isCorrect: false }
        ],
        level: 'Thông hiểu',
        explanation: 'Biển Đông là biển lớn nhất Việt Nam.',
        status: 'active'
    },
    {
        _id: 'q6',
        categoryId: 'cat1-topic1',
        creatorId: 'u2',
        content: 'Ngọn núi cao nhất Việt Nam là gì?',
        media: [],
        options: [
            { text: 'Fansipan', isCorrect: true },
            { text: 'Ba Vì', isCorrect: false },
            { text: 'Bạch Mã', isCorrect: false },
            { text: 'Langbiang', isCorrect: false }
        ],
        level: 'Nhận biết',
        explanation: 'Fansipan là ngọn núi cao nhất Việt Nam.',
        status: 'active'
    }
];

export const mockClasses = [
    {
        _id: 'class1',
        name: 'Anh văn 3 - L01',
        classCode: 'DHKTPMAV3',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12']
    },
    {
        _id: 'class2',
        name: 'Anh văn 3 - L02',
        classCode: 'DHKTPMAV3-02',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class3',
        name: 'Anh văn 3 - L03',
        classCode: 'DHKTPMAV3-03',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class4',
        name: 'Anh văn 3 - L04',
        classCode: 'DHKTPMAV3-04',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class5',
        name: 'Anh văn 3 - L05',
        classCode: 'DHKTPMAV3-05',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class6',
        name: 'Anh văn 3 - L06',
        classCode: 'DHKTPMAV3-06',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class7',
        name: 'Anh văn 3 - L07',
        classCode: 'DHKTPMAV3-07',
        subjectId: 'cat1',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class8',
        name: 'Anh văn 4 - L01',
        classCode: 'DHKTPMAV4',
        subjectId: 'cat2',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class9',
        name: 'Phân Tích Dữ Liệu - L01',
        classCode: 'DHKTPMPTDL',
        subjectId: 'cat3',
        teacherId: 'u2',
        studentIds: ['u1']
    },
    {
        _id: 'class10',
        name: 'Công nghệ phần mềm - L01',
        classCode: 'DHKTPMCNPM',
        subjectId: 'cat4',
        teacherId: 'u2',
        studentIds: ['u1']
    }
];

export const mockExams = [
    {
        _id: 'exam1',
        title: 'Kiểm tra giữa kỳ Anh văn 3',
        subjectId: 'cat1',
        creatorId: 'u2',
        durationInMinutes: 60,
        mode: 'real',
        generationConfig: {
            totalQuestions: 20,
            structure: [
                { categoryId: 'cat1-topic1', level: 'Nhận biết', count: 10 }
            ]
        },
        manualQuestions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
        shuffleQuestions: true,
        shuffleOptions: true,
        resultVisibility: 'immediate'
    },
    {
        _id: 'exam2',
        title: 'Kiểm tra cuối kỳ Anh văn 3',
        subjectId: 'cat1',
        creatorId: 'u2',
        durationInMinutes: 90,
        mode: 'real',
        generationConfig: {
            totalQuestions: 30,
            structure: [
                { categoryId: 'cat1-topic1', level: 'Nhận biết', count: 15 }
            ]
        },
        manualQuestions: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'],
        shuffleQuestions: true,
        shuffleOptions: true,
        resultVisibility: 'immediate'
    }
];

export const mockExamSchedules = [
    {
        _id: 'schedule1',
        examId: 'exam1',
        classId: 'class1',
        startTime: '2025-09-06T08:00:00Z',
        endTime: '2025-09-06T09:00:00Z',
        status: 'scheduled'
    },
    {
        _id: 'schedule2',
        examId: 'exam2',
        classId: 'class1',
        startTime: '2025-12-10T08:00:00Z',
        endTime: '2025-12-10T09:30:00Z',
        status: 'scheduled'
    }
];

export const mockResults = [
    {
        _id: 'result1',
        scheduleId: 'schedule1',
        studentId: 'u1',
        score: 8.5,
        startTime: '2025-10-20T08:05:00Z',
        submittedAt: '2025-10-20T08:55:00Z',
        timeTakenInSeconds: 3000,
        status: 'submitted',
        examSnapshot: [
            {
                questionId: 'q1',
                content: 'Câu hỏi mẫu?',
                media: [],
                options: ['Đáp án 1', 'Đáp án 2'],
                selectedOptionIndex: 0,
                correctOptionIndex: 0,
                isCorrect: true
            }
        ]
    }
];
