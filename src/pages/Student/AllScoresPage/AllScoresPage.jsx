import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../../../hooks/useClasses';
import { useAppStore } from '../../../store/appStore';
import { toast } from 'react-toastify';
import './AllScoresPage.css';

const AllScoresPage = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const { classes, isLoading, getMyClasses } = useClasses();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const classesPerPage = 3;

    // Gọi API lấy danh sách lớp học khi component mount
    useEffect(() => {
        getMyClasses();
    }, [getMyClasses]);

    // Xử lý filter và sort
    const processedClasses = useMemo(() => {
        let results = classes || [];

        // 1. Lọc theo searchTerm
        if (searchTerm) {
            results = results.filter(classItem =>
                classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.codeJoin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classItem.subjectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sắp xếp theo sortOrder
        if (sortOrder === 'asc') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === 'desc') {
            results.sort((a, b) => b.name.localeCompare(a.name));
        }

        return results;
    }, [searchTerm, sortOrder, classes]);

    // Phân trang
    const indexOfLastClass = currentPage * classesPerPage;
    const indexOfFirstClass = indexOfLastClass - classesPerPage;
    const currentClasses = processedClasses.slice(indexOfFirstClass, indexOfLastClass);
    const totalPages = Math.ceil(processedClasses.length / classesPerPage);

    // Xử lý khi thay đổi trang
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Reset về trang 1 khi search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Xử lý click vào lớp học để xem điểm
    const handleClassClick = (classItem) => {
        // Navigate đến trang CourseGrades thông qua route của course detail
        navigate(`/student/dashboard/my-courses/${classItem._id}/grades`);
    };

    // Mảng màu cho các thẻ lớp học
    const colorList = [
        '#FFC107', '#E91E63', '#2196F3', '#4CAF50',
        '#FF9800', '#009688', '#795548', '#00BCD4',
        '#CDDC39', '#3F51B5', '#673AB7', '#90A4AE'
    ];

    if (isLoading) {
        return (
            <div className="all-scores-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách lớp học...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="all-scores-container">
            {/* Header */}
            <div className="all-scores-header">
                <h1>📊 Điểm số các lớp học</h1>
                <p>Xem điểm số của bạn trong tất cả các lớp học</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học, môn học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="search-icon">🔍</div>
                </div>

                <select
                    className="filter-dropdown"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="asc">Sắp xếp A-Z</option>
                    <option value="desc">Sắp xếp Z-A</option>
                </select>
            </div>

            {/* Statistics */}
            {classes.length > 0 && (
                <div className="scores-statistics">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <span className="stat-value">{classes.length}</span>
                            <span className="stat-label">Tổng số lớp</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <span className="stat-value">{processedClasses.length}</span>
                            <span className="stat-label">Lớp hiển thị</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👤</div>
                        <div className="stat-content">
                            <span className="stat-value">{user?.fullName || 'Sinh viên'}</span>
                            <span className="stat-label">Tài khoản</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Classes Grid */}
            <div className="classes-grid">
                {currentClasses.length > 0 ? (
                    currentClasses.map((classItem, idx) => {
                        const globalIdx = indexOfFirstClass + idx;
                        const backgroundColor = colorList[globalIdx % colorList.length];

                        return (
                            <div
                                key={classItem._id}
                                className="class-score-card"
                                onClick={() => handleClassClick(classItem)}
                            >
                                <div className="class-card-header">
                                    <div
                                        className="class-color-strip"
                                        style={{ backgroundColor }}
                                    ></div>
                                    <div className="class-info">
                                        <h3 className="class-name">{classItem.name}</h3>
                                        <p className="class-code">📋 {classItem.codeJoin}</p>
                                        <p className="class-subject">
                                            📚 {classItem.subjectId?.name || 'Chưa có môn học'}
                                        </p>
                                    </div>
                                </div>

                                <div className="class-card-body">
                                    <div className="class-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span className="stat-text">
                                                {classItem.studentIds?.length || 0} sinh viên
                                            </span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">📝</span>
                                            <span className="stat-text">Xem điểm số</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="class-card-footer">
                                    <button className="view-scores-btn">
                                        📊 Xem điểm
                                        <span className="btn-arrow">→</span>
                                    </button>
                                </div>

                                {/* Hover Effect */}
                                <div className="card-hover-overlay">
                                    <div className="hover-content">
                                        <span className="hover-icon">👁️</span>
                                        <span className="hover-text">Xem chi tiết điểm số</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-classes-found">
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>
                                {searchTerm
                                    ? `Không tìm thấy lớp học nào phù hợp với "${searchTerm}"`
                                    : 'Bạn chưa tham gia lớp học nào'
                                }
                            </h3>
                            <p>
                                {searchTerm
                                    ? 'Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả'
                                    : 'Tham gia các lớp học để xem điểm số của bạn'
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/student/dashboard/my-courses')}
                                    className="go-to-courses-btn"
                                >
                                    Đi đến danh sách lớp học
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {processedClasses.length > 0 && totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-button prev"
                    >
                        ← Trước
                    </button>

                    <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-button next"
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllScoresPage;