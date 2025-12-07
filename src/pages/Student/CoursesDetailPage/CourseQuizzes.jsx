import React, { useState, useEffect } from 'react';
import { useCourseContext } from '../../../context/CourseContext';
import { useNavigate } from 'react-router-dom';
import { getExamInstanceStatusApi } from '../../../service/api/apiExam';
import { useAppStore } from '../../../store/appStore';
import './styles/CourseQuizzes.css';
import { useMemo } from 'react';
import { useMyExamSchedules } from '../../../hooks/useExamSchedules';

const CourseQuizzes = () => {
    const { course } = useCourseContext();
    const { examSchedules } = useMyExamSchedules();
    const { user } = useAppStore();
    const navigate = useNavigate();

    // State để lưu trạng thái exam instances
    const [examStatuses, setExamStatuses] = useState({});
    const [loading, setLoading] = useState(true);

    // Lọc lịch thi của lớp hiện tại
    const quizzes = useMemo(() => {
        if (!course || !examSchedules) return [];
        return examSchedules.filter(sch => sch.classId._id === course._id);
    }, [course, examSchedules]);

    // Fetch exam statuses for all quizzes
    useEffect(() => {
        const fetchExamStatuses = async () => {
            if (!user?._id || quizzes.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const statusPromises = quizzes.map(async (quiz) => {
                    try {
                        const response = await getExamInstanceStatusApi(quiz.examId._id, user._id);
                        return {
                            examId: quiz.examId._id,
                            status: response.success ? response.data : null
                        };
                    } catch (error) {
                        console.error(`Error fetching status for exam ${quiz.examId._id}:`, error);
                        return {
                            examId: quiz.examId._id,
                            status: null
                        };
                    }
                });

                const results = await Promise.all(statusPromises);
                const statusMap = {};
                results.forEach(result => {
                    statusMap[result.examId] = result.status;
                });

                setExamStatuses(statusMap);
            } catch (error) {
                console.error('Error fetching exam statuses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamStatuses();
    }, [quizzes, user]);

    // 🔥 THÊM: Kiểm tra thời gian làm bài
    const getExamTimeStatus = (quiz) => {
        // Sử dụng currentStatus từ backend trước
        const backendStatus = quiz.currentStatus; // Virtual field từ backend
        // Nếu backend trả về cancelled thì ưu tiên
        if (backendStatus === 'cancelled') {
            return {
                status: 'cancelled',
                message: 'Bài thi đã bị hủy',
                timeLeft: 0
            };
        }

        // Tính toán chi tiết hơn ở frontend
        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);


        if (now < startTime) {
            return {
                status: 'scheduled', // Giống backend
                message: 'Chưa đến thời gian thi',
                timeLeft: startTime - now,
                backendStatus: backendStatus
            };
        } else if (now > endTime) {
            return {
                status: 'completed', // Giống backend
                message: 'Đã hết thời gian thi',
                timeLeft: 0,
                backendStatus: backendStatus
            };
        } else {
            return {
                status: 'in_progress', // Giống backend
                message: 'Đang trong thời gian thi',
                timeLeft: endTime - now,
                backendStatus: backendStatus
            };
        }
    };

    // 🔥 SỬA: Kiểm tra xem có thể làm bài không (bao gồm thời gian)
    const canTakeExam = (quiz) => {
        const timeStatus = getExamTimeStatus(quiz);

        // Kiểm tra trạng thái từ backend trước
        if (timeStatus.backendStatus === 'cancelled') {
            return false;
        }
        // Nếu chưa đến thời gian hoặc đã hết thời gian -> không thể làm bài
        if (timeStatus.status !== 'in_progress') {
            return false;
        }

        const examStatus = examStatuses[quiz.examId._id];
        const attemptLimit = quiz.examId.attemptLimit || 1;

        if (!examStatus) {
            // Chưa có exam instance nào -> có thể làm bài (nếu đúng thời gian)
            return true;
        }

        // Kiểm tra số lần đã làm
        const completedAttempts = examStatus.completedAttempts || 0;
        return completedAttempts < attemptLimit;
    };

    // Kiểm tra xem đã hoàn thành bài thi chưa
    const hasCompletedExam = (quiz) => {
        const examStatus = examStatuses[quiz.examId._id];
        return examStatus && examStatus.hasCompleted;
    };

    // 🔥 SỬA: Kiểm tra có bài thi đang làm dở không (bao gồm thời gian)
    const hasInProgressExam = (quiz) => {
        const timeStatus = getExamTimeStatus(quiz);

        // Nếu đã hết thời gian thi -> không còn in progress
        if (timeStatus.status === 'ended') {
            return false;
        }

        const examStatus = examStatuses[quiz.examId._id];
        return examStatus && examStatus.inProgress;
    };

    // 🔥 THÊM: Format thời gian còn lại
    const formatTimeRemaining = (timeLeft) => {
        if (timeLeft <= 0) return '';

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `còn ${hours}h ${minutes}m`;
        } else {
            return `còn ${minutes}m`;
        }
    };

    const handleQuizClick = (quiz) => {
        const examStatus = examStatuses[quiz.examId._id];
        const timeStatus = getExamTimeStatus(quiz);

        // 🔥 THÊM: Kiểm tra thời gian trước khi cho phép làm bài
        if (timeStatus.status === 'not_started') {
            alert(`Bài thi chưa bắt đầu. Thời gian bắt đầu: ${new Date(quiz.startTime).toLocaleString('vi-VN')}`);
            return;
        }

        if (timeStatus.status === 'ended') {
            // Nếu đã hết thời gian và có kết quả -> cho xem review
            if (hasCompletedExam(quiz)) {
                navigate(`${quiz.examId._id}/review`);
                return;
            } else {
                alert('Bài thi đã kết thúc và bạn chưa hoàn thành bài thi.');
                return;
            }
        }

        // Nếu đã hoàn thành và hết lượt làm -> chuyển đến review
        if (hasCompletedExam(quiz) && !canTakeExam(quiz)) {
            navigate(`${quiz.examId._id}/review`);
            return;
        }

        // Nếu có bài đang làm dở và còn thời gian -> tiếp tục làm
        if (hasInProgressExam(quiz)) {
            navigate(`${quiz.examId._id}/take`, {
                state: {
                    startTime: quiz.startTime,
                    endTime: quiz.endTime,
                    currentStatus: quiz.currentStatus
                }
            });
            return;
        }

        // Ngược lại -> xem chi tiết để quyết định làm bài
        navigate(`${quiz.examId._id}`, {
            state: {
                quiz: {
                    _id: quiz.examId._id,
                    title: quiz.examId.name,
                    type: "Exam",
                    dueDate: new Date(quiz.endTime).toLocaleString('vi-VN'),
                    questionCount: quiz.examId.questionCount,
                    duration: quiz.examId.duration,
                    status: quiz.status,
                    attemptLimit: quiz.examId.attemptLimit,
                    canTake: canTakeExam(quiz),
                    hasCompleted: hasCompletedExam(quiz),
                    inProgress: hasInProgressExam(quiz),
                    examStatus: examStatus,
                    // 🔥 THÊM: Thông tin thời gian
                    startTime: quiz.startTime,
                    endTime: quiz.endTime,
                    timeStatus: timeStatus,
                    currentStatus: quiz.currentStatus, // Trạng thái tổng quát từ backend

                }
            }
        });
    };

    // 🔥 SỬA: Render trạng thái và button action (bao gồm thời gian)
    const renderQuizAction = (quiz) => {
        if (loading) {
            return <span className="cdq-quiz-loading">Đang tải...</span>;
        }

        const timeStatus = getExamTimeStatus(quiz);
        const examStatus = examStatuses[quiz.examId._id];
        const canTake = canTakeExam(quiz);
        const hasCompleted = hasCompletedExam(quiz);
        const inProgress = hasInProgressExam(quiz);
        // 🔥 THÊM: Xử lý trạng thái cancelled từ backend
        if (timeStatus.status === 'cancelled') {
            return (
                <div className="cdq-quiz-action">
                    <span className="cdq-quiz-cancelled">❌ Bài thi đã bị hủy</span>
                    <button className="cdq-action-button disabled" disabled>
                        Đã hủy
                    </button>
                </div>
            );
        }

        // 🔥 Kiểm tra thời gian trước
        if (timeStatus.status === 'scheduled') { // backend: scheduled
            return (
                <div className="cdq-quiz-action">
                    <span className="cdq-quiz-not-started">⏳ Chưa bắt đầu</span>
                    <span className="cdq-time-remaining">
                        {formatTimeRemaining(timeStatus.timeLeft)}
                    </span>
                    <button className="cdq-action-button disabled" disabled>
                        Chưa thể làm
                    </button>
                </div>
            );
        }

        if (timeStatus.status === 'completed') { // backend: completed
            if (hasCompleted) {
                return (
                    <div className="cdq-quiz-action">
                        <span className="cdq-quiz-ended">⏰ Đã kết thúc</span>
                        <button className="cdq-action-button review" onClick={() => handleQuizClick(quiz)}>
                            Xem kết quả
                        </button>
                    </div>
                );
            } else {
                return (
                    <div className="cdq-quiz-action">
                        <span className="cdq-quiz-ended">⏰ Đã kết thúc</span>
                        <span className="cdq-quiz-missed">Chưa hoàn thành</span>
                    </div>
                );
            }
        }

        // Trong thời gian thi
        if (hasCompleted && !canTake) {
            return (
                <div className="cdq-quiz-action">
                    <span className="cdq-quiz-completed">✅ Đã hoàn thành</span>
                    <span className="cdq-time-remaining">
                        {formatTimeRemaining(timeStatus.timeLeft)}
                    </span>
                    <button className="cdq-action-button review" onClick={() => handleQuizClick(quiz)}>
                        Xem chi tiết
                    </button>
                </div>
            );
        }

        if (inProgress) {
            return (
                <div className="cdq-quiz-action">
                    <span className="cdq-quiz-ongoing">🔄 Đang làm bài</span>
                    <span className="cdq-time-remaining urgent">
                        ⚡ {formatTimeRemaining(timeStatus.timeLeft)}
                    </span>
                    <button className="cdq-action-button continue" onClick={() => handleQuizClick(quiz)}>
                        Tiếp tục
                    </button>
                </div>
            );
        }

        if (canTake) {
            return (
                <div className="cdq-quiz-action">
                    <span className="cdq-quiz-pending">📝 Có thể làm bài</span>
                    <span className="cdq-time-remaining">
                        {formatTimeRemaining(timeStatus.timeLeft)}
                    </span>
                    <button className="cdq-action-button" onClick={() => handleQuizClick(quiz)}>
                        Chi tiết
                    </button>
                </div>
            );
        }

        return (
            <div className="cdq-quiz-action">
                <span className="cdq-quiz-disabled">❌ Hết lượt làm bài</span>
                <span className="cdq-time-remaining">
                    {formatTimeRemaining(timeStatus.timeLeft)}
                </span>
                <button className="cdq-action-button disabled" disabled>
                    Không thể làm
                </button>
            </div>
        );
    };

    if (!course) return <p className="cdq-empty">Không có dữ liệu lớp học.</p>;
    if (quizzes.length === 0) return <p className="cdq-empty">Không có lịch thi cho lớp này.</p>;

    return (
        <div className="cdq-tab-content">
            <h3 className="cdq-tab-title">Bài kiểm tra</h3>
            <div className="cdq-quiz-list">
                {quizzes.map(quiz => {
                    const timeStatus = getExamTimeStatus(quiz);

                    return (
                        <div key={quiz._id} className="cdq-quiz-item">
                            <div className="cdq-quiz-info">
                                <span className="cdq-quiz-type quiz">Exam</span>
                                <p className="cdq-quiz-title"
                                    style={{ cursor: 'pointer', color: '#ff6600', textDecoration: 'underline' }}
                                    onClick={() => handleQuizClick(quiz)}>
                                    {quiz.examId.name}
                                </p>
                                {/* 🔥 SỬA: Hiển thị thời gian bắt đầu và kết thúc */}
                                <p className="cdq-quiz-time">
                                    <strong>Thời gian thi:</strong> {new Date(quiz.startTime).toLocaleString('vi-VN')}
                                    <span> → </span>
                                    {new Date(quiz.endTime).toLocaleString('vi-VN')}
                                </p>
                                <p className="cdq-quiz-due">
                                    <strong>Trạng thái:</strong>
                                    <span className={`time-status ${timeStatus.status}`}>
                                        {timeStatus.message}
                                    </span>
                                </p>
                                <p className="cdq-quiz-attempts">
                                    Số lần làm bài: {examStatuses[quiz.examId._id]?.completedAttempts || 0} / {quiz.examId.attemptLimit || 1}
                                </p>
                            </div>
                            <div className="cdq-quiz-status">
                                {renderQuizAction(quiz)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseQuizzes;