import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseContext } from '../../../context/CourseContext';
import { useAppStore } from '../../../store/appStore';
import { getStudentAttemptsApi, getExamResultApi } from '../../../service/api/apiExam';
import { useMyExamSchedules } from '../../../hooks/useExamSchedules';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './styles/CourseGrades.css';
import { useClasses } from '../../../hooks/useClasses';

const CourseGrades = () => {
    const { courseId } = useParams();
    const courseContext = useCourseContext();
    const { user } = useAppStore();
    const { examSchedules, isLoading: schedulesLoading } = useMyExamSchedules();
    const navigate = useNavigate();
    const { getClassById } = useClasses();

    // States cho component
    const [course, setCourse] = useState(courseContext?.course || null);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchingCourse, setFetchingCourse] = useState(false);

    // Detect standalone mode (khi không có context và có courseId từ URL)
    const isStandaloneMode = !courseContext && courseId;

    // Fetch course data cho standalone mode
    useEffect(() => {
        const fetchCourseData = async () => {
            if (isStandaloneMode) {
                try {
                    setFetchingCourse(true);
                    const courseData = await getClassById(courseId);
                    if (courseData) {
                        setCourse(courseData);
                    } else {
                        setError('Không thể tải thông tin lớp học');
                    }
                } catch (error) {
                    console.error('Error fetching course data:', error);
                    setError('Không thể tải thông tin lớp học');
                } finally {
                    setFetchingCourse(false);
                }
            } else if (courseContext?.course) {
                setCourse(courseContext.course);
            }
        };

        fetchCourseData();
    }, [isStandaloneMode, courseId, courseContext?.course, getClassById]);

    // Lọc exam schedules của course hiện tại
    const courseExamSchedules = useMemo(() => {
        if (!examSchedules || !course?._id) return [];
        return examSchedules.filter(schedule =>
            schedule.classId._id === course._id
        );
    }, [examSchedules, course?._id]);

    // Fetch grades data
    useEffect(() => {
        const fetchGrades = async () => {
            if (!course?._id || !user?._id || schedulesLoading || courseExamSchedules.length === 0) {
                setLoading(false);
                return;
            }

            if (loading) return;

            try {
                setLoading(true);
                setError(null);

                const allGrades = [];

                // Với mỗi exam trong course, lấy attempts của sinh viên
                for (const schedule of courseExamSchedules) {
                    try {
                        const examId = schedule.examId._id;
                        const attemptsData = await getStudentAttemptsApi(examId, user._id);

                        if (attemptsData.success && attemptsData.data.length > 0) {
                            // Với mỗi attempt, lấy kết quả chi tiết
                            const examGrades = await Promise.all(
                                attemptsData.data.map(async (attempt) => {
                                    try {
                                        // Lấy kết quả chi tiết từ API
                                        const resultData = await getExamResultApi(examId, user._id, attempt.attempt);

                                        let correctAnswers = attempt.correctAnswers || 0;
                                        let totalQuestions = attempt.totalQuestions || 0;

                                        // Sử dụng dữ liệu từ resultData nếu có
                                        if (resultData?.success && resultData.data) {
                                            correctAnswers = resultData.data.correctAnswers || correctAnswers;
                                            totalQuestions = resultData.data.totalQuestions || totalQuestions;
                                        }

                                        return {
                                            id: attempt._id,
                                            examId: examId,
                                            examName: schedule.examId.name,
                                            attempt: attempt.attempt || 1,
                                            score: parseFloat(attempt.score || 0),
                                            maxScore: schedule.examId.maxScore || 10,
                                            percentage: attempt.score && schedule.examId.maxScore ?
                                                ((attempt.score / schedule.examId.maxScore) * 100).toFixed(1) : '0.0',
                                            submitTime: attempt.submitTime,
                                            startTime: attempt.startTime,
                                            endTime: attempt.endTime,
                                            status: attempt.status,
                                            correctAnswers: correctAnswers,
                                            totalQuestions: totalQuestions,
                                            duration: calculateDuration(attempt.startTime, attempt.submitTime)
                                        };
                                    } catch (resultError) {
                                        console.error(`Error fetching result for attempt ${attempt.attempt}:`, resultError);
                                        // Fallback với dữ liệu cơ bản
                                        return {
                                            id: attempt._id,
                                            examId: examId,
                                            examName: schedule.examId.name,
                                            attempt: attempt.attempt || 1,
                                            score: parseFloat(attempt.score || 0),
                                            maxScore: schedule.examId.maxScore || 10,
                                            percentage: attempt.score && schedule.examId.maxScore ?
                                                ((attempt.score / schedule.examId.maxScore) * 100).toFixed(1) : '0.0',
                                            submitTime: attempt.submitTime,
                                            startTime: attempt.startTime,
                                            endTime: attempt.endTime,
                                            status: attempt.status,
                                            correctAnswers: attempt.correctAnswers || 0,
                                            totalQuestions: attempt.totalQuestions || 0,
                                            duration: calculateDuration(attempt.startTime, attempt.submitTime)
                                        };
                                    }
                                })
                            );

                            allGrades.push(...examGrades);
                        }
                    } catch (examError) {
                        console.error(`Error fetching attempts for exam ${schedule.examId._id}:`, examError);
                    }
                }

                // Sắp xếp theo thời gian nộp bài (mới nhất trước)
                allGrades.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));

                setGrades(allGrades);

            } catch (err) {
                console.error('Error fetching grades:', err);
                const errorMessage = err.response?.data?.error || err.message || 'Lỗi khi tải điểm số';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        // Debounce để tránh calls liên tục
        const timeoutId = setTimeout(() => {
            fetchGrades();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [course?._id, user?._id, courseExamSchedules, schedulesLoading]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        const duration = new Date(endTime) - new Date(startTime);
        const minutes = Math.floor(duration / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleGradeClick = (grade) => {
        navigate(`/student/dashboard/my-courses/${course._id}/quizzes/${grade.examId}/review`);
    };

    const getGradeStatus = (percentage) => {
        const percent = parseFloat(percentage);
        if (percent >= 80) return 'excellent';
        if (percent >= 60) return 'good';
        if (percent >= 40) return 'average';
        return 'poor';
    };

    // Tính toán thống kê
    const getStatistics = () => {
        if (grades.length === 0) {
            return {
                totalAttempts: 0,
                uniqueExams: 0,
                averagePercentage: 0,
                totalScore: 0,
                maxPossibleScore: 0
            };
        }

        const totalAttempts = grades.length;
        const uniqueExams = new Set(grades.map(g => g.examId)).size;
        const averagePercentage = grades.reduce((sum, grade) =>
            sum + parseFloat(grade.percentage), 0
        ) / totalAttempts;
        const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
        const maxPossibleScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);

        return {
            totalAttempts,
            uniqueExams,
            averagePercentage: averagePercentage.toFixed(1),
            totalScore: totalScore.toFixed(2),
            maxPossibleScore
        };
    };

    const stats = getStatistics();

    // Loading state
    if (schedulesLoading || loading || fetchingCourse) {
        return (
            <div className="cdg-tab-content">
                {/* Breadcrumb cho standalone mode */}
                {isStandaloneMode && (
                    <div className="standalone-breadcrumb">
                        <button
                            onClick={() => navigate('/student/dashboard/score')}
                            className="back-to-scores-btn"
                        >
                            ← Quay lại danh sách điểm
                        </button>
                    </div>
                )}

                <h3 className="cdg-tab-title">📊 Điểm số của bạn</h3>
                <div className="cdg-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải điểm số...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="cdg-tab-content">
                {/* Breadcrumb cho standalone mode */}
                {isStandaloneMode && (
                    <div className="standalone-breadcrumb">
                        <button
                            onClick={() => navigate('/student/dashboard/score')}
                            className="back-to-scores-btn"
                        >
                            ← Quay lại danh sách điểm
                        </button>
                    </div>
                )}

                <h3 className="cdg-tab-title">📊 Điểm số của bạn</h3>
                <div className="cdg-error">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Thử lại
                        </button>
                        {/* Nút quay lại cho standalone mode */}
                        {isStandaloneMode && (
                            <button
                                onClick={() => navigate('/student/dashboard/score')}
                                className="back-btn"
                            >
                                Quay lại danh sách
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // No course data
    if (!course) {
        return (
            <div className="cdg-tab-content">
                {/* Breadcrumb cho standalone mode */}
                {isStandaloneMode && (
                    <div className="standalone-breadcrumb">
                        <button
                            onClick={() => navigate('/student/dashboard/score')}
                            className="back-to-scores-btn"
                        >
                            ← Quay lại danh sách điểm
                        </button>
                    </div>
                )}

                <h3 className="cdg-tab-title">📊 Điểm số của bạn</h3>
                <div className="cdg-error">
                    <div className="error-icon">📋</div>
                    <p>Không tìm thấy thông tin lớp học.</p>
                    <button
                        onClick={() => navigate('/student/dashboard/score')}
                        className="back-btn"
                    >
                        Quay lại danh sách điểm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cdg-tab-content">
            {/* Breadcrumb cho standalone mode */}
            {isStandaloneMode && (
                <div className="standalone-breadcrumb">
                    <button
                        onClick={() => navigate('/student/dashboard/score')}
                        className="back-to-scores-btn"
                    >
                        ← Quay lại danh sách điểm
                    </button>
                </div>
            )}

            <h3 className="cdg-tab-title">📊 Điểm số của bạn - {course.name}</h3>

            {/* Thống kê tổng quan */}
            <div className="cdg-summary">
                <div className="summary-card">
                    <div className="summary-icon">📝</div>
                    <div className="summary-content">
                        <span className="summary-label">Tổng số lần thi</span>
                        <span className="summary-value">{stats.totalAttempts}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📚</div>
                    <div className="summary-content">
                        <span className="summary-label">Số bài thi khác nhau</span>
                        <span className="summary-value">{stats.uniqueExams}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📈</div>
                    <div className="summary-content">
                        <span className="summary-label">Điểm trung bình</span>
                        <span className="summary-value">{stats.averagePercentage}%</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🏆</div>
                    <div className="summary-content">
                        <span className="summary-label">Tổng điểm</span>
                        <span className="summary-value">{stats.totalScore}/{stats.maxPossibleScore}</span>
                    </div>
                </div>
            </div>

            {/* Bảng điểm chi tiết */}
            <div className="cdg-grades-table-wrapper">
                {grades.length > 0 ? (
                    <table className="cdg-grades-table">
                        <thead>
                            <tr>
                                <th className="cdg-grades-th">Tên bài thi</th>
                                <th className="cdg-grades-th">Lần thi</th>
                                <th className="cdg-grades-th">Điểm số</th>
                                <th className="cdg-grades-th">Tỷ lệ (%)</th>
                                <th className="cdg-grades-th">Số câu đúng</th>
                                <th className="cdg-grades-th">Thời gian làm</th>
                                <th className="cdg-grades-th">Ngày nộp</th>
                                <th className="cdg-grades-th">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map(grade => (
                                <tr key={`${grade.examId}-${grade.attempt}`} className="cdg-grades-row">
                                    <td className="cdg-grades-td exam-name">
                                        <div className="exam-name-cell">
                                            <span className="exam-title">{grade.examName}</span>
                                        </div>
                                    </td>
                                    <td className="cdg-grades-td attempt">
                                        <span className="attempt-badge">Lần {grade.attempt}</span>
                                    </td>
                                    <td className="cdg-grades-td score">
                                        <div className="score-cell">
                                            <span className={`score-value ${getGradeStatus(grade.percentage)}`}>
                                                {grade.score.toFixed(2)}
                                            </span>
                                            <span className="max-score">/{grade.maxScore}</span>
                                        </div>
                                    </td>
                                    <td className="cdg-grades-td percent">
                                        <span className={`percentage ${getGradeStatus(grade.percentage)}`}>
                                            {grade.percentage}%
                                        </span>
                                    </td>
                                    <td className="cdg-grades-td correct-answers">
                                        <span className="correct-count">
                                            {grade.correctAnswers}/{grade.totalQuestions}
                                        </span>
                                    </td>
                                    <td className="cdg-grades-td duration">
                                        <span className="duration-value">
                                            {calculateDuration(grade.startTime, grade.submitTime)}
                                        </span>
                                    </td>
                                    <td className="cdg-grades-td submit-time">
                                        <span className="submit-time-value">
                                            {formatDateTime(grade.submitTime)}
                                        </span>
                                    </td>
                                    <td className="cdg-grades-td actions">
                                        <button
                                            className="view-detail-btn"
                                            onClick={() => handleGradeClick(grade)}
                                            title="Xem chi tiết kết quả thi"
                                        >
                                            <span className="btn-icon">👁️</span>
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="cdg-empty-state">
                        <div className="empty-icon">📋</div>
                        <h4>Chưa có điểm số nào</h4>
                        <p>Bạn chưa hoàn thành bài kiểm tra nào trong khóa học này.</p>
                        <button
                            onClick={() => navigate(`/student/dashboard/my-courses/${course._id}/quizzes`)}
                            className="go-to-quizzes-btn"
                        >
                            Đi đến bài kiểm tra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseGrades;