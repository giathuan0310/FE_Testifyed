import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Users,
  Calendar,
  FileText
} from 'lucide-react';
import { Table, Modal, LoadingSpinner, EmptySubjects, NoSearchResults } from '../../../components/ui';
import {
  getAllSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  getAllClassesForAdminApi
} from '../../../service/api/apiAdmin';
import { toast } from 'react-toastify';
import './ManageSubjectsEnhanced.css';
import { normalizeApiResponse, handleApiError, safeGet, formatDate } from '../../../utils/apiHelpers';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3
  });

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await getAllSubjectsApi();
      const normalizedResponse = normalizeApiResponse(response);

      if (normalizedResponse.success) {
        setSubjects(normalizedResponse.data || []);
      } else {
        console.error('Subjects API response:', response);
        toast.error('Không thể tải danh sách môn học');
        setSubjects([]);
      }
    } catch (error) {
      const errorResult = handleApiError(error, 'fetch subjects');
      toast.error(errorResult.error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchClasses = async () => {
    try {
      const response = await getAllClassesForAdminApi();
      const normalizedResponse = normalizeApiResponse(response);

      if (normalizedResponse.success) {
        setClasses(normalizedResponse.data || []);
      } else {
        console.error('Classes API response:', response);
        setClasses([]);
      }
    } catch (error) {
      const errorResult = handleApiError(error, 'fetch classes');
      console.error(errorResult.error);
      setClasses([]);
    }
  };

  // Tính thống kê
  const getSubjectStats = (subjectId) => {
    const subjectClasses = classes.filter(cls => cls.subjectId?._id === subjectId);
    const totalStudents = subjectClasses.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
    const totalInstructors = new Set(subjectClasses.map(cls => cls.teacherId?._id)).size;

    return {
      classCount: subjectClasses.length,
      studentCount: totalStudents,
      instructorCount: totalInstructors
    };
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Pagination state (added)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const totalItems = (filteredSubjects || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubjects = (filteredSubjects || []).slice(startIndex, endIndex);
    const startItem = totalItems === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return {
      totalItems,
      totalPages,
      paginatedSubjects,
      startIndex,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredSubjects, currentPage, itemsPerPage]);
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

  const openModal = (type, subject = null) => {
    setModalType(type);
    setSelectedSubject(subject);
    if (subject && (type === 'edit' || type === 'view')) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        credits: subject.credits || 3
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        credits: 3
      });
    }
    setShowModal(true);
  };

  const openCreateModal = () => {
    openModal('create');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setModalType('');
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 3
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Tên môn học và mã môn học là bắt buộc');
      return;
    }

    try {
      let response;
      if (modalType === 'create') {
        response = await createSubjectApi(formData);
      } else if (modalType === 'edit') {
        response = await updateSubjectApi(selectedSubject._id, formData);
      }

      if (response.status) {
        toast.success(modalType === 'create' ? 'Tạo môn học thành công' : 'Cập nhật môn học thành công');
        fetchSubjects();
        closeModal();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Lỗi khi lưu môn học');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteSubjectApi(selectedSubject._id);
      if (response.status) {
        toast.success('Xóa môn học thành công');
        fetchSubjects();
        closeModal();
      } else {
        toast.error(response.message || 'Không thể xóa môn học');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Lỗi khi xóa môn học');
    }
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
      key: 'name',
      title: 'Tên môn học',
      width: '200px',
      render: (value, subject) => (
        <div>
          <div className="font-medium text-gray-900">{subject.name}</div>
          <div className="text-sm text-blue-600 font-mono">{subject.code}</div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Mô tả',
      width: '250px',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : 'Không có mô tả'}
        </div>
      )
    },
    {
      key: 'credits',
      title: 'Tín chỉ',
      width: '80px',
      render: (value) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
          {value || 3} TC
        </span>
      )
    },
    {
      key: 'stats',
      title: 'Thống kê',
      width: '200px',
      render: (_, subject) => {
        const stats = getSubjectStats(subject._id);
        return (
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <GraduationCap size={14} className="mr-1 text-blue-500" />
              <span>{stats.classCount} lớp</span>
            </div>
            <div className="flex items-center">
              <Users size={14} className="mr-1 text-green-500" />
              <span>{stats.studentCount} SV</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '120px',
      render: (value) => (
        <div className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '160px',
      render: (_, subject) => (
        <div className="flex space-x-2">
          <button
            className="action-btn view-btn"
            title="Xem chi tiết"
            onClick={() => openModal('view', subject)}
          >
            <Eye size={18} />
          </button>
          <button
            className="action-btn edit-btn"
            title="Chỉnh sửa"
            onClick={() => openModal('edit', subject)}
          >
            <Edit size={18} />
          </button>
          <button
            className="action-btn delete-btn"
            title="Xóa"
            onClick={() => openModal('delete', subject)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const renderModal = () => {
    if (!showModal) return null;

    const isView = modalType === 'view';
    const isDelete = modalType === 'delete';

    return (
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          modalType === 'create' ? 'Tạo môn học mới' :
            modalType === 'edit' ? 'Chỉnh sửa môn học' :
              modalType === 'delete' ? 'Xác nhận xóa' :
                'Chi tiết môn học'
        }
        size="medium"
      >
        {isDelete ? (
          <div className="text-center py-4">
            <div className="mb-4">
              <FileText size={48} className="mx-auto text-red-500 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Xóa môn học</h3>
              <p className="text-gray-600 mt-2">
                Bạn có chắc chắn muốn xóa môn học <strong>{selectedSubject?.name}</strong>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={closeModal}
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Nhập tên môn học"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã môn học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={isView}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono"
                placeholder="VD: CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tín chỉ
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                disabled={isView}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isView}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Mô tả về môn học..."
              />
            </div>

            {selectedSubject && isView && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Thống kê môn học</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getSubjectStats(selectedSubject._id).classCount}</div>
                    <div className="text-gray-600">Lớp học</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{getSubjectStats(selectedSubject._id).studentCount}</div>
                    <div className="text-gray-600">Sinh viên</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{getSubjectStats(selectedSubject._id).instructorCount}</div>
                    <div className="text-gray-600">Giảng viên</div>
                  </div>
                </div>
              </div>
            )}

            {!isView && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalType === 'create' ? 'Tạo môn học' : 'Cập nhật'}
                </button>
              </div>
            )}
          </form>
        )}
      </Modal>
    );
  };

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
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Tạo môn học
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng môn học</p>
              <p className="text-lg font-semibold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng lớp học</p>
              <p className="text-lg font-semibold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng sinh viên</p>
              <p className="text-lg font-semibold text-gray-900">
                {classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Môn có lớp</p>
              <p className="text-lg font-semibold text-gray-900">
                {subjects.filter(subject =>
                  classes.some(cls => cls.subjectId?._id === subject._id)
                ).length}
              </p>
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
            placeholder="Tìm kiếm theo tên, mã môn học, mô tả..."
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
        {loading ? (
          <LoadingSpinner size="large" message="Đang tải danh sách môn học..." />
        ) : filteredSubjects.length === 0 ? (
          searchTerm ? (
            <NoSearchResults />
          ) : (
            <EmptySubjects onCreateSubject={openCreateModal} />
          )
        ) : (
          <Table
            columns={columns}
            data={paginationData.paginatedSubjects.map((subject, index) => ({ ...subject, __stt: paginationData.startIndex + index + 1 }))}
            loading={false}
            emptyMessage="Không có môn học nào"
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

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default ManageSubjects;