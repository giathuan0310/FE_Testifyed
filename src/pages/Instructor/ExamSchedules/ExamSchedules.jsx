import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiCalendar, FiClock, FiUsers, FiEdit3, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { Table } from '../../../components/ui';
import { useExamSchedules } from '../../../hooks/useExamSchedules';
import { useSubjects } from '../../../hooks/useSubjects';
import { useClasses } from '../../../hooks/useClasses';
import { ExamScheduleStats, ExamScheduleFilters, ExamScheduleFormModal } from './components';
import { EXAM_SCHEDULE_STATUS_TEXT } from '../../../constants/instructor';
import { formatDateTime } from '../../../utils/instructor';
import { toast } from 'react-toastify';
import './ExamSchedules.css';

const ExamSchedules = () => {
    const { subjects } = useSubjects();
    const { classes } = useClasses();
    const {
        schedules,
        isLoading,
        error,
        stats,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        subjectFilter,
        setSubjectFilter,
        classFilter,
        setClassFilter,
        addSchedule,
        updateSchedule,
        deleteSchedule: handleDeleteSchedule,
        getScheduleById,
        cancelSchedule: handleCancelSchedule,
    } = useExamSchedules(subjects, classes);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    // Pagination state (added)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Pagination calculation
    const paginationData = useMemo(() => {
        const totalItems = (schedules || []).length;
        const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedSchedules = (schedules || []).slice(startIndex, endIndex);
        const startItem = totalItems === 0 ? 0 : startIndex + 1;
        const endItem = Math.min(endIndex, totalItems);

        return {
            totalItems,
            totalPages,
            paginatedSchedules,
            startIndex,
            startItem,
            endItem,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        };
    }, [schedules, currentPage, itemsPerPage]);
    const handlePageChange = (page) => {
        if (page >= 1 && page <= paginationData.totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const { totalPages } = paginationData;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }
        return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    // Modal handlers
    const openScheduleModal = async (schedule = null) => {
        if (schedule) {
            try {
                const detail = await getScheduleById(schedule._id);
                setEditingSchedule(detail || schedule);
            } catch (error) {
                console.error('Error fetching schedule:', error);
                setEditingSchedule(schedule);
            }
        } else {
            setEditingSchedule(null);
        }
        setShowScheduleModal(true);
    };

    const closeScheduleModal = () => {
        setShowScheduleModal(false);
        setEditingSchedule(null);
    };

    // Submit handler
    const handleScheduleSubmit = async (formData) => {
        let result;
        if (editingSchedule) {
            result = await updateSchedule(editingSchedule._id, formData);
        } else {
            result = await addSchedule(formData);
        }

        if (result.success) {
            closeScheduleModal();
            toast.success(editingSchedule ? 'Cập nhật lịch thi thành công!' : 'Thêm lịch thi thành công!');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    // Delete handler
    const handleDelete = async (scheduleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch thi này?')) {
            const result = await handleDeleteSchedule(scheduleId);
            if (result.success) {
                toast.success('Xóa lịch thi thành công!');
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi xóa');
            }
        }
    };

    //cancle
    const handleCancel = async (scheduleId) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy lịch thi này?')) {
            const result = await handleCancelSchedule(scheduleId);
            if (result.success) {
                toast.success('Hủy lịch thi thành công!');
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi hủy lịch thi');
            }
        }
    };

    // Helper functions
    const getSubjectName = (subjectId) => {
        const subject = subjects?.find(s => s._id === subjectId);
        return subject ? subject.name : 'N/A';
    };

    const getClassName = (classObj) => {
        if (typeof classObj === 'string') return 'N/A';
        return classObj ? classObj.name : 'N/A';
    };

    const getExamName = (examObj) => {
        if (typeof examObj === 'string') return 'N/A';
        return examObj ? examObj.name : 'N/A';
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 0;
        return Math.round((new Date(endTime) - new Date(startTime)) / 60000);
    };

    useEffect(() => {

        const interval = setInterval(() => {
            window.location.reload();
        }, 60 * 5 * 1000); // 5 phút

        return () => clearInterval(interval);
    }, []);

    // Table columns
    const columns = [
        {
            key: 'stt',
            title: 'STT',
            render: (_, item) => (
                <div className="col-stt">
                    {item.__stt}
                </div>
            )
        },
        {
            key: 'examInfo',
            title: 'Thông tin kỳ thi',
            render: (_, item) => (
                <div className="schedule-info">
                    <h4 className="schedule-title">{getExamName(item.examId)}</h4>
                    <div className="schedule-details">
                        {/* <span><FiCalendar size={12} /> {formatDateTime(item.startTime)}</span> */}
                        <span><FiClock size={12} /> {calculateDuration(item.startTime, item.endTime)} phút</span>
                        <span><FiUsers size={12} />Lớp: {getClassName(item.classId)}</span>
                    </div>
                    <div className="schedule-subject">
                        <small>
                            Môn: {item.classId?.subjectId ? getSubjectName(item.classId.subjectId) : 'N/A'}
                        </small>
                    </div>
                </div>
            )
        },
        {
            key: 'timeInfo',
            title: 'Thời gian',
            render: (_, item) => (
                <div className="time-info">
                    <div className="time-row">
                        <small>Bắt đầu:</small>
                        <span>{new Date(item.startTime).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="time-row">
                        <small>Kết thúc:</small>
                        <span>{new Date(item.endTime).toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (_, item) => (
                <span className={`status-badge status-${item.currentStatus}`}>
                    {EXAM_SCHEDULE_STATUS_TEXT[item.currentStatus] || item.currentStatus}
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, item) => {
                const canEdit = item.currentStatus === 'scheduled';
                const canDelete = ['completed', 'cancelled'].includes(item.currentStatus);

                return (
                    <div className="action-buttons">
                        <button
                            onClick={() => openScheduleModal(item)}
                            className={`schedule-btn-action schedule-btn-edit ${!canEdit ? 'disabled' : ''}`}
                            title={canEdit ? "Chỉnh sửa" : "Không thể sửa khi đã bắt đầu"}
                            disabled={!canEdit}
                        >
                            <FiEdit3 size={14} />
                        </button>

                        {item.currentStatus === 'scheduled' && (
                            <button
                                onClick={() => handleCancel(item._id)}
                                className="schedule-btn-action schedule-btn-cancel"
                                title="Hủy lịch thi"
                            >
                                <FiX size={14} />
                            </button>
                        )}

                        <button
                            onClick={() => handleDelete(item._id)}
                            className={`schedule-btn-action schedule-btn-delete ${!canDelete ? 'disabled' : ''}`}
                            title={canDelete ? "Xóa" : "Không thể xóa"}
                            disabled={!canDelete}
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                );
            }
        }
    ];

    if (error) {
        return (
            <div className="error-container">
                <h3>Có lỗi xảy ra</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="schedule-management-container">
            <div className="schedule-management-header">
                <div className="header-content">
                    <h1>Quản lý lịch thi</h1>
                    <p>Lên lịch thi cho các lớp học với đề thi có sẵn</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => openScheduleModal()}>
                        <FiPlus size={16} />
                        Tạo lịch thi mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            <ExamScheduleStats stats={stats} subjects={subjects} classes={classes} />

            {/* Filters */}
            <ExamScheduleFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                subjectFilter={subjectFilter}
                setSubjectFilter={setSubjectFilter}
                classFilter={classFilter}
                setClassFilter={setClassFilter}
                subjects={subjects}
                classes={classes}
            />

            {/* Table */}
            <div className="table-container">
                <Table
                    columns={columns}
                    data={(paginationData.paginatedSchedules || []).map((c, i) => ({ ...c, __stt: paginationData.startIndex + i + 1 }))}
                    loading={isLoading}
                    emptyMessage={
                        searchTerm || statusFilter !== 'all' || subjectFilter !== 'all' || classFilter !== 'all'
                            ? 'Không tìm thấy lịch thi phù hợp với bộ lọc'
                            : "Bạn chưa có lịch thi nào. Hãy tạo lịch thi đầu tiên!"
                    }
                    responsive={true}
                    hover={true}
                    striped={true}
                />
                {/* Pagination controls */}
                {paginationData.totalPages > 1 && (
                    <div className="pagination-container" style={{ marginTop: 12 }}>
                        <div className="pagination-info">
                            <span>
                                Hiển thị {paginationData.startItem} - {paginationData.endItem} trong tổng số {paginationData.totalItems} kết quả
                            </span>
                        </div>

                        <div className="pagination-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div className="items-per-page">
                                <label>Hiển thị:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                    className="items-per-page-select"
                                    style={{ marginLeft: 8 }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="pagination-buttons" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <button className="pagination-btn" onClick={() => handlePageChange(1)} disabled={!paginationData.hasPrevPage} title="Trang đầu">«</button>
                                <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={!paginationData.hasPrevPage} title="Trang trước">‹</button>

                                <div className="page-numbers" style={{ display: 'flex', gap: 6 }}>
                                    {getPageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            className={`page-number ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                            onClick={() => page !== '...' && handlePageChange(page)}
                                            disabled={page === '...'}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={!paginationData.hasNextPage} title="Trang sau">›</button>
                                <button className="pagination-btn" onClick={() => handlePageChange(paginationData.totalPages)} disabled={!paginationData.hasNextPage} title="Trang cuối">»</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ExamScheduleFormModal
                isOpen={showScheduleModal}
                onClose={closeScheduleModal}
                onSubmit={handleScheduleSubmit}
                subjects={subjects}
                classes={classes}
                editingSchedule={editingSchedule}
            />
        </div>
    );
};

export default ExamSchedules;