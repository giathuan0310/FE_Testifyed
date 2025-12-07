import React, { useState, useMemo } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiUpload, FiDownload, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { Modal, Table } from '../../../components/ui';
import { useQuestions } from '../../../hooks/useQuestions';
import { useSubjects } from '../../../hooks/useSubjects';
import { QUESTION_LEVELS, QUESTION_STATUS } from '../../../constants/instructor';
import { QuestionForm, QuestionFilters, QuestionStats, ImportExportModal } from './components';
import './QuestionBank.css';
import { toast } from 'react-toastify';

const QuestionBank = () => {
  // Use custom hooks for data management
  const { subjects } = useSubjects();
  const {
    questions,
    filteredQuestions,
    stats,
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
    addQuestion,
    updateQuestion,
    deleteQuestion: handleDeleteQuestion,
    getQuestionById,
    formatQuestionForForm,
    addOption: handleAddOption,
    removeOption: handleRemoveOption,
    updateOption: handleUpdateOption,
    defaultValues,
    levelOptions
  } = useQuestions(subjects, 'instructor');

  // Local state for UI
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState(defaultValues);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination logic
  const paginationData = useMemo(() => {
    const totalItems = filteredQuestions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);
    const startItem = totalItems === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return {
      totalItems,
      totalPages,
      paginatedQuestions,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredQuestions, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, subjectFilter, statusFilter]);

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++) {
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

  // Form handlers
  const handleFormSubmit = async (formData) => {
    let result;
    if (editingQuestion) {
      result = await updateQuestion(editingQuestion._id, formData);
    } else {
      result = await addQuestion(formData);
    }

    if (result.success) {
      closeModal();
      toast.success(editingQuestion ? 'Cập nhật câu hỏi thành công!' : 'Thêm câu hỏi thành công!');
    } else {
      toast.error(result.error || 'Có lỗii xảy ra');
    }
  };

  const openModal = async (question = null) => {
    if (question) {
      // Lấy dữ liệu chi tiết từ API
      const detail = await getQuestionById(question._id);
      if (detail) {
        setEditingQuestion(detail);
        setFormData(formatQuestionForForm(detail));
      } else {
        // Nếu không lấy được từ API, dùng data hiện có
        setEditingQuestion(question);
        setFormData(formatQuestionForForm(question));
      }
    } else {
      setEditingQuestion(null);
      setFormData(defaultValues);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData(defaultValues);
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const result = await handleDeleteQuestion(questionId);
      if (!result.success) {
        toast.error(result.error || 'Có lỗi xảy ra khi xóa câu hỏi');
      } else {
        toast.success('Xóa câu hỏi thành công!');

        // Check if current page is empty after deletion and adjust
        if (paginationData.paginatedQuestions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    }
  };

  const handleImportExportClick = () => {
    setShowImportExportModal(true);
  };

  const handleImportSuccess = () => {
    // Reload questions by triggering a re-fetch
    // Since useQuestions uses useEffect with apis dependency, we can force reload
    window.location.reload(); // Simple approach - reload page
    // Alternative: add refetch function to useQuestions hook
  };

  // Table columns configuration
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
      key: 'content',
      title: 'Câu hỏi',
      render: (value, item) => (
        <div className="question-info">
          <h4 className="question-content">{value}</h4>
          <div className="question-details">
            <span className="subject-name">{item.subjectId?.name}</span>
            <span className="chapter">Chương: {item.chapter}</span>
            <span className="topic">Chủ đề: {item.topic}</span>
          </div>
        </div>
      )
    },
    {
      key: 'level',
      title: 'Độ khó',
      className: 'table-col-center',
      render: (value) => (
        <span className={`level-badge level-${value.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </span>
      )
    },
    {
      key: 'subject',
      title: 'Môn học',
      render: (_, item) => (
        <div className="subject-info">
          {item.subjectId?.name}
          {item.subjectId?.code && <span className="subject-code">({item.subjectId.code})</span>}
        </div>
      )
    },
    {
      key: 'options',
      title: 'Lựa chọn',
      className: 'table-col-center',
      render: (value) => (
        <div className="options-count">
          <span>{value.length} lựa chọn</span>
          <small>{value.filter(opt => opt.isCorrect).length} đúng</small>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      className: 'table-col-actions',
      render: (_, item) => (
        <div className="table-actions">
          <button
            className="schedule-btn-action schedule-btn-edit"
            onClick={() => openModal(item)}
            title="Sửa"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            className="schedule-btn-action schedule-btn-delete"
            onClick={() => handleDelete(item._id)}
            title="Xóa"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="question-bank-container">
      {/* Header */}
      <div className="question-bank-header">
        <div className="header-content">
          <h1>Ngân hàng câu hỏi</h1>
          <p>Quản lý và tổ chức câu hỏi cho các bài thi</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleImportExportClick}>
            <FiUpload size={16} />
            <FiDownload size={16} />
            Import/Export
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus size={16} />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Stats */}
      <QuestionStats stats={stats} subjects={subjects} />

      {/* Filters */}
      <QuestionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjects={subjects}
        levelOptions={levelOptions}
        statusOptions={Object.values(QUESTION_STATUS)}
      />

      {/* Questions Table */}
      <div className="table-section">
        <Table
          columns={columns}
          data={(paginationData.paginatedQuestions || []).map((c, i) => ({ ...c, __stt: paginationData.startItem + i }))}

          loading={isLoading}
          emptyMessage={
            searchTerm || levelFilter !== 'all' || subjectFilter !== 'all'
              ? 'Không tìm thấy câu hỏi phù hợp với bộ lọc'
              : 'Bạn chưa có câu hỏi nào. Hãy tạo câu hỏi đầu tiên!'
          }
          responsive={true}
          hover={true}
          striped={true}
        />

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Hiển thị {paginationData.startItem} - {paginationData.endItem} trong tổng số {paginationData.totalItems} kết quả
              </span>
            </div>

            <div className="pagination-controls">
              <div className="items-per-page">
                <label>Hiển thị:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="items-per-page-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={!paginationData.hasPrevPage}
                  title="Trang đầu"
                >
                  <FiChevronsLeft size={16} />
                </button>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPrevPage}
                  title="Trang trước"
                >
                  <FiChevronLeft size={16} />
                </button>

                <div className="page-numbers">
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

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNextPage}
                  title="Trang sau"
                >
                  <FiChevronRight size={16} />
                </button>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(paginationData.totalPages)}
                  disabled={!paginationData.hasNextPage}
                  title="Trang cuối"
                >
                  <FiChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        size="large"
      >
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          subjects={subjects}
          isLoading={isLoading}
          isEditing={!!editingQuestion}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
          handleUpdateOption={handleUpdateOption}
        />
      </Modal>

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default QuestionBank;