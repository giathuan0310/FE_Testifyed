import React, { useState, useEffect } from 'react';
import { AdminTable, AdminModal, PageHeader } from '../../components/ui';
import { getAllSubjectsApi, createSubjectApi, updateSubjectApi, deleteSubjectApi } from '../../service/api/apiAdmin';
import { toast } from 'react-toastify';
import { 
  BookOpen, 
  User, 
  Calendar,
  AlertTriangle,
  Save,
  X,
  Plus
} from 'lucide-react';
import './ManageSubjects.css';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3
  });

  const columns = [
    {
      key: 'code',
      title: 'Mã môn học',
      render: (code) => <span className="font-mono text-sm font-semibold">{code}</span>
    },
    {
      key: 'name',
      title: 'Tên môn học',
      render: (name) => <span className="font-semibold">{name}</span>
    },
    {
      key: 'credits',
      title: 'Số tín chỉ',
      render: (credits) => <span className="credit-badge">{credits} TC</span>
    },
    {
      key: 'description',
      title: 'Mô tả',
      render: (description) => (
        <span className="description-text">
          {description && description.length > 50 
            ? `${description.substring(0, 50)}...` 
            : description || 'Chưa có mô tả'
          }
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ];

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await getAllSubjectsApi();
      if (response.success) {
        setSubjects(response.data);
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

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleView = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      credits: subject.credits
    });
    setShowEditModal(true);
  };

  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 3
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    try {
      const response = showAddModal 
        ? await createSubjectApi(formData)
        : await updateSubjectApi(selectedSubject._id, formData);
      
      if (response.success) {
        toast.success(showAddModal ? 'Thêm môn học thành công' : 'Cập nhật môn học thành công');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchSubjects();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Lỗi khi lưu môn học');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteSubjectApi(selectedSubject._id);
      if (response.success) {
        toast.success('Xóa môn học thành công');
        setShowDeleteModal(false);
        fetchSubjects();
      } else {
        toast.error(response.message || 'Lỗi khi xóa môn học');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Lỗi khi xóa môn học');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.code.trim() && formData.credits > 0;
  };

  return (
    <div className="manage-subjects">
      <PageHeader
        title="Quản lý môn học"
        subtitle="Quản lý danh sách môn học trong hệ thống"
        onRefresh={fetchSubjects}
        onAdd={handleAdd}
        addButtonText="Thêm môn học"
      />

      <AdminTable
        columns={columns}
        data={subjects}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="Không có môn học nào"
      />

      {/* View Subject Modal */}
      <AdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Thông tin môn học"
        size="medium"
      >
        {selectedSubject && (
          <div className="subject-details">
            <div className="subject-info-grid">
              <div className="info-item">
                <div className="info-label">
                  <BookOpen size={16} />
                  Mã môn học
                </div>
                <div className="info-value">{selectedSubject.code}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <BookOpen size={16} />
                  Tên môn học
                </div>
                <div className="info-value">{selectedSubject.name}</div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={16} />
                  Số tín chỉ
                </div>
                <div className="info-value">
                  <span className="credit-badge">{selectedSubject.credits} TC</span>
                </div>
              </div>
              
              <div className="info-item full-width">
                <div className="info-label">
                  <BookOpen size={16} />
                  Mô tả
                </div>
                <div className="info-value description-full">
                  {selectedSubject.description || 'Chưa có mô tả'}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={16} />
                  Ngày tạo
                </div>
                <div className="info-value">
                  {new Date(selectedSubject.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={16} />
                  Cập nhật lần cuối
                </div>
                <div className="info-value">
                  {new Date(selectedSubject.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Add/Edit Subject Modal */}
      <AdminModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        title={showAddModal ? "Thêm môn học mới" : "Chỉnh sửa môn học"}
        size="medium"
        footer={
          <>
            <button 
              className="modal-btn modal-btn-secondary"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
            >
              <X size={16} />
              Hủy
            </button>
            <button 
              className="modal-btn modal-btn-success"
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              <Save size={16} />
              {showAddModal ? 'Thêm môn học' : 'Lưu thay đổi'}
            </button>
          </>
        }
      >
        <div className="subject-form">
          <div className="form-group">
            <label className="form-label">Mã môn học *</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              placeholder="VD: CS101, MATH201..."
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Tên môn học *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên môn học"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Số tín chỉ *</label>
            <select
              className="form-select"
              value={formData.credits}
              onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
              required
            >
              <option value={1}>1 tín chỉ</option>
              <option value={2}>2 tín chỉ</option>
              <option value={3}>3 tín chỉ</option>
              <option value={4}>4 tín chỉ</option>
              <option value={5}>5 tín chỉ</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả về môn học..."
              rows={4}
            />
          </div>
        </div>
      </AdminModal>

      {/* Delete Subject Modal */}
      <AdminModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa môn học"
        size="small"
        footer={
          <>
            <button 
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={16} />
              Hủy
            </button>
            <button 
              className="modal-btn modal-btn-danger"
              onClick={handleDeleteConfirm}
            >
              <AlertTriangle size={16} />
              Xóa môn học
            </button>
          </>
        }
      >
        <div className="delete-confirmation">
          <div className="warning-icon">
            <AlertTriangle size={48} color="#ef4444" />
          </div>
          <p>
            Bạn có chắc chắn muốn xóa môn học{' '}
            <strong>{selectedSubject?.name}</strong>?
          </p>
          <p className="warning-text">
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </p>
        </div>
      </AdminModal>
    </div>
  );
};

export default ManageSubjects;