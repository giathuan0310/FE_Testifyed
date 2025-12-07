import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Table, Modal } from '../../../components/ui';
import {
  getAllClassesForAdminApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  checkClassConstraintsApi,
  getAllSubjectsApi,
  getAllUsersApi
} from '../../../service/api/apiAdmin';
import { toast } from 'react-toastify';
import './ManageClasses.css';
import './ManageClassesModal.css';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    className: '',
    subjectId: '',
    instructorId: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchInstructors();
  }, []);

  // Debug useEffect for modal state
  useEffect(() => {
    console.log('Modal state changed - showModal:', showModal, 'modalType:', modalType);
  }, [showModal, modalType]);

  // Helper function to generate random codes
  const generateRandomCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getAllClassesForAdminApi();
      if (response.status) {
        setClasses(response.data || []);
        console.log('Classes data:', response.data);
      } else {
        toast.error('Không thể tải danh sách lớp học');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Lỗi khi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.codeJoin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacherId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || classItem.subjectId?._id === selectedSubject;
    return matchesSearch && matchesSubject;
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

  const fetchSubjects = async () => {
    try {
      const response = await getAllSubjectsApi();
      if (response.status) {
        setSubjects(response.data || []);
        console.log('Subjects data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await getAllUsersApi();
      if (response.status) {
        const instructorList = response.data?.filter(user => user.role === 'INSTRUCTOR') || [];
        setInstructors(instructorList);
        console.log('Instructors data:', instructorList);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };



  const openModal = (type, classItem = null) => {
    console.log('openModal called with:', type, classItem); // Debug log
    console.log('Before setState - showModal:', showModal, 'modalType:', modalType);
    setModalType(type);
    setSelectedClass(classItem);

    if (type === 'create') {
      setFormData({
        className: '',
        subjectId: '',
        instructorId: ''
      });
    } else if (type === 'edit' && classItem) {
      setFormData({
        className: classItem.name || '',
        subjectId: classItem.subjectId?._id || '',
        instructorId: classItem.teacherId?._id || ''
      });
    }

    setShowModal(true);
    console.log('After setState - should show modal');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
    setModalType('');
    setFormData({
      className: '',
      subjectId: '',
      instructorId: ''
    });
  };

  const handleCreateClass = async (classData) => {
    try {
      const response = await createClassApi(classData);
      if (response && response.status) {
        toast.success('Tạo lớp học thành công');
        fetchClasses();
        closeModal();
      } else {
        toast.error(response?.message || 'Không thể tạo lớp học');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo lớp học');
    }
  };

  const handleUpdateClass = async (classData) => {
    try {
      const response = await updateClassApi(selectedClass._id, classData);
      if (response && response.status) {
        toast.success('Cập nhật lớp học thành công');
        fetchClasses();
        closeModal();
      } else {
        toast.error(response?.message || 'Không thể cập nhật lớp học');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật lớp học');
    }
  };

  const handleDeleteClass = async () => {
    try {
      // Kiểm tra ràng buộc trước khi xóa
      const constraintCheck = await checkClassConstraintsApi(selectedClass._id);

      if (!constraintCheck.canDelete) {
        // Tạo thông báo chi tiết với danh sách bài thi
        let errorMessage = `❌ **Không thể xóa lớp học "${selectedClass.className}"**\n\n`;
        errorMessage += `🔗 **Lý do:** ${constraintCheck.message}\n\n`;

        if (constraintCheck.exams && constraintCheck.exams.length > 0) {
          errorMessage += `📋 **Danh sách bài thi đang thuộc lớp học này:**\n\n`;
          constraintCheck.exams.forEach((exam, index) => {
            errorMessage += `${index + 1}. **${exam.examName}** (${exam.questionCount} câu hỏi, ${exam.duration} phút)\n`;
          });
        }

        errorMessage += `\n⚠️ **Hướng dẫn:** Vui lòng xóa hoặc chuyển các bài thi trên sang lớp học khác trước khi xóa lớp học này.`;

        // Hiển thị thông báo dạng confirm với thông tin chi tiết
        if (window.confirm(errorMessage)) {
          // Nếu user click OK, có thể hiển thị dialog quản lý bài thi
          console.log('User acknowledged constraint violation');
        }

        return;
      }

      const response = await deleteClassApi(selectedClass._id);
      if (response.status) {
        toast.success('✅ Xóa lớp học thành công');
        fetchClasses();
        closeModal();
      } else {
        toast.error(response.message || 'Không thể xóa lớp học');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('❌ Lỗi khi xóa lớp học');
    }
  };

  const columns = [
    {
      key: 'stt',
      title: 'STT',
      width: '10px',
      render: (_, item) => (
        <div className="col-stt">
          {item.__stt}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Tên lớp học',
      width: '180px',
      render: (value, classItem) => (
        <div>
          <div className="font-medium">{classItem.name}</div>
          <div className="text-sm text-gray-500">ID: {classItem._id?.slice(-12) || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'subjectId',
      title: 'Môn học',
      width: '160px',
      render: (value) => (
        <div className="subject-info">
          <div className="subject-name">{value?.name || 'Chưa có'}</div>
          <div className="subject-code">{value?.code || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'teacherId',
      title: 'Giảng viên',
      width: '160px',
      render: (value) => (
        <div className="teacher-info">
          <div className="teacher-name">{value?.fullName || 'Chưa có'}</div>
          <div className="teacher-code">{value?.code || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'codeJoin',
      title: 'Mã tham gia',
      width: '110px',
      render: (value) => (
        <span className="join-code code">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'passJoin',
      title: 'Pass tham gia',
      width: '110px',
      render: (value) => (
        <span className="join-code pass">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'studentIds',
      title: 'Sinh viên',
      width: '100px',
      render: (value) => (
        <div className="student-count">
          <Users size={16} />
          <span>{value?.length || 0} sinh viên</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '120px',
      render: (_, classItem) => (
        <div className="action-buttons">
          <button
            className="action-btn view"
            title="Xem chi tiết"
            onClick={() => openModal('view', classItem)}
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openModal('edit', classItem)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete"
            title="Xóa"
            onClick={() => openModal('delete', classItem)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="manage-classes">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <GraduationCap size={24} />
            Quản lý lớp học
          </h1>
          <p>Quản lý thông tin lớp học trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button
            className="btn primary"
            onClick={() => openModal('create')}
          >
            <Plus size={16} />
            Tạo lớp học
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp, môn học, giảng viên, mã tham gia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="results-info">
          Hiển thị {filteredClasses.length} / {classes.length} lớp học
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table
          columns={columns}
          data={(paginationData.paginatedClasses || []).map((c, i) => ({ ...c, __stt: paginationData.startIndex + i + 1 }))}
          loading={loading}
          emptyMessage="Không có lớp học nào"
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

      {/* Modal View */}
      {showModal && modalType === 'view' && selectedClass && (
        <Modal
          isOpen={true}
          title="Chi tiết lớp học"
          onClose={closeModal}
          size="medium"
        >
          <div className="class-details">
            <div className="info-section">
              <h3>Thông tin cơ bản</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên lớp học:</label>
                  <span>{selectedClass.name}</span>
                </div>
                <div className="info-item">
                  <label>Mã lớp học:</label>
                  <span className="font-mono">{selectedClass.codeJoin}</span>
                </div>
                <div className="info-item">
                  <label>Mật khẩu tham gia:</label>
                  <span className="font-mono">{selectedClass.passJoin}</span>
                </div>
                <div className="info-item">
                  <label>Số sinh viên hiện tại:</label>
                  <span>{selectedClass.studentIds?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Môn học</h3>
              <div className="subject-detail">
                <div className="subject-name">{selectedClass.subjectId?.name}</div>
                <div className="subject-code">Mã: {selectedClass.subjectId?.code}</div>
                <div className="subject-description">{selectedClass.subjectId?.description}</div>
              </div>
            </div>

            <div className="info-section">
              <h3>Giảng viên</h3>
              <div className="teacher-detail">
                <div className="teacher-name">{selectedClass.teacherId?.fullName}</div>
                <div className="teacher-code">Mã: {selectedClass.teacherId?.code}</div>
                <div className="teacher-email">Email: {selectedClass.teacherId?.email}</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={closeModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Create/Edit */}
      {showModal && (modalType === 'create' || modalType === 'edit') && (
        <Modal
          isOpen={true}
          title={modalType === 'create' ? 'Tạo lớp học mới' : 'Chỉnh sửa lớp học'}
          onClose={closeModal}
          size="medium"
        >
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();

              // Validation
              if (!formData.className || !formData.subjectId || !formData.instructorId) {
                toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
                return;
              }

              const submitData = {
                name: formData.className,
                subjectId: formData.subjectId,
                teacherId: formData.instructorId,
                codeJoin: generateRandomCode(6),
                passJoin: generateRandomCode(8)
              };

              if (modalType === 'create') {
                handleCreateClass(submitData);
              } else {
                // For edit, don't regenerate codes
                const editData = {
                  name: formData.className,
                  subjectId: formData.subjectId,
                  teacherId: formData.instructorId
                };
                handleUpdateClass(editData);
              }
            }}
          >
            <div className="form-group">
              <label htmlFor="className">Tên lớp học *</label>
              <input
                id="className"
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="Nhập tên lớp học"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subjectId">Môn học *</label>
              <select
                id="subjectId"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                required
              >
                <option value="">Chọn môn học</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="instructorId">Giảng viên *</label>
              <select
                id="instructorId"
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                required
              >
                <option value="">Chọn giảng viên</option>
                {instructors.map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.fullName} ({instructor.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn primary"
              >
                {modalType === 'create' ? 'Tạo lớp học' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Delete */}
      {showModal && modalType === 'delete' && (
        <Modal
          isOpen={true}
          title="Xác nhận xóa lớp học"
          onClose={closeModal}
          size="small"
        >
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn xóa lớp học <strong>{selectedClass?.className}</strong>?</p>
            <p className="warning-text">Thao tác này không thể hoàn tác!</p>

            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                className="btn danger"
                onClick={handleDeleteClass}
              >
                Xóa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageClasses;