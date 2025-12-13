import React, { useState, useEffect, useMemo } from 'react';
import './MyCoursesPage.css';
import { Link } from 'react-router-dom';
import { useClasses } from "../../../hooks/useClasses";
import { toast } from 'react-toastify';
import { useAppStore } from '../../../store/appStore';
const MyCoursesPage = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' hoặc 'desc', mặc định là 'asc' (A-Z)

    // Thêm state cho join Class
    const { joinClass } = useClasses();
    const [codeJoin, setCodeJoin] = useState('');
    const [passJoin, setPassJoin] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const { classes, isLoading, getMyClasses } = useClasses();
    // Gọi API lấy danh sách lớp học của mình khi vào trang
    useEffect(() => {
        getMyClasses();
    }, [getMyClasses]);

    const processedCourses = useMemo(() => {
        console.log('Processing courses...');
        let results = classes;

        // 1. Lọc theo searchTerm
        if (searchTerm) {
            results = results.filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.codeJoin.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sắp xếp theo sortOrder
        if (sortOrder === 'asc') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === 'desc') {
            results.sort((a, b) => b.name.localeCompare(a.name));
        }


        return results;
    }, [searchTerm, sortOrder, classes]); // Dependencies

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!codeJoin.trim() || !passJoin.trim()) {
            toast.error('Vui lòng nhập đầy đủ mã lớp học và mã tham gia!');
            return;
        }
        setIsJoining(true);
        const result = await joinClass(codeJoin.trim(), passJoin.trim());
        if (result.success) {
            toast.success('Tham gia lớp học thành công!');
            setCodeJoin('');
            setPassJoin('');
            // TODO: reload danh sách lớp học nếu cần
        } else {
            toast.error(result.error || 'Tham gia lớp học thất bại!');
        }
        setIsJoining(false);
    };

    // --- State cho Phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 5;

    // Tính toán các khóa học hiển thị trên trang hiện tại
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = processedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    // Tính tổng số trang
    const totalPages = Math.ceil(processedCourses.length / coursesPerPage);

    // Xử lý khi thay đổi trang
    const handlePageChange = (pageNumber) => {
        // Đảm bảo số trang hợp lệ
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Xử lý khi thay đổi giá trị tìm kiếm (để reset về trang 1)
    useEffect(() => {
        // Reset về trang 1 khi searchTerm thay đổi
        setCurrentPage(1);
    }, [searchTerm]); // Chỉ chạy khi searchTerm thay đổi

    // Mảng màu cho các thẻ môn học
    const colorList = [
        '#FFC107', // yellow
        '#E91E63', // pink
        '#2196F3', // blue
        '#4CAF50', // green
        '#FF9800', // orange
        '#009688', // teal
        '#795548', // brown
        '#00BCD4', // cyan
        '#CDDC39', // lime
        '#3F51B5', // indigo
        '#673AB7', // purple
        '#90A4AE', // gray
        '#BDBDBD'  // default
    ];

    // --- Render Component ---
    return (
        <div className="my-courses-container">
            <h2>Các khóa học của tôi</h2>

            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    className="filter-dropdown"
                    value={sortOrder} // Giá trị đang được chọn của select
                    onChange={(e) => setSortOrder(e.target.value)} // Cập nhật sortOrder khi thay đổi
                >
                    <option value="asc">Sort by name (A-Z)</option>
                    <option value="desc">Sort by name (Z-A)</option>

                </select>
            </div>

            <form className="join-subject-form" onSubmit={handleJoin} style={{ marginBottom: 24 }}>
                <input
                    type="text"
                    placeholder="Mã lớp học (VD: MATH101)"
                    value={codeJoin}
                    onChange={e => setCodeJoin(e.target.value)}
                    className="join-input"
                    style={{ marginRight: 8, width: 180 }}
                />
                <input
                    type="text"
                    placeholder="Mã tham gia"
                    value={passJoin}
                    onChange={e => setPassJoin(e.target.value)}
                    className="join-input"
                    style={{ marginRight: 8, width: 140 }}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isJoining}
                    style={{ minWidth: 90 }}
                >
                    {isJoining ? 'Đang tham gia...' : 'Tham gia'}
                </button>
            </form>

            {isLoading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="courses-grid">
                    {currentCourses.length > 0 ? (
                        currentCourses.map((course, idx) => {
                            const globalIdx = indexOfFirstCourse + idx;
                            return (
                                <Link
                                    key={course._id}
                                    to={`/student/dashboard/my-courses/${course._id}`}
                                    className="course-card-link"
                                >
                                    <div className="course-card">
                                        <div className="course-image-container">
                                            <div
                                                className="course-image-placeholder"
                                                style={{ '--course-bg-color': colorList[globalIdx % colorList.length] }}
                                            >
                                                <div className="course-image-overlay"></div>
                                            </div>
                                        </div>
                                        <div className="course-info">
                                            <h3 className="course-title">{course.name}</h3>
                                            <p className="course-code">{course.codeJoin}</p>
                                            <p className="course-subject">{course.subjectId?.name}</p>

                                            <div className="course-options">
                                                <button className="course-option-btn">...</button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="no-results">
                            {searchTerm ? (
                                <p>Không tìm thấy khóa học nào phù hợp với "{searchTerm}".</p>
                            ) : (
                                <p>Không có khóa học nào.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            {processedCourses.length > 0 && totalPages > 1 && ( // Kiểm tra processedCourses.length để đảm bảo phân trang hiển thị đúng
                <div className="pagination-controls">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-button"
                    >
                        Trước
                    </button>

                    {/* Hiển thị các số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;
