import React, { useState, useMemo, useEffect } from 'react';
import {
    FiPlus,
    FiEdit3,
    FiTrash2,
} from 'react-icons/fi';
import { useSubjects } from '../../../hooks/useSubjects';
import { Modal, SearchBar, StatsCard, Table } from '../../../components/ui';
import './SubjectManagement.css';
import { toast } from 'react-toastify';

const SubjectManagement = () => {
    const {
        subjects,
        isLoading,
        error,
        addSubject,
        updateSubject,
        deleteSubject,
        defaultValues
    } = useSubjects();

    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState(defaultValues);
    const [searchTerm, setSearchTerm] = useState('');
    // Lọc môn học theo searchTerm
    const filteredSubjects = useMemo(() => {
        if (!searchTerm) return subjects;
        return subjects.filter(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subjects, searchTerm]);

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



    // Thống kê
    const stats = useMemo(() => ({
        totalSubjects: subjects.length,
        totalStudents: subjects.reduce((sum, sub) => sum + (sub.studentCount || 0), 0),
        averageStudentsPerSubject: subjects.length > 0
            ? Math.round(subjects.reduce((sum, sub) => sum + (sub.studentCount || 0), 0) / subjects.length)
            : 0,
        subjectsWithStudents: subjects.filter(sub => (sub.studentCount || 0) > 0).length
    }), [subjects]);

    const openModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name,
                code: subject.code,
                description: subject.description
            });
        } else {
            setEditingSubject(null);
            setFormData(defaultValues);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSubject(null);
        setFormData(defaultValues);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.code) {
            toast.error('Tên và mã môn học là bắt buộc');
            return;
        }
        let result;
        if (editingSubject) {
            result = await updateSubject(editingSubject._id, formData);
        } else {
            result = await addSubject(formData);
        }
        if (result.success) {
            closeModal();
            toast.success(editingSubject ? 'Cập nhật môn học thành công!' : 'Thêm môn học thành công!');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (subjectId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
            const result = await deleteSubject(subjectId);
            console.log('Delete result:', result); // Debug log

            if (result.success) {
                toast.success('Xóa môn học thành công!');
            } else {
                toast.error(result.error || 'Xóa môn học thất bại');
                if (result.constraints) {
                    console.log('Constraints:', result.constraints);
                }
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
            key: 'id',
            title: 'SubjectID',
            render: (_, item) => <span className="class-id">ID: {item._id}</span>
        },
        { key: 'name', title: 'Tên môn học' },

        { key: 'code', title: 'Mã môn học' },
        { key: 'description', title: 'Mô tả' },
        // {
        //     key: 'actions',
        //     title: 'Hành động',
        //     render: (_, item) => (
        //         <div className="subject-action-buttons">
        //             <button className="subject-btn-action subject-btn-edit" onClick={() => openModal(item)} title="Sửa">
        //                 <FiEdit3 size={16} />
        //             </button>
        //             <button className="subject-btn-action subject-btn-delete" onClick={() => handleDelete(item._id)} title="Xóa">
        //                 <FiTrash2 size={16} />
        //             </button>
        //         </div>
        //     )
        // }
    ];

    return (
        <div className="subject-management-container">
            <div className="subject-page-header">
                <div className="subject-header-content">
                    <h1>Quản lý môn học</h1>
                    <p>Tạo, sửa, xóa các môn học trong hệ thống</p>
                </div>
                {/* <div className="subject-header-actions">
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <FiPlus size={16} />
                        Thêm môn học
                    </button>
                </div> */}
            </div>
            {/* Stats */}
            <div className="subject-stats">
                <StatsCard
                    title="Tổng môn học"
                    value={stats.totalSubjects}
                    icon="📚"
                    color="blue"
                    cardClass="subject-stat-card"
                />
                <StatsCard
                    title="Tổng sinh viên"
                    value={stats.totalStudents}
                    icon="👥"
                    color="green"
                    cardClass="subject-stat-card"
                />
                <StatsCard
                    title="TB sinh viên/môn"
                    value={stats.averageStudentsPerSubject}
                    icon="📊"
                    color="yellow"
                    cardClass="subject-stat-card"
                />
                <StatsCard
                    title="Môn có sinh viên"
                    value={stats.subjectsWithStudents}
                    icon="✅"
                    color="purple"
                    cardClass="subject-stat-card"
                />
            </div>

            {/* Search Bar */}
            <div className="subject-search-bar">
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Tìm kiếm môn học theo tên hoặc mã môn..."
                    size="large"
                />
            </div>
            <div className="subject-table-container">
                <Table
                    columns={columns}
                    data={(paginationData.paginatedSubjects || []).map((c, i) => ({ ...c, __stt: paginationData.startIndex + i + 1 }))}
                    loading={isLoading}
                    emptyMessage={
                        searchTerm
                            ? 'Không tìm thấy môn học phù hợp với từ khóa tìm kiếm'
                            : 'Chưa có môn học nào. Hãy thêm môn học đầu tiên!'
                    }
                    tableClass="subject-table"
                    responsive
                    hover
                    striped
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

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
                size="medium"
                footer={
                    <>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            form="subject-form"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : (editingSubject ? 'Cập nhật' : 'Thêm môn học')}
                        </button>
                    </>
                }
            >
                <form id="subject-form" onSubmit={handleSubmit}>
                    <div className="subject-form-group">
                        <label>Tên môn học <span className="subject-required">*</span></label>
                        <input
                            type="text"
                            className="subject-form-input"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên môn học"
                        />
                    </div>
                    <div className="subject-form-group">
                        <label>Mã môn học <span className="subject-required">*</span></label>
                        <input
                            type="text"
                            className="subject-form-input"
                            required
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Nhập mã môn học"
                        />
                    </div>
                    <div className="subject-form-group">
                        <label>Mô tả</label>
                        <textarea
                            className="subject-form-input"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Mô tả môn học"
                            rows={3}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SubjectManagement;