import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiSettings } from 'react-icons/fi';
import { Modal, Table } from '../../../components/ui';
import { useExams } from '../../../hooks/useExams';
import { useSubjects } from '../../../hooks/useSubjects';
import ExamFormModal from './components/ExamFormModal';
import './ExamManagement.css';
import { toast } from 'react-toastify';
import { ExamStats, ExamFilters } from "./components";
const ExamManagement = () => {
  const { subjects } = useSubjects();
  const {
    exams,
    filteredExams,
    isLoading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addExam,
    updateExam,
    deleteExam: handleDeleteExam,
    getExamById,
    validateExamQuestions,
    validationResult,
    isValidating,
    validationError,
    resetValidation,
    updateExamIPRestriction
  } = useExams(subjects);

  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

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
  // Hàm lấy tên môn học từ exam (sử dụng dữ liệu đã populate)
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
  const handleSaveIPRestriction = async (examId, config) => {
    const result = await updateExamIPRestriction(examId, config);
    if (result.success) {
      toast.success('Đã lưu cấu hình IP phòng Lab');
      // Cập nhật state exam đang chỉnh sửa để hiển thị lại
      setEditingExam(prev => prev ? { ...prev, ipRestriction: result.data } : prev);
    } else {
      toast.error(result.error || 'Lưu cấu hình IP thất bại');
    }
  };
  const handleExamSubmit = async (formData) => {
    let result;
    if (editingExam) {
      result = await updateExam(editingExam._id, formData);
    } else {
      result = await addExam(formData);
    }

    if (result.success) {
      closeExamModal();
      toast.success(editingExam ? 'Cập nhật kỳ thi thành công!' : 'Thêm kỳ thi thành công!');
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  };


  const openExamModal = async (exam = null) => {
    console.log('Opening modal for exam:', exam); // Debug 1

    if (exam) {
      try {
        const detail = await getExamById(exam._id);
        console.log('Fetched exam detail:', detail); // Debug 2

        if (detail) {
          setEditingExam(detail);
        } else {
          console.error('No exam detail returned');
          // Fallback: use original exam data
          setEditingExam(exam);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        // Fallback: use original exam data
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
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kỳ thi này?')) {
      const result = await handleDeleteExam(examId);
      if (!result.success) {
        toast.error(result.error || 'Có lỗi xảy ra khi xóa kỳ thi');
      } else {
        toast.success('Xóa kỳ thi thành công!');
      }
    }
  };



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
      key: 'name',
      title: 'Tên kỳ thi',
      render: (value, item) => (
        <div className="exam-info">
          <h4 className="exam-title">{value || item.title}</h4>
          <div className="exam-details">
            <span>Câu hỏi: {item.questionCount || 0}</span>
            <span>Thời gian: {item.duration} phút</span>
            <span>Môn học: {getSubjectNames(item)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, item) => (
        <div className="action-buttons">
          <button
            onClick={() => openExamModal(item)}
            className="exam-btn-action exam-btn-edit"
            title="Cấu hình chi tiết"
          >
            <FiSettings size={14} />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="exam-btn-action exam-btn-delete"
            title="Xóa"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="exam-management-container">
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

      {/* Stats */}
      <ExamStats stats={stats} />
      <ExamFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      <div className="table-container">
        <Table
          columns={columns}
          data={(paginationData.paginatedExams || []).map((c, i) => ({ ...c, __stt: paginationData.startItem + i }))}
          loading={isLoading}
          emptyMessage={
            searchTerm || statusFilter !== 'all'
              ? 'Không tìm thấy câu hỏi phù hợp với bộ lọc'

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
        onSaveIPRestriction={handleSaveIPRestriction}
      />
    </div>
  );
};

export default ExamManagement;