import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Table, Modal, LoadingSpinner, EmptySchedules, NoSearchResults } from '../../../components/ui';
import {
  getAllExamSchedulesApi,
  createExamScheduleApi,
  updateExamScheduleApi,
  deleteExamScheduleApi,
  cancelExamScheduleApi, // Thêm import này
  getAllExamsApi,
  getAllClassesForAdminApi
} from '../../../service/api/apiAdmin';
import { toast } from 'react-toastify';
import './ManageExamSchedules.css';
import { normalizeApiResponse, handleApiError, safeGet, formatDate, formatDateTime } from '../../../utils/apiHelpers';
import { useSubjects } from '../../../hooks/useSubjects';
import ExamScheduleFormModal from '../../Instructor/ExamSchedules/components/ExamScheduleFormModal';

const ManageExamSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // Giữ nguyên theo CSS
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const { subjects } = useSubjects();

  useEffect(() => {
    fetchSchedules();
    fetchExams();
    fetchClasses();
  }, []);

  // Thêm auto-refresh mỗi 2 phút
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSchedules();
    }, 2 * 60 * 1000); // 2 phút

    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await getAllExamSchedulesApi();
      const normalizedResponse = normalizeApiResponse(response);

      if (normalizedResponse.success) {
        setSchedules(normalizedResponse.data || []);
      } else {
        console.error('Schedules API response:', response);
        toast.error('Không thể tải danh sách lịch thi');
        setSchedules([]);
      }
    } catch (error) {
      const errorResult = handleApiError(error, 'fetch schedules');
      toast.error(errorResult.error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await getAllExamsApi();
      if (response.success || response.status) {
        setExams(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await getAllClassesForAdminApi();
      if (response.status) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} className="text-blue-500" />;
      case 'in_progress':
        return <AlertCircle size={16} className="text-orange-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'in_progress':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const isDateInRange = (date, range) => {
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'TODAY':
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return examDate >= today && examDate <= todayEnd;
      case 'WEEK':
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return examDate >= today && examDate <= weekEnd;
      case 'MONTH':
        const monthEnd = new Date(today);
        monthEnd.setMonth(today.getMonth() + 1);
        return examDate >= today && examDate <= monthEnd;
      default:
        return true;
    }
  };

  // SỬA: Sử dụng currentStatus thay vì status
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      schedule.examId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.classId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.classId?.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Sử dụng currentStatus và map với filter values
    const currentStatus = schedule.currentStatus;
    let matchesStatus = false;

    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'scheduled' && currentStatus === 'scheduled') {
      matchesStatus = true;
    } else if (statusFilter === 'in_progress' && currentStatus === 'in_progress') {
      matchesStatus = true;
    } else if (statusFilter === 'completed' && currentStatus === 'completed') {
      matchesStatus = true;
    } else if (statusFilter === 'cancelled' && currentStatus === 'cancelled') {
      matchesStatus = true;
    }

    const matchesDate = dateFilter === 'ALL' || isDateInRange(schedule.startTime, dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });
  // Pagination state (added)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const totalItems = (filteredSchedules || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchedules = (filteredSchedules || []).slice(startIndex, endIndex);
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
  }, [filteredSchedules, currentPage, itemsPerPage]);
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

  const openCreateModal = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const openDeleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingSchedule(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedSchedule(null);
  };

  const handleScheduleSubmit = async (scheduleData) => {
    try {
      let response;

      if (editingSchedule) {
        response = await updateExamScheduleApi(editingSchedule._id, scheduleData);
      } else {
        response = await createExamScheduleApi(scheduleData);
      }

      if (response.status) {
        toast.success(editingSchedule ? 'Cập nhật lịch thi thành công' : 'Tạo lịch thi thành công');
        fetchSchedules();
        closeScheduleModal();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Lỗi khi lưu lịch thi');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteExamScheduleApi(selectedSchedule._id);
      if (response.status) {
        toast.success('Xóa lịch thi thành công');
        fetchSchedules();
        closeDeleteModal();
      } else {
        toast.error('Không thể xóa lịch thi');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Lỗi khi xóa lịch thi');
    }
  };

  // THÊM: Function handle cancel
  const handleCancel = async (scheduleId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch thi này?')) {
      try {
        const response = await cancelExamScheduleApi(scheduleId);
        if (response.status) {
          toast.success('Hủy lịch thi thành công!');
          fetchSchedules();
        } else {
          toast.error('Có lỗi xảy ra khi hủy lịch thi');
        }
      } catch (error) {
        console.error('Error cancelling schedule:', error);
        toast.error('Có lỗi xảy ra khi hủy lịch thi');
      }
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s._id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  const columns = [
    {
      key: 'stt',
      title: 'STT',
      width: '50px',
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
          <h4 className="schedule-title" style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', color: '#1f2937' }}>
            {item.examId?.name || 'N/A'}
          </h4>
          <div className="schedule-details" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {item.examId?.duration || 0} phút
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} />Lớp: {item.classId?.name || 'N/A'}
            </span>
          </div>
          <div className="schedule-subject">
            <small style={{ fontSize: '11px', color: '#9ca3af' }}>
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
      render: (_, item) => { // SỬA: Sử dụng item.currentStatus
        const status = item.currentStatus;
        const getStatusClass = (status) => {
          switch (status) {
            case 'scheduled':
              return 'status-scheduled';
            case 'in_progress':
              return 'status-ongoing'; // Map với CSS có sẵn
            case 'completed':
              return 'status-completed';
            case 'cancelled':
              return 'status-cancelled';
            default:
              return 'status-default';
          }
        };

        return (
          <span className={`status-badge ${getStatusClass(status)}`} style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getStatusIcon(status)}
            {getStatusText(status)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, schedule) => {
        // Logic enable/disable buttons dựa trên currentStatus
        const canEdit = schedule.currentStatus === 'scheduled';
        const canDelete = ['completed', 'cancelled'].includes(schedule.currentStatus);
        const canCancel = schedule.currentStatus === 'scheduled';

        return (
          <div className="action-buttons"> {/* Sử dụng class có sẵn */}
            <button
              onClick={() => openEditModal(schedule)}
              className={`action-btn edit-btn ${!canEdit ? 'disabled' : ''}`}
              title={canEdit ? "Chỉnh sửa" : "Không thể sửa khi đã bắt đầu"}
              disabled={!canEdit}
            >
              <Edit size={14} />
            </button>

            {/* THÊM: Button Cancel */}
            {canCancel && (
              <button
                onClick={() => handleCancel(schedule._id)}
                className="action-btn cancel-btn"
                title="Hủy lịch thi"
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <XCircle size={14} />
              </button>
            )}

            <button
              onClick={() => openDeleteModal(schedule)}
              className={`action-btn delete-btn ${!canDelete ? 'disabled' : ''}`}
              title={canDelete ? "Xóa" : "Không thể xóa"}
              disabled={!canDelete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      }
    }
  ];

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Xác nhận xóa"
        size="medium"
      >
        <div className="text-center py-4">
          <div className="mb-4">
            <Calendar size={48} className="mx-auto text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">Xóa lịch thi</h3>
            <p className="text-gray-600 mt-2">
              Bạn có chắc chắn muốn xóa lịch thi "{selectedSchedule?.examId?.name}" không?
              <br />
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // SỬA: Cập nhật stats để sử dụng currentStatus
  const today = new Date();
  const stats = {
    total: schedules.length,
    today: schedules.filter(s => isDateInRange(s.startTime, 'TODAY')).length,
    thisWeek: schedules.filter(s => isDateInRange(s.startTime, 'WEEK')).length,
    completed: schedules.filter(s => s.currentStatus === 'completed').length // Sử dụng currentStatus
  };

  return (
    <div className="manage-exam-schedules">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <Calendar size={24} />
            Quản lý lịch thi
          </h1>
          <p>Quản lý lịch thi và phân công phòng thi</p>
        </div>
        <div className="header-actions">
          <button
            className="btn primary"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Tạo lịch thi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng lịch thi</p>
              <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hôm nay</p>
              <p className="text-lg font-semibold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tuần này</p>
              <p className="text-lg font-semibold text-gray-900">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đã hoàn thành</p>
              <p className="text-lg font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo bài thi, lớp học, môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="in_progress">Đang diễn ra</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tất cả thời gian</option>
            <option value="TODAY">Hôm nay</option>
            <option value="WEEK">Tuần này</option>
            <option value="MONTH">Tháng này</option>
          </select>
        </div>

        <div className="results-info">
          Hiển thị {filteredSchedules.length} / {schedules.length} lịch thi
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <LoadingSpinner size="large" message="Đang tải danh sách lịch thi..." />
        ) : filteredSchedules.length === 0 ? (
          searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? (
            <NoSearchResults />
          ) : (
            <EmptySchedules onCreateSchedule={openCreateModal} />
          )
        ) : (
          <Table
            columns={columns}
            data={paginationData.paginatedSchedules.map((schedule, index) => ({ ...schedule, __stt: paginationData.startIndex + index + 1 }))}
            loading={false}
            emptyMessage="Không có lịch thi nào"
          />
        )}
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

      <ExamScheduleFormModal
        isOpen={showScheduleModal}
        onClose={closeScheduleModal}
        onSubmit={handleScheduleSubmit}
        subjects={subjects || []}
        classes={classes || []}
        editingSchedule={editingSchedule}
      />

      {renderDeleteModal()}
    </div>
  );
};

export default ManageExamSchedules;