import React, { useState, useMemo, useEffect } from 'react';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiEye,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { useClasses } from '../../../hooks/useClasses';
import { useSubjects } from '../../../hooks/useSubjects';
import { Modal, Table, SearchBar, StatsCard } from '../../../components/ui';
import { generatePassJoin, validateClassForm } from '../../../utils/instructor';
import './ClassManagement.css';
import { toast } from 'react-toastify';
const ClassManagement = () => {
  // Use custom hook for class management
  const {
    classes,
    filteredClasses,
    stats,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    addClass,
    updateClass,
    deleteClass,
    getClassById,
    addStudentToClass,
    removeStudentFromClass,
    formatClassForForm,
    defaultValues
  } = useClasses();
  const { subjects } = useSubjects();

  // Local state for UI
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(defaultValues);

  //Xem chi tiết lớp học
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailClass, setDetailClass] = useState(null);

  // Thêm sinh viên vào lớp học
  const [newStudentCode, setNewStudentCode] = useState('');

  // Pagination state (added)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const totalItems = (filteredClasses || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClasses = (filteredClasses || []).slice(startIndex, endIndex);
    const startItem = totalItems === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return {
      totalItems,
      totalPages,
      paginatedClasses,
      startIndex,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredClasses, currentPage, itemsPerPage]);
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
  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateClassForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(msg => toast.error(msg));
      return;
    }

    let result;
    if (editingClass) {
      result = await updateClass(editingClass._id, formData);
    } else {
      result = await addClass(formData);

    }

    if (result.success) {
      closeModal();
      toast.success(editingClass ? 'Cập nhật lớp học thành công!' : 'Thêm lớp học thành công!');
    } else {
      toast.error(result.error || 'Có lỗi xảy ra');
    }
  };

  const openModal = async (cls = null) => {
    if (cls) {
      // Lấy dữ liệu chi tiết từ API
      const detail = await getClassById(cls._id);
      setEditingClass(detail);
      setFormData({
        ...detail,
        subjectId: detail.subjectId?._id || detail.subjectId
      });
    } else {
      setEditingClass(null);
      setFormData(defaultValues);
    }
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData(defaultValues);
  };
  const openDetailModal = async (cls) => {
    const detail = await getClassById(cls._id);
    setDetailClass(detail);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailClass(null);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này? Tất cả dữ liệu liên quan sẽ bị xóa.')) {
      const result = await deleteClass(classId);
      if (!result.success) {
        toast.error(result.error || 'Có lỗi xảy ra khi xóa lớp học');
      } else {
        toast.success('Xóa lớp học thành công!');
      }
    }
  };

  const copyPassJoin = (passJoin) => {
    navigator.clipboard.writeText(passJoin);
    toast.success('Đã copy mã tham gia!');
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
      key: 'name',
      title: 'Tên lớp học',
      render: (value, item) => (
        <div className="class-info-rs">
          <h4>{value}</h4>
          <span className="class-id">ID: {item._id}</span>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'Môn học',
      render: (_, item) => (
        <span>
          {item.subjectId?.name} <span className="class-code">{item.subjectId?.code}</span>
        </span>
      )
    },

    {
      key: 'codeJoin',
      title: 'Mã tham gia',
      render: (value) => (
        <div className="pass-join-container">
          <span className="pass-join">{value}</span>
          <button
            className="btn-copy"
            onClick={() => copyPassJoin(value)}
            title="Copy mã tham gia"
          >
            <FiCopy size={14} />
          </button>
        </div>
      )
    },
    {
      key: 'passJoin',
      title: 'Pass tham gia',
      render: (value) => (
        <div className="pass-join-container">
          <span className="pass-join">{value}</span>
          <button
            className="btn-copy"
            onClick={() => copyPassJoin(value)}
            title="Copy pass"
          >
            <FiCopy size={14} />
          </button>
        </div>
      )
    },
    {
      key: 'studentIds',
      title: 'Sinh viên',
      render: (value) => (
        <div className="student-count">
          <FiUsers size={16} />
          <span>{value.length} sinh viên</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      className: 'table-col-actions',
      render: (_, item) => (
        <div className="action-buttons">
          <button className="btn-action btn-view"
            onClick={() => openDetailModal(item)}
            title="Xem chi tiết">
            <FiEye size={16} />
          </button>
          <button
            className="btn-action btn-edit"
            onClick={() => openModal(item)}
            title="Sửa"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => handleDelete(item._id)}
            title="Xóa"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Thêm sinh viên vào lớp học
  const handleAddStudent = async () => {
    if (!newStudentCode.trim()) return;
    const result = await addStudentToClass(detailClass._id, newStudentCode.trim());
    if (result.success) {
      setDetailClass(result.data);
      setNewStudentCode('');
      toast.success('Thêm sinh viên thành công!');
    } else {
      toast.error(result.error || 'Thêm sinh viên thất bại');
    }
  };

  // Xóa sinh viên khỏi lớp học
  const handleRemoveStudent = async (studentCode) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?')) return;
    const result = await removeStudentFromClass(detailClass._id, studentCode);
    if (result.success) {
      setDetailClass(result.data);
      toast.success('Xóa sinh viên thành công!');
    } else {
      toast.error(result.error || 'Xóa sinh viên thất bại');
    }
  };
  return (
    <div className="class-management-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý lớp học phần</h1>
          <p>Tạo và quản lý các lớp học phần, mã tham gia và danh sách sinh viên</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus size={16} />
            Thêm lớp học phần
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="class-stats">
        <StatsCard
          title="Tổng lớp học phần"
          value={stats.totalClasses}
          icon="📚"
          color="blue"
        />
        <StatsCard
          title="Tổng sinh viên"
          value={stats.totalStudents}
          icon="👥"
          color="green"
        />
        <StatsCard
          title="TB sinh viên/lớp"
          value={stats.averageStudentsPerClass}
          icon="📊"
          color="yellow"
        />
        <StatsCard
          title="Lớp có sinh viên"
          value={stats.classesWithStudents}
          icon="✅"
          color="purple"
        />
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm lớp học phần theo tên hoặc mã lớp..."
          size="large"
        />
      </div>

      {/* Class Table */}
      <div className="table-section">
        <Table
          columns={columns}
          data={(paginationData.paginatedClasses || []).map((c, i) => ({ ...c, __stt: paginationData.startIndex + i + 1 }))}
          loading={isLoading}
          emptyMessage={
            searchTerm
              ? 'Không tìm thấy lớp học phần phù hợp với từ khóa tìm kiếm'
              : 'Bạn chưa có lớp học phần nào. Hãy tạo lớp học phần đầu tiên!'
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
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingClass ? 'Sửa lớp học phần' : 'Thêm lớp học phần mới'}
        size="medium"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              form="class-form"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : (editingClass ? 'Cập nhật' : 'Thêm lớp học phần')}
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên lớp học phần <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên lớp học phần"
            />
          </div>

          <div className="form-group">
            <label>Môn Học <span className="required">*</span></label>
            <select
              className="form-input"
              required
              value={formData.subjectId || ''}
              onChange={e => {
                setFormData({ ...formData, subjectId: e.target.value });
              }}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mã Tham gia <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.codeJoin}
              onChange={(e) => setFormData({ ...formData, codeJoin: e.target.value })}
              placeholder="VD: DBJ01"
            />
          </div>

          <div className="form-group">
            <label> Pass <span className="required">*</span></label>
            <div className="pass-join-input-container">
              <input
                type="text"
                className="form-input"
                required
                value={formData.passJoin}
                onChange={(e) => setFormData({ ...formData, passJoin: e.target.value })}
                placeholder="Mã để sinh viên tham gia lớp"
              />
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setFormData({ ...formData, passJoin: generatePassJoin() })}
              >
                Tạo mới
              </button>
            </div>
            <small className="form-help">
              Sinh viên sẽ sử dụng mã này để tham gia vào lớp học phần
            </small>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        title="Chi tiết lớp học phần"
        size="medium"
        footer={
          <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>
            Đóng
          </button>
        }
      >
        {detailClass ? (
          <div className="class-detail-modal">
            <div className="detail-row">
              <span className="detail-label">Tên lớp học phần:</span>
              <span className="detail-value">{detailClass.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Môn Học:</span>
              <span className="detail-value">{detailClass.subjectId?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Code & Pass:</span>
              <span className="detail-value badge badge-green">{detailClass.codeJoin} | {detailClass.passJoin}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Giảng viên:</span>
              <span className="detail-value">
                {detailClass.teacherId?.fullName} <span className="badge badge-blue">Mã GV: {detailClass.teacherId?.code}</span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Danh sách sinh viên:</span>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập mã sinh viên để thêm"
                value={newStudentCode}
                onChange={e => setNewStudentCode(e.target.value)}
                style={{ width: 180, marginRight: 8 }}
              />
              <button className="btn btn-primary  " onClick={handleAddStudent}>
                Thêm sinh viên
              </button>
            </div>
            <div className="student-list-scroll">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ tên</th>
                    <th>Mã SV</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {detailClass.studentIds && detailClass.studentIds.length > 0 ? (
                    detailClass.studentIds.map((stu, idx) => (
                      <tr key={stu._id}>
                        <td>{idx + 1}</td>
                        <td>{stu.fullName}</td>
                        <td>{stu.code}</td>
                        <td>
                          <button
                            className="schedule-btn-action schedule-btn-delete"
                            onClick={() => handleRemoveStudent(stu.code)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>Chưa có sinh viên nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày tạo:</span>
              <span className="detail-value">{new Date(detailClass.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày cập nhật:</span>
              <span className="detail-value">{new Date(detailClass.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div>Đang tải dữ liệu...</div>
        )}
      </Modal>
    </div>
  );
};

export default ClassManagement;