import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getExamInstanceStatusApi } from '../../../service/api/apiExam';
import { useAppStore } from '../../../store/appStore';
import './styles/QuizDetailPage.css';
import Breadcrumb from '../../../components/layout/Breadcrumb/Breadcrumb';
import { toast } from 'react-toastify';

const QuizDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseId, quizId } = useParams();
    const { user } = useAppStore();

    const [examStatus, setExamStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    let quiz = location.state?.quiz;

    useEffect(() => {
        const fetchExamStatus = async () => {
            if (!user?._id || !quizId) {
                setLoading(false);
                return;
            }

            try {
                const response = await getExamInstanceStatusApi(quizId, user._id);
                if (response.success) {
                    setExamStatus(response.data);
                }
            } catch (error) {
                console.error('Error fetching exam status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamStatus();
    }, [quizId, user]);

    if (!quiz) {
        return <div className="quiz-detail-empty">Không tìm thấy thông tin bài kiểm tra.</div>;
    }

    // Kiểm tra các trạng thái
    const attemptLimit = quiz.attemptLimit || 1;
    const completedAttempts = examStatus?.completedAttempts || 0;
    const canTakeExam = completedAttempts < attemptLimit;
    const hasCompleted = examStatus?.hasCompleted || false;
    const inProgress = examStatus?.inProgress || false;
    // Kiểm tra thời gian
    const getExamTimeStatus = () => {
        if (!quiz.startTime || !quiz.endTime) return { status: 'unknown' };

        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(quiz.endTime);

        if (now < startTime) {
            return { status: 'not_started', message: 'Chưa đến thời gian thi' };
        } else if (now > endTime) {
            return { status: 'ended', message: 'Đã hết thời gian thi' };
        } else {
            return { status: 'active', message: 'Đang trong thời gian thi' };
        }
    };
    // Xử lý action buttons
    const handleTakeExam = () => {
        const timeStatus = getExamTimeStatus();

        if (timeStatus.status === 'not_started') {
            toast.error('Bài thi chưa bắt đầu!');
            return;
        }

        if (timeStatus.status === 'ended') {
            toast.error('Bài thi đã kết thúc!');
            return;
        }
        // Truyền thông tin lịch thi qua state
        const navigationState = {
            startTime: quiz.startTime,
            endTime: quiz.endTime,
            currentStatus: quiz.currentStatus
        };
        if (inProgress) {
            navigate(`take`, { state: navigationState });
        } else if (canTakeExam) {
            navigate(`take`, { state: navigationState });
        } else {
            toast.error('Bạn đã hết lượt làm bài thi này');
        }
    };

    const handleViewResult = () => {
        navigate(`review`);
    };

    // Render action buttons
    const renderActionButtons = () => {
        if (loading) {
            return <div className="quiz-detail-loading">Đang tải trạng thái...</div>;
        }

        if (inProgress) {
            return (
                <div className="quiz-detail-actions">
                    <button className="quiz-detail-action continue" onClick={handleTakeExam}>
                        🔄 Tiếp tục làm bài
                    </button>
                    <button className="quiz-detail-back" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            );
        }

        if (hasCompleted && !canTakeExam) {
            return (
                <div className="quiz-detail-actions">
                    <button className="quiz-detail-action review" onClick={handleViewResult}>
                        📊 Xem chi tiết đáp án
                    </button>
                    <button className="quiz-detail-back" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            );
        }

        if (canTakeExam) {
            const actionText = hasCompleted ? 'Làm lại bài thi' : 'Bắt đầu làm bài';
            return (
                <div className="quiz-detail-actions">
                    <button className="quiz-detail-action" onClick={handleTakeExam}>
                        📝 {actionText}
                    </button>
                    {hasCompleted && (
                        <button className="quiz-detail-action review" onClick={handleViewResult}>
                            📊 Xem kết quả trước đó
                        </button>
                    )}
                    <button className="quiz-detail-back" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            );
        }

        return (
            <div className="quiz-detail-actions">
                <button className="quiz-detail-action disabled" disabled>
                    ❌ Hết lượt làm bài
                </button>
                <button className="quiz-detail-action review" onClick={handleViewResult}>
                    📊 Xem chi tiết đáp án
                </button>
                <button className="quiz-detail-back" onClick={() => navigate(-1)}>
                    Quay lại
                </button>
            </div>
        );
    };

    return (
        <div className="quiz-detail-container">
            <Breadcrumb
                items={[
                    { label: 'Bài kiểm tra', link: `/student/dashboard/my-courses/${courseId}/quizzes` },
                    { label: 'Chi tiết bài kiểm tra' }
                ]}
            />

            <h2 className="quiz-detail-title">{quiz.title}</h2>

            <div className="quiz-detail-info">
                <p><strong>Loại:</strong> {quiz.type}</p>
                <p><strong>Hạn chót:</strong> {quiz.dueDate}</p>
                <p><strong>Số câu hỏi:</strong> {quiz.questionCount || 'N/A'}</p>
                <p><strong>Thời gian làm bài:</strong> {quiz.duration || 'N/A'} phút</p>
                <p><strong>Số lần làm bài cho phép:</strong> {attemptLimit}</p>
                <p><strong>Đã làm:</strong> {completedAttempts} / {attemptLimit} lần</p>
                <p><strong>Trạng thái:</strong>
                    {loading ? ' Đang tải...' :
                        inProgress ? ' 🔄 Đang làm bài' :
                            hasCompleted ? ' ✅ Đã hoàn thành' :
                                canTakeExam ? ' 📝 Có thể làm bài' : ' ❌ Hết lượt làm bài'}
                </p>
            </div>

            {/* Status warning */}
            {!loading && !canTakeExam && !inProgress && (
                <div className="quiz-detail-warning">
                    ⚠️ Bạn đã sử dụng hết số lần làm bài cho phép. Chỉ có thể xem lại kết quả.
                </div>
            )}

            {renderActionButtons()}
        </div>
    );
};

export default QuizDetailPage;