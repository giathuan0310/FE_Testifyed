import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiTrash2, FiSettings } from 'react-icons/fi';
import { Modal, Table } from '../../../components/ui';
import { toast } from 'react-toastify';
import {
  getAllExamApi,
  createExamApi,
  updateExamApi,
  deleteExamApi,
  checkExamConstraintsApi,
  getExamByIdApi,
  validateExamQuestionsApi
} from '../../../service/api/apiExam';
import {
  getAllSubjectsApi
} from '../../../service/api/apiAdmin';
// ✅ Import components từ instructor
import ExamFormModal from '../../Instructor/ExamManagement/components/ExamFormModal';
import { ExamStats, ExamFilters } from '../../Instructor/ExamManagement/components';

import { normalizeApiResponse, handleApiError } from '../../../utils/apiHelpers';
import { Clock, Edit, Trash2 } from 'lucide-react';

const ManageExams = () => {
  // ✅ States giống instructor
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ✅ ExamFormModal states giống instructor
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const examData = await getAllExamApi();
      setExams(Array.isArray(examData) ? examData : []);
    } catch (error) {
      const errorResult = handleApiError(error, 'fetch exams');
      toast.error(errorResult.error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await getAllSubjectsApi();
      const normalizedResponse = normalizeApiResponse(response);

      if (normalizedResponse.success) {
        setSubjects(normalizedResponse.data || []);
      } else {
        console.error('Subjects API response:', response);
        setSubjects([]);
      }
    } catch (error) {
      const errorResult = handleApiError(error, 'fetch subjects');
      console.error(errorResult.error);
      setSubjects([]);
    }
  };

  // ✅ Filter logic giống instructor
  const filteredExams = exams.filter(exam => {
    const matchesSearch =
      exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.creatorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination state (added)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const totalItems = (filteredExams || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedExams = (filteredExams || []).slice(startIndex, endIndex);
    const startItem = totalItems === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return {
      totalItems,
      totalPages,
      paginatedExams,
      startIndex,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredExams, currentPage, itemsPerPage]);
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

  // ✅ Stats giống instructor
  const stats = {
    totalExams: exams.length,
    activeExams: exams.filter(e => e.status === 'active').length,
    draftExams: exams.filter(e => e.status === 'draft').length,
    scheduledExams: exams.filter(e => e.status === 'scheduled').length, // ✅ Thêm scheduled
    completedExams: exams.filter(e => e.status === 'completed').length,

  };

  // ✅ Hàm lấy tên môn học giống instructor
  const getSubjectNames = (exam) => {
    if (!exam.generationConfig?.structure?.length) {
      return 'Chưa xác định';
    }

    // Lấy tên môn học từ structure (đã được populate)
    const subjectNames = exam.generationConfig.structure
      .map(s => s.subjectId?.name) // subjectId đã là object có thuộc tính name
      .filter(name => name)
      .filter((name, index, arr) => arr.indexOf(name) === index); // Loại bỏ trùng lặp

    return subjectNames.length > 0 ? subjectNames.join(', ') : 'Chưa xác định';
  };

  // ✅ Exam form handlers giống instructor
  const validateExamQuestions = async (generationConfig) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateExamQuestionsApi(generationConfig);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError(error.message || 'Có lỗi xảy ra khi kiểm tra câu hỏi');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const resetValidation = () => {
    setValidationResult(null);
    setValidationError(null);
    setIsValidating(false);
  };

  const getExamById = async (examId) => {
    try {
      const response = await getExamByIdApi(examId);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching exam by ID:', error);
      return null;
    }
  };

  const handleExamSubmit = async (formData) => {
    let result;
    if (editingExam) {
      try {
        const response = await updateExamApi(editingExam._id, formData);
        result = { success: true, data: response };
      } catch (error) {
        result = { success: false, error: error.message || 'Cập nhật bài thi thất bại' };
      }
    } else {
      try {
        const response = await createExamApi(formData);
        result = { success: true, data: response };
      } catch (error) {
        result = { success: false, error: error.message || 'Tạo bài thi thất bại' };
      }
    }

    if (result.success) {
      closeExamModal();
      toast.success(editingExam ? 'Cập nhật kỳ thi thành công!' : 'Thêm kỳ thi thành công!');
      fetchExams(); // Refresh danh sách
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  };

  const openExamModal = async (exam = null) => {
    console.log('Opening modal for exam:', exam);

    if (exam) {
      try {
        const detail = await getExamById(exam._id);
        console.log('Fetched exam detail:', detail);

        if (detail) {
          setEditingExam(detail);
        } else {
          console.error('No exam detail returned');
          setEditingExam(exam);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setEditingExam(exam);
      }
    } else {
      setEditingExam(null);
    }
    setShowExamModal(true);
  };

  const closeExamModal = () => {
    setShowExamModal(false);
    setEditingExam(null);
    resetValidation();
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kỳ thi này?')) {
      try {
        // ✅ Kiểm tra constraints như instructor
        const constraintCheck = await checkExamConstraintsApi(examId);

        if (!constraintCheck.canDelete) {
          let errorMessage = `❌ **Không thể xóa bài thi**\n\n`;
          errorMessage += `🔗 **Lý do:** ${constraintCheck.message}\n\n`;

          if (constraintCheck.schedules && constraintCheck.schedules.length > 0) {
            errorMessage += `📋 **Danh sách lịch thi đang được lên kế hoạch:**\n\n`;
            constraintCheck.schedules.forEach((schedule, index) => {
              errorMessage += `${index + 1}. **${schedule.scheduleDate}** lúc ${schedule.startTime}`;
              if (schedule.className) {
                errorMessage += ` - Lớp: ${schedule.className}`;
              }
              if (schedule.duration) {
                errorMessage += ` (${schedule.duration} phút)`;
              }
              errorMessage += `\n`;
            });
          }

          errorMessage += `\n⚠️ **Hướng dẫn:** Vui lòng hủy hoặc chuyển các lịch thi trên sang bài thi khác trước khi xóa bài thi này.`;

          alert(errorMessage);
          return;
        }

        const response = await deleteExamApi(examId);
        if (response.success) {
          toast.success('Xóa kỳ thi thành công!');
          fetchExams();
        } else {
          toast.error('Không thể xóa kỳ thi');
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        toast.error('❌ Lỗi khi xóa kỳ thi');
      }
    }
  };

  // ✅ Columns giống instructor
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
      key: 'name',
      title: 'Tên kỳ thi',
      render: (value, item) => (
        <div className="exam-info">
          {/* <h4 className="exam-title">{value || item.title}</h4> */}
          {/* <div className="exam-details">
            <span>Câu hỏi: {item.questionCount || 0}</span>
            <span>Thời gian: {item.duration} phút</span>
            <span>Môn học: {getSubjectNames(item)}</span>
          </div> */}
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">
            Người tạo: {item.creatorId?.fullName || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'subjects',
      title: 'Môn học',
      width: '180px',
      render: (value, item) => {
        return (
          <div className="space-y-1">
            <span>{getSubjectNames(item)}</span>
          </div>
        );
      }
    },
    {
      key: 'duration',
      title: 'Thời gian',
      width: '100px',
      render: (value, item) => {
        return (
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-gray-500" />
            <span>{item.duration} phút</span>
          </div>
        );
      }
    },
    {
      key: 'questionCount',
      title: 'Số câu hỏi',
      width: '100px',
      render: (value, item) => {
        return (
          <div className="flex items-center">
            <span>{item.questionCount || 0} Câu</span>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '120px',
      render: (value, item) => (
        <div className="text-sm text-gray-500">
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openExamModal(item)}
            className="action-btn edit-btn"
            title="Chỉnh sửa"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="action-btn delete-btn"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="exam-management-container">
      {/* ✅ Header giống instructor */}
      <div className="exam-management-header">
        <div className="header-content">
          <h1>Quản lý kỳ thi</h1>
          <p>Tạo và quản lý các kỳ thi</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openExamModal()}>
            <FiPlus size={16} />
            Tạo kỳ thi mới
          </button>
        </div>
      </div>

      {/* ✅ Stats component từ instructor */}
      <ExamStats stats={stats} />

      {/* ✅ Filters component từ instructor */}
      <ExamFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* ✅ Table giống instructor */}
      <div className="table-container">
        <Table
          columns={columns}
          data={paginationData.paginatedExams.map((exam, index) => ({ ...exam, __stt: paginationData.startIndex + index + 1 }))}
          loading={loading}
          emptyMessage={
            searchTerm || statusFilter !== 'all'
              ? 'Không tìm thấy kỳ thi phù hợp với bộ lọc'
              : "Bạn chưa có kỳ thi nào. Hãy tạo kỳ thi đầu tiên!"
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

      {/* ✅ ExamFormModal từ instructor với autoValidate={false} */}
      <ExamFormModal
        isOpen={showExamModal}
        onClose={closeExamModal}
        onSubmit={handleExamSubmit}
        subjects={subjects}
        editingExam={editingExam}
        validateExamQuestions={validateExamQuestions}
        validationResult={validationResult}
        isValidating={isValidating}
        validationError={validationError}
        resetValidation={resetValidation}
        autoValidate={false} // ✅ Tắt auto-validation cho admin
      />
    </div>
  );
};

export default ManageExams;