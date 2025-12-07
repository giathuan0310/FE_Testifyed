

import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useCourseContext } from '../../../context/CourseContext';
import './styles/CourseDetailPage.css';

const CourseDetailPage = () => {
    const { course, loading } = useCourseContext();
    const location = useLocation();
    const { courseId } = useParams();

    if (loading) {
        return <div className="cdp-loading">
            ✅ Đang tải chi tiết khóa học...
        </div>;
    }

    if (!course) {
        return <div className="cdp-notfound">
            ❌ Không tìm thấy khóa học với ID: {courseId}.
        </div>;
    }

    const subNavLinks = [
        { path: '', label: 'Khóa học' },
        { path: 'quizzes', label: 'Bài kiểm tra' },
        { path: 'members', label: 'Danh sách thành viên' },
        { path: 'grades', label: 'Điểm số' }
    ];

    const isActiveLink = (path) => {
        if (path === '') {
            return location.pathname === `/student/dashboard/my-courses/${courseId}`;
        }
        return location.pathname === `/student/dashboard/my-courses/${courseId}/${path}`;
    };

    return (
        <div className="cdp-container">
            <div className="cdp-header">
                <h2 className="cdp-title">
                    {course.name}
                </h2>
                <p className="cdp-code">CodeJoin: {course.codeJoin}</p>
                <p className="cdp-instructor">Giảng viên: {course.teacherId?.fullName || 'N/A'}</p>
            
            </div>
            {/* Hiển thị subnav cho các tab, không hiển thị Breadcrumb ở đây */}
            {!location.pathname.includes('/quizzes/') && (
                <div className="cdp-subnav">
                    {subNavLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={
                                link.path === ''
                                    ? `/student/dashboard/my-courses/${course._id}`
                                    : `/student/dashboard/my-courses/${course._id}/${link.path}`
                            }
                            className={`cdp-subnav-link${isActiveLink(link.path) ? ' active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
            <div className="cdp-content">
                <Outlet />
            </div>
        </div>
    );
};

export default CourseDetailPage;