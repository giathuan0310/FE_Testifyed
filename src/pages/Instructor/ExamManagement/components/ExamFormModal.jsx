import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { QUESTION_LEVELS } from '../../../../constants/instructor';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useChaptersAndTopics } from '../../../../hooks/useChaptersAndTopics';
import {
    validateCompleteExamForm,
    validateExamStructure,
    validateGenerationConfig,
    calculateExamTotals,
    normalizeExamData,
    hasUnsavedChanges
} from '../../../../utils/instructor';
import { toast } from 'react-toastify';

// ============================= CONSTANTS =============================
const defaultStructure = {
    subjectId: '',
    chapter: '',
    topic: '',
    level: '',
    count: 1
};

const statuses = [
    { value: 'draft', label: 'Bản nháp' },
    { value: 'active', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Đã kết thúc' }
];

// ============================= MAIN COMPONENT =============================
const ExamFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    subjects,
    editingExam,
    validateExamQuestions,
    validationResult,
    isValidating,
    validationError,
    resetValidation,
    onSaveIPRestriction,
    isAdmin = false,
    instructors = []
}) => {
    // ============================= HOOKS =============================
    const {
        fetchChaptersBySubjectId,
        fetchTopicsBySubjectAndChapter,
        getCachedChapters,
        getCachedTopics,
        isLoading: chaptersTopicsLoading
    } = useChaptersAndTopics();

    // ============================= STATES =============================
    const [form, setForm] = useState({
        name: '',
        duration: 60,
        questionCount: 1,
        maxScore: 10,
        attemptLimit: 1,
        status: 'draft',
        randomizeQuestions: true,
        randomizeAnswers: true,
        generationConfig: {
            totalQuestions: 1,
            structure: [{ ...defaultStructure }]
        }
    });

    const [structureChapters, setStructureChapters] = useState({});
    const [structureTopics, setStructureTopics] = useState({});

    // Validation states
    const [validationErrors, setValidationErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [initialFormData, setInitialFormData] = useState(null);
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = useState('');

    // Ref để track xem có đang edit structure không
    const isEditingStructureRef = useRef(false);

    // Ref để tránh stale closure
    const formRef = useRef(form);
    formRef.current = form;

    const submittingRef = useRef(false);

    // State cấu hình IP (hiển thị cả khi tạo và cập nhật)
    const [ipEnabled, setIpEnabled] = useState(false);
    const [labName, setLabName] = useState('');
    const [allowedIPsText, setAllowedIPsText] = useState(''); // mỗi dòng 1 IP/subnet
    const [blockedMessage, setBlockedMessage] = useState('Bạn phải kết nối mạng phòng Lab để làm bài thi này.');
    const [savingIP, setSavingIP] = useState(false);

    // ============================= UTILITY FUNCTIONS =============================

    // ============================= EFFECTS =============================

    // ✅ SỬA: Chuẩn hóa kết quả validate - hỗ trợ cả 2 format
    const safeValidation = React.useMemo(() => {
        // 🔥 Backend trả về { success: true, data: {...} }
        // Nhưng có thể có format cũ { isValid: true, ... }
        const data = validationResult?.data || validationResult;

        return {
            present: !!validationResult,
            isValid: data?.isValid ?? null,
            totalRequired: data?.totalRequired ?? 0,
            totalAvailable: data?.totalAvailable ?? 0,
            details: Array.isArray(data?.details) ? data.details : []
        };
    }, [validationResult]);

    // CHỈ HIỂN THỊ LỖI KHI showValidationErrors = true (sau khi submit)
    const renderError = (fieldName) => {
        if (showValidationErrors && validationErrors[fieldName]) {
            return (
                <div className="field-error">
                    <FiAlertTriangle size={12} />
                    <span>{validationErrors[fieldName]}</span>
                </div>
            );
        }
        return null;
    };

    // CHỈ HIỂN THỊ CLASS ERROR KHI showValidationErrors = true
    const getInputClassName = (fieldName) => {
        if (showValidationErrors && validationErrors[fieldName]) {
            return 'error';
        }
        return '';
    };

    // ============================= EFFECTS =============================

    // SILENT VALIDATION - không hiển thị lỗi, chỉ tính toán
    useEffect(() => {
        const errors = validateCompleteExamForm(form);
        setValidationErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
    }, [form]);

    // Save initial data for unsaved changes detection
    useEffect(() => {
        if (isOpen && !initialFormData) {
            setInitialFormData({ ...form });
        }
    }, [isOpen, form, initialFormData]);

    // Reset validation errors khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setShowValidationErrors(false);
            setValidationErrors({});
            setInitialFormData(null);
            setIsSubmitting(false);
            if (resetValidation) {
                resetValidation();
            }
        }
    }, [isOpen, resetValidation]);

    // Load editing exam data
    useEffect(() => {
        const loadExamData = async () => {
            if (isOpen) {
                setShowValidationErrors(false);

                if (editingExam) {
                    const formData = {
                        name: editingExam.name || '',
                        duration: editingExam.duration || 60,
                        questionCount: editingExam.questionCount || 1,
                        maxScore: editingExam.maxScore || 10,
                        attemptLimit: editingExam.attemptLimit || 1,
                        status: editingExam.status || 'draft',
                        randomizeQuestions: editingExam.randomizeQuestions || false,
                        randomizeAnswers: editingExam.randomizeAnswers || false,
                        generationConfig: {
                            totalQuestions: editingExam.generationConfig?.totalQuestions || 1,
                            structure: editingExam.generationConfig?.structure?.length > 0
                                ? editingExam.generationConfig.structure.map(item => ({
                                    subjectId: typeof item.subjectId === 'object' ? item.subjectId._id : item.subjectId,
                                    chapter: item.chapter || '',
                                    topic: item.topic || '',
                                    level: item.level || '',
                                    count: item.count || 1
                                }))
                                : [{ ...defaultStructure }]
                        }
                    };
                    setForm(formData);

                    // Load chapters and topics for existing structure
                    const chaptersData = {};
                    const topicsData = {};

                    for (let i = 0; i < formData.generationConfig.structure.length; i++) {
                        const structureItem = formData.generationConfig.structure[i];

                        if (structureItem.subjectId) {
                            try {
                                const chapters = await fetchChaptersBySubjectId(structureItem.subjectId);
                                chaptersData[i] = chapters;

                                if (structureItem.chapter) {
                                    const topics = await fetchTopicsBySubjectAndChapter(structureItem.subjectId, structureItem.chapter);
                                    topicsData[i] = topics;
                                }
                            } catch (error) {
                                console.error('Error loading chapters/topics for editing:', error);
                            }
                        }
                    }

                    setStructureChapters(chaptersData);
                    setStructureTopics(topicsData);
                } else {
                    // Reset form for new exam
                    setForm({
                        name: '',
                        duration: 60,
                        questionCount: 1,
                        maxScore: 10,
                        attemptLimit: 1,
                        status: 'draft',
                        randomizeQuestions: true,
                        randomizeAnswers: true,
                        generationConfig: {
                            totalQuestions: 1,
                            structure: [{ ...defaultStructure }]
                        }
                    });
                    setStructureChapters({});
                    setStructureTopics({});
                    setValidationErrors({});
                }
            }
        };

        loadExamData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingExam, isOpen]);

    // ✅ useEffect để xử lý kết quả validation sau khi submit
    useEffect(() => {
        if (!isSubmitting) return;
        if (isValidating) return;

        if (validationError) {
            toast.error('Lỗi khi kiểm tra ngân hàng câu hỏi');
            setIsSubmitting(false);
            return;
        }

        if (!safeValidation.present) return;

        if (submittingRef.current) return;
        submittingRef.current = true;

        (async () => {
            try {
                if (safeValidation.isValid) {
                    const normalizedData = normalizeExamData(form);
                    const ipRestriction = {
                        enabled: ipEnabled,
                        allowedIPs: allowedIPsText
                            .split(/\r?\n|,/)
                            .map(s => s.trim())
                            .filter(Boolean),
                        labName: labName.trim(),
                        blockedMessage: blockedMessage.trim()
                    };
                    normalizedData.ipRestriction = ipRestriction;

                    // NEW: đính kèm creatorId khi là admin (create/update)
                    if (isAdmin && selectedInstructorId) {
                        normalizedData.creatorId = selectedInstructorId;
                    }
                    const result = await onSubmit(normalizedData);
                    if (result && result.success === false) {
                        toast.error(result.error || 'Lỗi khi lưu kỳ thi');
                    } else {
                        setInitialFormData(null);
                        setShowValidationErrors(false);
                    }
                } else {
                    toast.error('Ngân hàng câu hỏi không đủ. Vui lòng kiểm tra chi tiết bên dưới.');
                    setTimeout(() => {
                        const validationSection = document.querySelector('.validation-result');
                        if (validationSection) {
                            validationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
            } catch (err) {
                console.error('Submit exam error:', err);
                toast.error('Lỗi khi lưu kỳ thi');
            } finally {
                setIsSubmitting(false);
                submittingRef.current = false;
            }
        })();
    }, [isSubmitting, isValidating, safeValidation, validationError, form, onSubmit, ipEnabled, allowedIPsText, labName, blockedMessage]);
    // ============================= EVENT HANDLERS =============================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStructureChange = useCallback(async (idx, field, value) => {
        // Đánh dấu là đang edit structure
        isEditingStructureRef.current = true;

        // Cập nhật form state - tính toán newStructure BÊN TRONG setForm để tránh stale closure
        setForm(prev => {
            // Tạo bản sao structure mới TỪ prev
            const newStructure = prev.generationConfig.structure.map((item, i) => {
                if (i !== idx) return item;

                // Clone item hiện tại
                const updatedItem = { ...item, [field]: value };

                // Reset dependent fields
                if (field === 'subjectId' && value) {
                    updatedItem.chapter = '';
                    updatedItem.topic = '';
                } else if (field === 'chapter' && value) {
                    updatedItem.topic = '';
                }

                return updatedItem;
            });

            // Tính totals từ newStructure
            const newTotals = calculateExamTotals(newStructure);

            return {
                ...prev,
                questionCount: newTotals.questionCount,
                generationConfig: {
                    ...prev.generationConfig,
                    totalQuestions: newTotals.totalQuestions,
                    structure: newStructure
                }
            };
        });

        // Đợi trước khi bỏ flag
        setTimeout(() => {
            isEditingStructureRef.current = false;
        }, 400);

        // Xử lý async operations (fetch chapters/topics)
        if (field === 'subjectId' && value) {
            try {
                const chapters = await fetchChaptersBySubjectId(value);
                setStructureChapters(prev => ({ ...prev, [idx]: chapters }));
                setStructureTopics(prev => ({ ...prev, [idx]: [] }));
            } catch (error) {
                console.error('Error fetching chapters:', error);
                setStructureChapters(prev => ({ ...prev, [idx]: [] }));
                setStructureTopics(prev => ({ ...prev, [idx]: [] }));
            }
        } else if (field === 'chapter' && value) {
            // Get subjectId from formRef (latest state)
            const selectedSubjectId = formRef.current.generationConfig.structure[idx]?.subjectId;
            if (selectedSubjectId) {
                try {
                    const topics = await fetchTopicsBySubjectAndChapter(selectedSubjectId, value);
                    setStructureTopics(prev => ({ ...prev, [idx]: topics }));
                } catch (error) {
                    console.error('Error fetching topics:', error);
                    setStructureTopics(prev => ({ ...prev, [idx]: [] }));
                }
            }
        }
    }, [fetchChaptersBySubjectId, fetchTopicsBySubjectAndChapter]);

    const addStructure = () => {
        const newIndex = form.generationConfig.structure.length;
        const newStructure = [...form.generationConfig.structure, { ...defaultStructure }];
        const newTotals = calculateExamTotals(newStructure);

        setForm(prev => ({
            ...prev,
            questionCount: newTotals.questionCount,
            generationConfig: {
                ...prev.generationConfig,
                totalQuestions: newTotals.totalQuestions,
                structure: newStructure
            }
        }));

        // Initialize empty chapters and topics for new structure
        setStructureChapters(prev => ({
            ...prev,
            [newIndex]: []
        }));
        setStructureTopics(prev => ({
            ...prev,
            [newIndex]: []
        }));
    };

    const removeStructure = (idx) => {
        const newStructure = form.generationConfig.structure.filter((_, i) => i !== idx);
        const newTotals = calculateExamTotals(newStructure);

        setForm(prev => ({
            ...prev,
            questionCount: newTotals.questionCount,
            generationConfig: {
                ...prev.generationConfig,
                totalQuestions: newTotals.totalQuestions,
                structure: newStructure
            }
        }));

        // Remove and reindex chapters and topics
        setStructureChapters(prev => {
            const newChapters = { ...prev };
            delete newChapters[idx];

            const reindexed = {};
            Object.keys(newChapters).forEach(key => {
                const keyIdx = parseInt(key);
                if (keyIdx > idx) {
                    reindexed[keyIdx - 1] = newChapters[key];
                } else {
                    reindexed[keyIdx] = newChapters[key];
                }
            });
            return reindexed;
        });

        setStructureTopics(prev => {
            const newTopics = { ...prev };
            delete newTopics[idx];

            const reindexed = {};
            Object.keys(newTopics).forEach(key => {
                const keyIdx = parseInt(key);
                if (keyIdx > idx) {
                    reindexed[keyIdx - 1] = newTopics[key];
                } else {
                    reindexed[keyIdx] = newTopics[key];
                }
            });
            return reindexed;
        });
    };

    const handleClose = () => {
        if (initialFormData && hasUnsavedChanges(form, initialFormData)) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?')) {
                setInitialFormData(null);
                setShowValidationErrors(false);
                setIsSubmitting(false);
                onClose();
            }
        } else {
            setInitialFormData(null);
            setShowValidationErrors(false);
            setIsSubmitting(false);
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // BẬT HIỂN THỊ LỖI KHI SUBMIT
        setShowValidationErrors(true);
        // NEW: bắt buộc chọn giảng viên khi admin tạo mới
        if (isAdmin && !editingExam && !selectedInstructorId) {
            toast.error('Vui lòng chọn giảng viên tạo kỳ thi');
            return;
        }
        // 1. Validate form cơ bản trước
        const errors = validateCompleteExamForm(form);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);

            // Scroll đến lỗi đầu tiên
            setTimeout(() => {
                const firstError = document.querySelector('.field-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            return;
        }

        // 2. Kiểm tra có cấu trúc hợp lệ không
        const hasValidStructure = form.generationConfig.structure.some(item =>
            item.subjectId && item.chapter && item.topic && item.level && item.count > 0
        );

        if (!hasValidStructure) {
            toast.error('Vui lòng thêm ít nhất một cấu trúc đề thi hợp lệ');
            return;
        }

        // 3. Bắt đầu validate ngân hàng câu hỏi
        setIsSubmitting(true);
        try {
            console.log('🔄 Starting validation with config:', form.generationConfig);
            await validateExamQuestions(form.generationConfig);
            // useEffect sẽ xử lý kết quả validation và submit
        } catch (error) {
            console.error('❌ Validation error:', error);
            toast.error('Lỗi khi kiểm tra ngân hàng câu hỏi');
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        if (!isOpen) return;
        // Prefill khi edit: nếu có creatorId thì set sẵn
        const prefillId =
            typeof editingExam?.creatorId === 'object'
                ? editingExam.creatorId?._id
                : editingExam?.creatorId;
        setSelectedInstructorId(prefillId || '');
    }, [isOpen, editingExam]);

    // Load dữ liệu IP khi mở modal (tạo: default; sửa: load từ editingExam)
    useEffect(() => {
        if (!isOpen) return;
        if (editingExam?.ipRestriction) {
            const ip = editingExam.ipRestriction;
            setIpEnabled(!!ip.enabled);
            setLabName(ip.labName || '');
            setBlockedMessage(ip.blockedMessage || 'Bạn phải kết nối mạng phòng Lab để làm bài thi này.');
            setAllowedIPsText((ip.allowedIPs || []).join('\n'));
        } else {
            // tạo mới
            setIpEnabled(false);
            setLabName('');
            setBlockedMessage('Bạn phải kết nối mạng phòng Lab để làm bài thi này.');
            setAllowedIPsText('');
        }
    }, [isOpen, editingExam]);



    // ============================= RENDER =============================
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content-exam exam-form-modal">
                {/* ========== MODAL HEADER ========== */}
                <div className="modal-header">
                    <h2>{editingExam ? 'Chỉnh sửa kỳ thi' : 'Tạo kỳ thi mới'}</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ========== THÔNG TIN KỲ THI ========== */}
                    <div className="exam-form-section">
                        <h3>Thông tin kỳ thi</h3>
                        {isAdmin && (
                            <div className="exam-form-row">
                                <div className="exam-form-group" style={{ flex: 1 }}>
                                    <label>Giảng viên tạo kỳ thi *</label>
                                    <select
                                        value={selectedInstructorId}
                                        onChange={(e) => setSelectedInstructorId(e.target.value)}
                                        required
                                    >
                                        <option value="">Chọn giảng viên</option>
                                        {(instructors || []).map(ins => (
                                            <option key={ins._id} value={ins._id}>
                                                {ins.fullName} ({ins.code})
                                            </option>
                                        ))}
                                    </select>
                                    {showValidationErrors && !selectedInstructorId && (
                                        <div className="field-error">
                                            <span>Vui lòng chọn giảng viên</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="exam-form-row">
                            <div className="exam-form-group">
                                <label>Tên kỳ thi *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={getInputClassName('name')}
                                    required
                                />
                                {renderError('name')}
                            </div>
                        </div>

                        <div className="exam-form-row">
                            <div className="exam-form-group">
                                <label>Thời gian (phút) *</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    min="5"
                                    max="300"
                                    className={getInputClassName('duration')}
                                    required
                                />
                                {renderError('duration')}
                            </div>

                            <div className="exam-form-group">
                                <label>Số câu hỏi (tự động tính)</label>
                                <input
                                    type="number"
                                    value={form.questionCount}
                                    disabled
                                    className="auto-calculated"
                                    title="Được tính tự động từ cấu trúc đề thi"
                                />
                                {renderError('questionCount')}
                            </div>

                            <div className="exam-form-group">
                                <label>Điểm tối đa *</label>
                                <input
                                    type="number"
                                    name="maxScore"
                                    value={form.maxScore}
                                    onChange={handleChange}
                                    min="0.5"
                                    max="100"
                                    step="0.5"
                                    className={getInputClassName('maxScore')}
                                    required
                                />
                                {renderError('maxScore')}
                            </div>
                        </div>

                        <div className="exam-form-row">
                            <div className="exam-form-group">
                                <label>Số lần làm bài tối đa *</label>
                                <input
                                    type="number"
                                    name="attemptLimit"
                                    value={form.attemptLimit}
                                    onChange={handleChange}
                                    min="1"
                                    max="10"
                                    className={getInputClassName('attemptLimit')}
                                    required
                                />
                                {renderError('attemptLimit')}
                            </div>

                            <div className="exam-form-group">
                                <label>Trạng thái *</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className={getInputClassName('status')}
                                >
                                    {statuses.map(st => (
                                        <option key={st.value} value={st.value}>{st.label}</option>
                                    ))}
                                </select>
                                {renderError('status')}
                            </div>
                        </div>
                    </div>

                    {/* ========== CẤU HÌNH ĐỀ THI ========== */}
                    <div className="exam-form-section exam-config-section">
                        <h3>
                            <span role="img" aria-label="settings">⚙️</span> Cấu hình đề thi
                        </h3>

                        {showValidationErrors && validationErrors.structureTotal && (
                            <div className="validation-error">
                                <FiAlertTriangle />
                                <span>{validationErrors.structureTotal}</span>
                            </div>
                        )}

                        <div className="exam-form-row">
                            <div className="exam-form-group">
                                <label>Tổng số câu hỏi (tự động tính)</label>
                                <input
                                    type="number"
                                    value={form.generationConfig.totalQuestions}
                                    disabled
                                    className="auto-calculated"
                                    title="Được tính tự động từ tổng các cấu trúc bên dưới"
                                />
                                {renderError('totalQuestions')}
                            </div>

                            {/* Toggle switches */}
                            <div className="exam-form-group exam-toggle-group">
                                <div className="exam-toggle-option">
                                    <div className="exam-option-info">
                                        <h4>Xáo trộn câu hỏi</h4>
                                        <p>Hiển thị câu hỏi theo thứ tự ngẫu nhiên</p>
                                    </div>
                                    <label className="exam-toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="randomizeQuestions"
                                            checked={form.randomizeQuestions}
                                            onChange={handleChange}
                                        />
                                        <span className="exam-toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="exam-toggle-option">
                                    <div className="exam-option-info">
                                        <h4>Xáo trộn đáp án</h4>
                                        <p>Hiển thị đáp án theo thứ tự ngẫu nhiên</p>
                                    </div>
                                    <label className="exam-toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="randomizeAnswers"
                                            checked={form.randomizeAnswers}
                                            onChange={handleChange}
                                        />
                                        <span className="exam-toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ========== CẤU TRÚC ĐỀ THI ========== */}
                        <div className="exam-structure-config">
                            <h4>Cấu trúc đề thi</h4>

                            <div className="structure-summary">
                                <p><strong>Tổng câu hỏi: {form.generationConfig.totalQuestions}</strong></p>
                            </div>

                            {form.generationConfig.structure.map((item, idx) => (
                                <div key={`struct-${idx}-${item.subjectId || 'empty'}`} className="exam-structure-row">
                                    <select
                                        value={item.subjectId || ''}
                                        onChange={e => handleStructureChange(idx, "subjectId", e.target.value)}
                                        className={showValidationErrors ? getInputClassName(`structure_${idx}_subjectId`) : ''}
                                        required
                                    >
                                        <option value="">Chọn môn học</option>
                                        {(subjects ?? []).map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={item.chapter}
                                        onChange={e => handleStructureChange(idx, "chapter", e.target.value)}
                                        className={showValidationErrors ? getInputClassName(`structure_${idx}_chapter`) : ''}
                                        required
                                        disabled={!item.subjectId || !structureChapters[idx]?.length}
                                    >
                                        <option value="">Chọn chương</option>
                                        {structureChapters[idx]?.map(chapter => (
                                            <option key={chapter} value={chapter}>{chapter}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={item.topic}
                                        onChange={e => handleStructureChange(idx, "topic", e.target.value)}
                                        className={showValidationErrors ? getInputClassName(`structure_${idx}_topic`) : ''}
                                        required
                                        disabled={!item.chapter || !structureTopics[idx]?.length}
                                    >
                                        <option value="">Chọn chủ đề</option>
                                        {structureTopics[idx]?.map(topic => (
                                            <option key={topic} value={topic}>{topic}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={item.level}
                                        onChange={e => handleStructureChange(idx, "level", e.target.value)}
                                        className={showValidationErrors ? getInputClassName(`structure_${idx}_level`) : ''}
                                        required
                                    >
                                        <option value="">Mức độ</option>
                                        {QUESTION_LEVELS.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        placeholder="Số câu"
                                        value={item.count}
                                        min="1"
                                        max="50"
                                        onChange={e => handleStructureChange(idx, "count", parseInt(e.target.value) || 1)}
                                        className={showValidationErrors ?
                                            (getInputClassName(`structure_${idx}_count`) + ' count-input').trim() :
                                            'count-input'
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="exam-btn-action exam-btn-delete"
                                        onClick={() => removeStructure(idx)}
                                        title='Xóa cấu trúc'
                                        disabled={form.generationConfig.structure.length === 1}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {showValidationErrors && form.generationConfig.structure.map((item, idx) => (
                                (validationErrors[`structure_${idx}_subjectId`] ||
                                    validationErrors[`structure_${idx}_chapter`] ||
                                    validationErrors[`structure_${idx}_topic`] ||
                                    validationErrors[`structure_${idx}_level`] ||
                                    validationErrors[`structure_${idx}_count`]) && (
                                    <div key={`error-${idx}`} className="structure-errors">
                                        <p><strong>Cấu trúc {idx + 1}:</strong></p>
                                        {renderError(`structure_${idx}_subjectId`)}
                                        {renderError(`structure_${idx}_chapter`)}
                                        {renderError(`structure_${idx}_topic`)}
                                        {renderError(`structure_${idx}_level`)}
                                        {renderError(`structure_${idx}_count`)}
                                    </div>
                                )
                            ))}

                            <button type="button" className="exam-btn-add-option" onClick={addStructure}>
                                <span>➕</span> Thêm cấu trúc
                            </button>

                            {showValidationErrors && validationErrors.structure && (
                                <div className="validation-error">
                                    <FiAlertTriangle />
                                    <span>{validationErrors.structure}</span>
                                </div>
                            )}
                        </div>

                        {/* ========== VALIDATION RESULTS - chỉ hiển thị sau khi submit ========== */}
                        {isValidating && (
                            <div className="validation-loading">
                                <p>🔄 Đang kiểm tra ngân hàng câu hỏi...</p>
                            </div>
                        )}

                        {validationError && (
                            <div className="validation-error">
                                <p>❌ Lỗi: {validationError}</p>
                            </div>
                        )}

                        {safeValidation.present && (
                            <div className={`validation-result ${safeValidation.isValid ? 'valid' : 'invalid'}`}>
                                <h4>
                                    {safeValidation.isValid ? '✅ Ngân hàng câu hỏi đủ' : '❌ Ngân hàng câu hỏi không đủ'}
                                </h4>

                                <div className="validation-summary">
                                    <p><strong>Tổng câu hỏi cần:</strong> {safeValidation.totalRequired}</p>
                                    <p><strong>Tổng câu hỏi có:</strong> {safeValidation.totalAvailable}</p>
                                    {safeValidation.isValid === false && (
                                        <p><strong>Thiếu:</strong> {safeValidation.totalRequired - safeValidation.totalAvailable} câu</p>
                                    )}
                                </div>

                                {safeValidation.isValid === false && (
                                    <div className="validation-details">
                                        <h5>Chi tiết từng cấu trúc:</h5>
                                        {safeValidation.details.map((detail, idx) => (
                                            <div key={idx} className={`validation-item ${detail.isEnough ? 'enough' : 'not-enough'}`}>
                                                <p>
                                                    <strong>Cấu trúc {idx + 1}:</strong>
                                                    Chương "{detail.chapter}" - Chủ đề "{detail.topic}" - Mức độ "{detail.level}"
                                                </p>
                                                <p>
                                                    Cần: {detail.required} | Có: {detail.available}
                                                    {!detail.isEnough && (
                                                        <span className="shortage"> | Thiếu: {detail.shortage} câu</span>
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* ========== GIỚI HẠN IP PHÒNG LAB (LUÔN HIỂN THỊ) ========== */}
                    <div className="exam-form-section">
                        <h3>Giới hạn IP phòng Lab</h3>

                        <div className="exam-form-row">
                            <div className="exam-form-group">
                                <label>Bật giới hạn IP</label>
                                <label className="exam-toggle-switch" style={{ display: 'inline-flex', marginLeft: 12 }}>
                                    <input
                                        type="checkbox"
                                        checked={ipEnabled}
                                        onChange={(e) => setIpEnabled(e.target.checked)}
                                    />
                                    <span className="exam-toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        {ipEnabled && (
                            <>
                                <div className="exam-form-row">
                                    <div className="exam-form-group" style={{ flex: 1 }}>
                                        <label>Tên phòng Lab</label>
                                        <input
                                            type="text"
                                            value={labName}
                                            onChange={(e) => setLabName(e.target.value)}
                                            placeholder="VD: Phòng Lab A301"
                                        />
                                    </div>
                                </div>

                                <div className="exam-form-row">
                                    <div className="exam-form-group" style={{ flex: 1 }}>
                                        <label>Danh sách IP/Subnet (mỗi dòng một mục)</label>
                                        <textarea
                                            rows={5}
                                            value={allowedIPsText}
                                            onChange={(e) => setAllowedIPsText(e.target.value)}
                                            placeholder={`Ví dụ:\n192.168.1.0/24\n192.168.2.*\n192.168.1.100`}
                                        />
                                        <small>
                                            Hỗ trợ: IP đơn (192.168.1.100), Wildcard (192.168.1.*), CIDR (192.168.1.0/24)
                                        </small>
                                    </div>
                                </div>

                                <div className="exam-form-row">
                                    <div className="exam-form-group" style={{ flex: 1 }}>
                                        <label>Thông báo khi IP không hợp lệ</label>
                                        <textarea
                                            rows={3}
                                            value={blockedMessage}
                                            onChange={(e) => setBlockedMessage(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ========== MODAL FOOTER ========== */}
                    <div className="modal-footer">
                        <div className="validation-status">
                            {showValidationErrors && !isFormValid && (
                                <span className="validation-warning">
                                    <FiAlertTriangle />
                                    Vui lòng sửa các lỗi trước khi lưu
                                </span>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleClose} className="btn btn-secondary">
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || isValidating}
                            >
                                {isSubmitting || isValidating ? (
                                    <>⏳ Đang xử lý...</>
                                ) : (
                                    editingExam ? 'Cập nhật kỳ thi' : 'Tạo kỳ thi'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamFormModal;