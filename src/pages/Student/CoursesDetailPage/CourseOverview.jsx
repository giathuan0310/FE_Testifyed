import React from 'react';
import { useCourseContext } from '../../../context/CourseContext'; // Import hook
import './styles/CourseOverview.css';
import { useMyExamSchedules } from '../../../hooks/useExamSchedules';
const CourseOverview = () => {
    const { course } = useCourseContext(); // Lấy dữ liệu từ context
    const { examSchedules } = useMyExamSchedules();
    const quizzesCount = examSchedules.filter(sch => sch.classId._id === course._id).length;
    if (!course) return null; // Xử lý trường hợp course chưa có

    const overviewData = {
        quizzesCount: quizzesCount,
        pendingAssignments: course.quizzes?.filter(q => q.status === 'Pending' && q.type === 'Assignment').length || 0,
        membersCount: course.studentIds?.length || 0,
        gradeAverage: course.grades?.reduce((sum, grade) => sum + parseFloat(grade.score || 0), 0) / course.grades?.length || 0,
    };

    const formattedGradeAverage = overviewData.gradeAverage ? overviewData.gradeAverage.toFixed(2) : 'N/A';

    return (
        <div className="cdo-tab-content">
            <h3 className="cdo-tab-title">Tổng quan khóa học</h3>
            <div className="cdo-overview-stats">
                <div className="cdo-stat-box blue">
                    <h4 className="cdo-stat-title">Bài kiểm tra</h4>
                    <p className="cdo-stat-value">{overviewData.quizzesCount}</p>
                </div>
                <div className="cdo-stat-box yellow">
                    <h4 className="cdo-stat-title">Bài tập chờ</h4>
                    <p className="cdo-stat-value">{overviewData.pendingAssignments}</p>
                </div>
                <div className="cdo-stat-box green">
                    <h4 className="cdo-stat-title">Thành viên</h4>
                    <p className="cdo-stat-value">{overviewData.membersCount}</p>
                </div>
                <div className="cdo-stat-box purple">
                    <h4 className="cdo-stat-title">Điểm TB</h4>
                    <p className="cdo-stat-value">{formattedGradeAverage}</p>
                </div>
            </div>
            <div className="cdo-announcements">
                <h4 className="cdo-ann-title">Thông báo mới nhất</h4>
                <p className="cdo-ann-content">Lịch thi cuối kỳ sẽ được cập nhật vào tuần tới. Vui lòng theo dõi thường xuyên.</p>
            </div>
        </div>
    );
};

export default CourseOverview;