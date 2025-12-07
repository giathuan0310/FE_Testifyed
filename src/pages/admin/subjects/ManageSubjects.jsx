import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  GraduationCap,
  Users,
  Calendar
} from 'lucide-react';
import { Table, Modal } from '../../../components/ui';
import {
  getAllSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  checkSubjectConstraintsApi,
  getAllClassesForAdminApi
} from '../../../service/api/apiAdmin';
import { toast } from 'react-toastify';
import './ManageSubjects.css';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete', 'constraint-error'
  const [constraintError, setConstraintError] = useState(null); // Thêm state cho constraint error
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    description: '',
    credits: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await getAllSubjectsApi();
      if (response.status) {
        setSubjects(response.data || []);
        console.log('Subjects loaded:', response.data);
      } else {
        toast.error('Không thể tải danh sách môn học');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Lỗi khi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      const response = await createSubjectApi(subjectData);
      if (response.status) {
        toast.success('Tạo môn học thành công');
        fetchSubjects();
        closeModal();
      } else {
        toast.error(response.message || 'Không thể tạo môn học');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Lỗi khi tạo môn học');
    }
  };

  const handleUpdateSubject = async (subjectData) => {
    try {
      const response = await updateSubjectApi(selectedSubject._id, subjectData);
      if (response.status) {
        toast.success('Cập nhật môn học thành công');
        fetchSubjects();
        closeModal();
      } else {
        toast.error(response.message || 'Không thể cập nhật môn học');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error('Lỗi khi cập nhật môn học');
    }
  };

  const handleDeleteSubject = async () => {
    try {
      // Kiểm tra ràng buộc trước khi xóa
      const constraintCheck = await checkSubjectConstraintsApi(selectedSubject._id);

      if (!constraintCheck.canDelete) {
        // Lưu thông tin constraint error và hiển thị modal
        setConstraintError({
          title: `Không thể xóa môn học "${selectedSubject.subjectName}"`,
          message: constraintCheck.message,
          classes: constraintCheck.classes || [],
          classCount: constraintCheck.classCount || 0
        });
        setModalType('constraint-error');
        return;
      }

      const response = await deleteSubjectApi(selectedSubject._id);
      if (response.status) {
        toast.success('✅ Xóa môn học thành công');
        fetchSubjects();
        closeModal();
      } else {
        toast.error(response.message || 'Không thể xóa môn học');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('❌ Lỗi khi xóa môn học');
    }
  };

  const openModal = (type, subject = null) => {
    console.log('ManageSubjects openModal called with:', type, subject); // Debug log
    setModalType(type);
    setSelectedSubject(subject);

    if (type === 'create') {
      setFormData({
        subjectName: '',
        subjectCode: '',
        description: '',
        credits: ''
      });
    } else if (type === 'edit' && subject) {
      setFormData({
        subjectName: subject.subjectName || '',
        subjectCode: subject.subjectCode || '',
        description: subject.description || '',
        credits: subject.credits || ''
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setModalType('');
    setConstraintError(null); // Reset constraint error
    setFormData({
      subjectName: '',
      subjectCode: '',
      description: '',
      credits: ''
    });
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      key: 'subjectCode',
      title: 'Mã môn học',
      width: '120px'
    },
    {
      key: 'subjectName',
      title: 'Tên môn học',
      width: '300px'
    },
    {
      key: 'credit',
      title: 'Số tín chỉ',
      width: '100px'
    },
    {
      key: 'description',
      title: 'Mô tả',
      width: '350px',
      render: (value) => value || 'Chưa có mô tả'
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '100px',
      render: (_, subject) => (
        <div className="action-buttons">
          <button
            className="action-btn edit"
            title="Chỉnh sửa"
            onClick={() => openModal('edit', subject)}
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn delete"
            title="Xóa"
            onClick={() => openModal('delete', subject)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="manage-subjects">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <BookOpen size={24} />
            Quản lý môn học
          </h1>
          <p>Quản lý thông tin môn học trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button
            className="btn primary"
            onClick={() => openModal('create')}
          >
            <Plus size={16} />
            Thêm môn học
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên môn học, mã môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="results-info">
          Hiển thị {filteredSubjects.length} / {subjects.length} môn học
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table
          columns={columns}
          data={filteredSubjects.map((subject, index) => ({ ...subject, __stt: index + 1 }))}
          loading={loading}
          emptyMessage="Không có môn học nào"
        />
      </div>

      {/* Constraint Error Modal */}
      {showModal && modalType === 'constraint-error' && constraintError && (
        <Modal
          isOpen={true}
          title="⚠️ Không thể xóa môn học"
          onClose={closeModal}
          size="large"
        >
          <div className="constraint-error-modal">
            <div className="error-header">
              <h3>❌ {constraintError.title}</h3>
              <p className="error-message">{constraintError.message}</p>
            </div>

            {constraintError.classes && constraintError.classes.length > 0 && (
              <div className="constraint-details">
                <h4>📋 Danh sách lớp học đang sử dụng môn học này:</h4>
                <div className="classes-list">
                  {constraintError.classes.map((classItem, index) => (
                    <div key={index} className="class-item">
                      <div className="class-info">
                        <span className="class-number">{index + 1}.</span>
                        <div className="class-details">
                          <strong className="class-name">{classItem.className}</strong>
                          <div className="class-meta">
                            <span className="student-count">
                              👥 {classItem.studentCount} sinh viên
                            </span>
                            {classItem.teacherName && (
                              <span className="teacher-name">
                                👨‍🏫 GV: {classItem.teacherName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="constraint-guidance">
              <h4>💡 Hướng dẫn giải quyết:</h4>
              <ul>
                <li>Xóa các lớp học đang sử dụng môn học này</li>
                <li>Hoặc chuyển các lớp học sang môn học khác</li>
                <li>Sau đó quay lại xóa môn học này</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button
                className="btn primary"
                onClick={closeModal}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Create/Edit */}
      {showModal && (modalType === 'create' || modalType === 'edit') && (
        <Modal
          isOpen={true}
          title={modalType === 'create' ? 'Tạo môn học mới' : 'Chỉnh sửa môn học'}
          onClose={closeModal}
          size="medium"
        >
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              const submitData = {
                subjectName: formData.subjectName,
                subjectCode: formData.subjectCode,
                description: formData.description,
                credits: parseInt(formData.credits)
              };

              if (modalType === 'create') {
                handleCreateSubject(submitData);
              } else {
                handleUpdateSubject(submitData);
              }
            }}
          >
            <div className="form-group">
              <label htmlFor="subjectName">Tên môn học *</label>
              <input
                id="subjectName"
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="Nhập tên môn học"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subjectCode">Mã môn học *</label>
              <input
                id="subjectCode"
                type="text"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="Nhập mã môn học"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="credits">Số tín chỉ *</label>
              <input
                id="credits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                placeholder="Nhập số tín chỉ"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả môn học"
                rows="3"
              />
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
                {modalType === 'create' ? 'Tạo môn học' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && modalType === 'delete' && (
        <Modal
          isOpen={true}
          title="Xác nhận xóa môn học"
          onClose={closeModal}
          size="small"
        >
          <div className="modal-content">
            <p>Bạn có chắc chắn muốn xóa môn học <strong>{selectedSubject?.subjectName}</strong>?</p>
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
                onClick={handleDeleteSubject}
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

export default ManageSubjects;