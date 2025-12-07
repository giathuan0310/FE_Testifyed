import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiUsers, FiBookOpen, FiAlertTriangle } from 'react-icons/fi';
import { EXAM_SCHEDULE_STATUS } from '../../../../constants/instructor';
import { useExams } from '../../../../hooks/useExams';
import { formatDateTimeForInput, convertInputDateTimeToISO } from '../../../../utils/instructor';

// ✅ CHỈNH SỬA: Chỉ cho phép chọn "Đã lên lịch" cho tạo mới/update
const statuses = [
    { value: 'scheduled', label: 'Đã lên lịch' },
    // ✅ GỠ BỎ: Không cho user chọn các trạng thái này
    // { value: 'in_progress', label: 'Đang diễn ra' },
    // { value: 'completed', label: 'Hoàn thành' }
];

// ✅ DANH SÁCH ĐẦY ĐỦ để hiển thị thông tin
const allStatuses = [
    { value: 'scheduled', label: 'Đã lên lịch' },
    { value: 'in_progress', label: 'Đang diễn ra' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
];

const defaultScheduleForm = {
    examId: '',
    classId: '',
    startTime: '',
    endTime: '',
    status: 'scheduled' // ✅ MẶC ĐỊNH chỉ là "Đã lên lịch"
};

const ExamScheduleFormModal = ({ isOpen, onClose, onSubmit, subjects, classes, editingSchedule }) => {
    const [form, setForm] = useState(defaultScheduleForm);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Get ALL exams
    const { exams: availableExams, isLoading: examsLoading } = useExams();

    // ✅ FUNCTION KIỂM TRA TRẠNG THÁI CÓ THỂ CHỈNH SỬA
    const getEditableStatuses = () => {
        if (!editingSchedule) {
            // Tạo mới: chỉ cho phép "Đã lên lịch"
            return [{ value: 'scheduled', label: 'Đã lên lịch' }];
        }

        const currentStatus = editingSchedule.status;

        switch (currentStatus) {
            case 'scheduled':
                // Đã lên lịch: có thể chuyển thành "Đã hủy" hoặc giữ nguyên
                return [
                    { value: 'scheduled', label: 'Đã lên lịch' },
                    { value: 'cancelled', label: 'Đã hủy' }
                ];

            case 'in_progress':
                // Đang diễn ra: không cho phép thay đổi (read-only)
                return [{ value: 'in_progress', label: 'Đang diễn ra (Tự động)' }];

            case 'completed':
                // Hoàn thành: không cho phép thay đổi (read-only)
                return [{ value: 'completed', label: 'Hoàn thành (Tự động)' }];

            case 'cancelled':
                // Đã hủy: có thể chuyển về "Đã lên lịch" nếu thời gian còn phù hợp
                const now = new Date();
                const examStartTime = new Date(editingSchedule.startTime);

                if (examStartTime > now) {
                    // Còn thời gian -> có thể reactive
                    return [
                        { value: 'cancelled', label: 'Đã hủy' },
                        { value: 'scheduled', label: 'Đã lên lịch' }
                    ];
                } else {
                    // Đã quá thời gian -> không thể reactive
                    return [{ value: 'cancelled', label: 'Đã hủy (Không thể kích hoạt lại)' }];
                }

            default:
                return [{ value: 'scheduled', label: 'Đã lên lịch' }];
        }
    };

    // ✅ FUNCTION KIỂM TRA CÓ THỂ CHỈNH SỬA THỜI GIAN
    const canEditDateTime = () => {
        if (!editingSchedule) return true; // Tạo mới -> có thể chỉnh sửa

        const currentStatus = editingSchedule.status;
        return currentStatus === 'scheduled' || currentStatus === 'cancelled';
    };

    // ✅ FUNCTION HIỂN THỊ WARNING CHO TRẠNG THÁI TỰ ĐỘNG
    const getStatusWarning = () => {
        if (!editingSchedule) return null;

        const currentStatus = editingSchedule.status;

        switch (currentStatus) {
            case 'in_progress':
                return {
                    type: 'info',
                    message: '⏱️ Lịch thi đang diễn ra. Trạng thái được cập nhật tự động theo thời gian.'
                };

            case 'completed':
                return {
                    type: 'success',
                    message: '✅ Lịch thi đã hoàn thành. Trạng thái được cập nhật tự động theo thời gian.'
                };

            case 'cancelled':
                const now = new Date();
                const examStartTime = new Date(editingSchedule.startTime);

                if (examStartTime <= now) {
                    return {
                        type: 'warning',
                        message: '⚠️ Lịch thi đã bị hủy và đã quá thời gian. Không thể kích hoạt lại.'
                    };
                }
                return null;

            default:
                return null;
        }
    };

    const validateDateTime = (dateTimeString, fieldName = 'startTime') => {
        if (!dateTimeString) return null;

        const selectedDate = new Date(dateTimeString);
        const now = new Date();

        // ✅ THÊM: Chỉ validate thời gian tương lai cho lịch thi mới hoặc status = scheduled
        const canEditTime = canEditDateTime();
        if (canEditTime && selectedDate <= now) {
            return `${fieldName === 'startTime' ? 'Thời gian bắt đầu' : 'Thời gian kết thúc'} phải sau thời điểm hiện tại`;
        }

        if (isNaN(selectedDate.getTime())) {
            return `${fieldName === 'startTime' ? 'Thời gian bắt đầu' : 'Thời gian kết thúc'} không hợp lệ`;
        }

        return null;
    };

    const validateForm = () => {
        const errors = {};

        // ✅ CHỈ validate thời gian nếu có thể chỉnh sửa
        if (canEditDateTime()) {
            // Validate start time
            if (form.startTime) {
                const startTimeError = validateDateTime(form.startTime, 'startTime');
                if (startTimeError) {
                    errors.startTime = startTimeError;
                }
            }

            // Validate end time
            if (form.endTime) {
                const endTimeError = validateDateTime(form.endTime, 'endTime');
                if (endTimeError) {
                    errors.endTime = endTimeError;
                }
            }

            // Validate start time < end time
            if (form.startTime && form.endTime && !errors.startTime && !errors.endTime) {
                const startDate = new Date(form.startTime);
                const endDate = new Date(form.endTime);

                if (startDate >= endDate) {
                    errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
                }
            }

            if (!form.startTime) {
                errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
            }
        }

        // Validate required fields
        if (!form.examId) {
            errors.examId = 'Vui lòng chọn kỳ thi';
        }

        if (!form.classId) {
            errors.classId = 'Vui lòng chọn lớp học';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getMinDateTime = () => {
        // ✅ CHỈ áp dụng min time cho lịch thi có thể chỉnh sửa
        if (!canEditDateTime()) return '';

        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        return now.toISOString().slice(0, 16);
    };

    // Load editing data
    useEffect(() => {
        if (isOpen) {
            setValidationErrors({});

            if (editingSchedule) {
                console.log('🔍 Loading editing schedule:', editingSchedule);

                const startTime = formatDateTimeForInput(editingSchedule.startTime);
                const endTime = formatDateTimeForInput(editingSchedule.endTime);

                const formData = {
                    examId: editingSchedule.examId?._id || editingSchedule.examId || '',
                    classId: editingSchedule.classId?._id || editingSchedule.classId || '',
                    startTime: startTime,
                    endTime: endTime,
                    status: editingSchedule.status || 'scheduled'
                };

                setForm(formData);
                setSelectedExam(editingSchedule.examId);
                setSelectedClass(editingSchedule.classId);
            } else {
                console.log('🆕 Creating new schedule');
                setForm(defaultScheduleForm);
                setSelectedExam(null);
                setSelectedClass(null);
            }
        }
    }, [editingSchedule, isOpen]);

    // Auto calculate end time when start time or exam changes
    useEffect(() => {
        // ✅ CHỈ auto-calculate nếu có thể chỉnh sửa thời gian
        if (canEditDateTime() && form.startTime && selectedExam?.duration) {
            const startDate = new Date(form.startTime);
            const endDate = new Date(startDate.getTime() + selectedExam.duration * 60000);

            const formattedEndTime = formatDateTimeForInput(endDate);
            setForm(prev => ({
                ...prev,
                endTime: formattedEndTime
            }));
        }
    }, [form.startTime, selectedExam]);

    // Validate khi form thay đổi
    useEffect(() => {
        if (form.startTime || form.endTime || form.examId || form.classId) {
            const timer = setTimeout(() => {
                validateForm();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [form.startTime, form.endTime, form.examId, form.classId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // ✅ CHẶN chỉnh sửa thời gian nếu không được phép
        if ((name === 'startTime' || name === 'endTime') && !canEditDateTime()) {
            return;
        }

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Update selected exam when examId changes
        if (name === 'examId') {
            const exam = availableExams?.find(e => e._id === value);
            setSelectedExam(exam);
        }

        // Update selected class when classId changes
        if (name === 'classId') {
            const classObj = classes?.find(c => c._id === value);
            setSelectedClass(classObj);
        }

        // Validate real-time cho datetime fields
        if ((name === 'startTime' || name === 'endTime') && canEditDateTime()) {
            setTimeout(() => {
                if (name === 'startTime') {
                    const error = validateDateTime(value, name);
                    if (error) {
                        setValidationErrors(prev => ({
                            ...prev,
                            [name]: error
                        }));
                    }
                }
            }, 100);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            setTimeout(() => {
                const firstError = document.querySelector('.error-message');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        // Check subject compatibility
        const compatibility = checkSubjectCompatibility();
        if (!compatibility.compatible) {
            alert('Lớp học và kỳ thi phải cùng môn học!');
            return;
        }

        const submissionData = {
            ...form,
            startTime: form.startTime ? convertInputDateTimeToISO(form.startTime) : '',
            endTime: form.endTime ? convertInputDateTimeToISO(form.endTime) : ''
        };
        onSubmit(submissionData);
    };

    const renderError = (fieldName) => {
        if (validationErrors[fieldName]) {
            return (
                <div className="error-message" style={{
                    color: '#dc3545',
                    fontSize: '12px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FiAlertTriangle size={12} />
                    <span>{validationErrors[fieldName]}</span>
                </div>
            );
        }
        return null;
    };

    const getInputClassName = (fieldName) => {
        return validationErrors[fieldName] ? 'error' : '';
    };

    // Get class's subject info
    const getClassSubject = (classObj) => {
        if (!classObj?.subjectId) return null;
        if (typeof classObj.subjectId === 'object') {
            return classObj.subjectId;
        }
        return subjects?.find(s => s._id === classObj.subjectId) || null;
    };

    // Get exam's subject info 
    const getExamSubject = (exam) => {
        if (!exam?.generationConfig?.structure?.[0]?.subjectId) return null;
        const examSubject = exam.generationConfig.structure[0].subjectId;
        if (typeof examSubject === 'object') {
            return examSubject;
        }
        return subjects?.find(s => s._id === examSubject) || null;
    };

    // Check if class and exam have same subject
    const checkSubjectCompatibility = () => {
        if (!selectedClass || !selectedExam) return { compatible: true, message: '' };

        const classSubject = getClassSubject(selectedClass);
        const examSubject = getExamSubject(selectedExam);

        if (!classSubject || !examSubject) {
            return { compatible: true, message: 'Không thể xác định môn học' };
        }

        const compatible = classSubject._id === examSubject._id;
        return {
            compatible,
            message: compatible
                ? `✅ Môn học phù hợp: ${classSubject.name} (${classSubject.code})`
                : `⚠️ Không phù hợp: Lớp học (${classSubject.name}) ≠ Kỳ thi (${examSubject.name})`
        };
    };

    const subjectCompatibility = checkSubjectCompatibility();
    const statusWarning = getStatusWarning();
    const editableStatuses = getEditableStatuses();
    const dateTimeEditable = canEditDateTime();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content-exam schedule-form-modal">
                <div className="modal-header">
                    <h2>
                        <FiCalendar size={20} />
                        {editingSchedule ? 'Chỉnh sửa lịch thi' : 'Tạo lịch thi mới'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ✅ HIỂN THỊ WARNING CHO TRẠNG THÁI TỰ ĐỘNG */}
                    {statusWarning && (
                        <div className="status-warning" style={{
                            margin: '0 20px 20px 20px',
                            padding: '12px',
                            borderRadius: '6px',
                            backgroundColor: statusWarning.type === 'info' ? '#e3f2fd' :
                                statusWarning.type === 'success' ? '#e8f5e8' : '#fff3cd',
                            border: `1px solid ${statusWarning.type === 'info' ? '#2196f3' :
                                statusWarning.type === 'success' ? '#28a745' : '#ffc107'}`,
                            color: statusWarning.type === 'info' ? '#0d47a1' :
                                statusWarning.type === 'success' ? '#155724' : '#856404'
                        }}>
                            <small style={{ fontWeight: 'bold' }}>
                                {statusWarning.message}
                            </small>
                        </div>
                    )}

                    <div className="schedule-form-section">
                        <h3>
                            <FiBookOpen size={16} />
                            Thông tin cơ bản
                        </h3>

                        <div className="schedule-form-row">
                            <div className="schedule-form-group">
                                <label>Lớp học *</label>
                                <select
                                    name="classId"
                                    value={form.classId}
                                    onChange={handleChange}
                                    className={getInputClassName('classId')}
                                    disabled={!dateTimeEditable} // ✅ Disable nếu không thể chỉnh sửa
                                    required
                                >
                                    <option value="">Chọn lớp học</option>
                                    {classes?.map(classItem => {
                                        const classSubject = getClassSubject(classItem);
                                        return (
                                            <option key={classItem._id} value={classItem._id}>
                                                {classItem.name} - {classSubject ? `${classSubject.name} (${classSubject.code})` : 'N/A'}
                                            </option>
                                        );
                                    })}
                                </select>
                                {renderError('classId')}
                                {selectedClass && (
                                    <div className="class-subject-info" style={{
                                        marginTop: '5px',
                                        padding: '8px',
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: '4px'
                                    }}>
                                        <small>
                                            <strong>📚 Môn học của lớp:</strong> {getClassSubject(selectedClass)?.name || 'N/A'} ({getClassSubject(selectedClass)?.code || 'N/A'})
                                        </small>
                                    </div>
                                )}
                            </div>

                            <div className="schedule-form-group">
                                <label>Kỳ thi *</label>
                                <select
                                    name="examId"
                                    value={form.examId}
                                    onChange={handleChange}
                                    className={getInputClassName('examId')}
                                    disabled={examsLoading || !dateTimeEditable} // ✅ Disable nếu không thể chỉnh sửa
                                    required
                                >
                                    <option value="">
                                        {examsLoading ? 'Đang tải...' : 'Chọn kỳ thi'}
                                    </option>
                                    {availableExams?.map(exam => {
                                        const examSubject = getExamSubject(exam);
                                        return (
                                            <option key={exam._id} value={exam._id}>
                                                {exam.name} - {examSubject ? `${examSubject.name} (${examSubject.code})` : 'N/A'} - {exam.duration}p/{exam.questionCount}câu
                                            </option>
                                        );
                                    })}
                                </select>
                                {renderError('examId')}
                                {selectedExam && (
                                    <div className="exam-subject-info" style={{
                                        marginTop: '5px',
                                        padding: '8px',
                                        backgroundColor: '#f3e5f5',
                                        borderRadius: '4px'
                                    }}>
                                        <small>
                                            <strong>📝 Môn học của kỳ thi:</strong> {getExamSubject(selectedExam)?.name || 'N/A'} ({getExamSubject(selectedExam)?.code || 'N/A'})
                                            <br />
                                            <strong>⏱️ Thời gian:</strong> {selectedExam.duration} phút |
                                            <strong> 📊 Số câu:</strong> {selectedExam.questionCount} |
                                            <strong> 🎯 Điểm tối đa:</strong> {selectedExam.maxScore}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subject Compatibility Check */}
                        {selectedClass && selectedExam && (
                            <div className="subject-compatibility" style={{
                                margin: '10px 0',
                                padding: '10px',
                                borderRadius: '6px',
                                backgroundColor: subjectCompatibility.compatible ? '#e8f5e8' : '#fff3cd',
                                border: `1px solid ${subjectCompatibility.compatible ? '#28a745' : '#ffc107'}`
                            }}>
                                <small style={{
                                    color: subjectCompatibility.compatible ? '#155724' : '#856404',
                                    fontWeight: 'bold'
                                }}>
                                    {subjectCompatibility.message}
                                </small>
                            </div>
                        )}

                        <div className="schedule-form-row">
                            <div className="schedule-form-group">
                                <label>Thời gian bắt đầu *</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={form.startTime}
                                    onChange={handleChange}
                                    className={getInputClassName('startTime')}
                                    min={getMinDateTime()} // ✅ Chỉ set min nếu có thể chỉnh sửa
                                    disabled={!dateTimeEditable} // ✅ Disable nếu không thể chỉnh sửa
                                    required
                                />
                                {renderError('startTime')}

                            </div>

                            <div className="schedule-form-group">
                                <label>Thời gian kết thúc *</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={form.endTime}
                                    onChange={handleChange}
                                    className={getInputClassName('endTime')}
                                    disabled // ✅ Luôn disabled vì được tính tự động
                                    required
                                />
                                {renderError('endTime')}
                                {form.startTime && form.endTime && (
                                    <small className="form-help">
                                        Thời lượng: {Math.round((new Date(form.endTime) - new Date(form.startTime)) / 60000)} phút
                                    </small>
                                )}
                            </div>

                            <div className="schedule-form-group">
                                <label>Trạng thái</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    {/* ✅ SỬ DỤNG editableStatuses thay vì statuses */}
                                    {editableStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                {/* ✅ Thêm thông tin về trạng thái */}
                                <small style={{ color: '#6c757d', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                                    {editingSchedule?.status === 'in_progress' && 'Trạng thái tự động theo thời gian'}
                                    {editingSchedule?.status === 'completed' && 'Trạng thái tự động theo thời gian'}
                                    {!editingSchedule && 'Chỉ có thể tạo lịch thi với trạng thái "Đã lên lịch"'}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Summary */}
                    {selectedExam && selectedClass && (
                        <div className="schedule-form-section">
                            <h3>
                                <FiUsers size={16} />
                                Tóm tắt lịch thi
                            </h3>

                            <div className="schedule-summary">
                                <div className="summary-row">
                                    <span className="summary-label">Lớp học:</span>
                                    <span className="summary-value">{selectedClass.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Môn học lớp:</span>
                                    <span className="summary-value">{getClassSubject(selectedClass)?.name} ({getClassSubject(selectedClass)?.code})</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Kỳ thi:</span>
                                    <span className="summary-value">{selectedExam.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Môn học kỳ thi:</span>
                                    <span className="summary-value">{getExamSubject(selectedExam)?.name} ({getExamSubject(selectedExam)?.code})</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Số câu hỏi:</span>
                                    <span className="summary-value">{selectedExam.questionCount} câu</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Thời gian làm bài:</span>
                                    <span className="summary-value">{selectedExam.duration} phút</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Điểm tối đa:</span>
                                    <span className="summary-value">{selectedExam.maxScore} điểm</span>
                                </div>
                                {form.startTime && (
                                    <div className="summary-row">
                                        <span className="summary-label">Thời điểm thi:</span>
                                        <span className="summary-value">
                                            {new Date(form.startTime).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                )}
                                {/* ✅ Hiển thị trạng thái hiện tại */}
                                <div className="summary-row">
                                    <span className="summary-label">Trạng thái:</span>
                                    <span className="summary-value">
                                        {allStatuses.find(s => s.value === form.status)?.label || form.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                Object.keys(validationErrors).length > 0 ||
                                (selectedClass && selectedExam && !subjectCompatibility.compatible)
                            }
                        >
                            {editingSchedule ? 'Cập nhật lịch thi' : 'Tạo lịch thi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamScheduleFormModal;