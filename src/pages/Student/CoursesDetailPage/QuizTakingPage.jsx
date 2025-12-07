import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    getExamByIdApi,
    generateExamQuestionsApi,
    startExamApi,
    submitAnswerApi,
    submitExamApi
} from '../../../service/api/apiExam';
import { useAppStore } from '../../../store/appStore';
import './styles/QuizTakingPage.css';
import Breadcrumb from '../../../components/layout/Breadcrumb/Breadcrumb';
import { toast } from 'react-toastify';
// import DebugApi from '../../../components/DebugApi';

const QuizTakingPage = () => {

    const location = useLocation();
    const scheduleInfo = location.state; // Thông tin từ CourseQuizzes
    // Lấy courseId và quizId từ URL
    const { quizId, courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAppStore();

    // States for exam data
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [examInstance, setExamInstance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States for quiz taking
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [examResult, setExamResult] = useState(null);

    // Thêm hàm tính thời gian dựa trên schedule
    const calculateRemainingTime = (exam, examInstance, scheduleInfo) => {
        const now = new Date();

        // Ưu tiên sử dụng thông tin schedule từ CourseQuizzes
        if (scheduleInfo?.endTime) {
            const scheduleEnd = new Date(scheduleInfo.endTime);
            const remaining = Math.max(0, scheduleEnd.getTime() - now.getTime());

            console.log('Using schedule end time:', scheduleEnd.toLocaleString('vi-VN'));
            console.log('Current time:', now.toLocaleString('vi-VN'));
            console.log('Remaining time (ms):', remaining);

            return remaining;
        }

        // Fallback: sử dụng duration như cũ
        if (examInstance && examInstance.startTime && exam) {
            const startTime = new Date(examInstance.startTime);
            const duration = exam.duration; // in minutes
            const endTime = new Date(startTime.getTime() + duration * 60000);
            const remaining = Math.max(0, endTime.getTime() - now.getTime());

            console.log('Using duration calculation:', remaining);
            return remaining;
        }

        return null;
    };

    // Fetch exam data and generate questions when component mounts
    useEffect(() => {
        const fetchExamData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!user?._id) {
                    setError('Vui lòng đăng nhập để làm bài thi');
                    return;
                }

                // Kiểm tra thời gian lịch thi từ navigation state
                if (scheduleInfo?.endTime) {
                    const now = new Date();
                    const scheduleEnd = new Date(scheduleInfo.endTime);

                    if (now > scheduleEnd) {
                        throw new Error('Đã hết thời gian thi');
                    }
                }

                // Get exam details
                const examData = await getExamByIdApi(quizId);
                if (!examData || (!examData.success && !examData._id)) {
                    throw new Error('Không thể lấy thông tin bài thi');
                }

                const exam = examData.success ? examData.data : examData;
                setExam(exam);

                // Generate exam questions for student
                const examInstanceData = await generateExamQuestionsApi(quizId, user._id);

                if (examInstanceData && examInstanceData.success && examInstanceData.data) {
                    setExamInstance(examInstanceData.data);

                    if (examInstanceData.data.questions) {
                        setQuestions(examInstanceData.data.questions);

                        // Load existing answers
                        if (examInstanceData.data.answers && Array.isArray(examInstanceData.data.answers)) {
                            const answerMap = {};
                            examInstanceData.data.answers.forEach(ans => {
                                answerMap[ans.questionId] = ans.answer;
                            });
                            setAnswers(answerMap);
                        }

                        // Check if exam is already started
                        if (examInstanceData.data.startTime) {
                            setExamStarted(true);
                            // Tính thời gian dựa trên schedule info
                            const remaining = calculateRemainingTime(exam, examInstanceData.data, scheduleInfo);
                            if (remaining !== null) {
                                setTimeRemaining(remaining);
                            }
                        }
                    }
                }

            } catch (err) {
                console.error('Error fetching exam data:', err);
                let errorMessage = 'Không thể tải thông tin bài thi';

                if (err.response) {
                    errorMessage = err.response.data?.error || err.response.data?.message || `Lỗi server: ${err.response.status}`;
                } else if (err.request) {
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [quizId, user, scheduleInfo]);

    // Start exam
    const handleStartExam = async () => {
        try {
            if (!user?._id) {
                toast.error('Vui lòng đăng nhập để bắt đầu làm bài');
                return;
            }

            const response = await startExamApi(quizId, user._id);

            if (response && response.success) {
                setExamStarted(true);
                setExamInstance(response.data);

                // Tính thời gian ngay lập tức sau khi start
                const remaining = calculateRemainingTime(exam, response.data, scheduleInfo);
                if (remaining !== null) {
                    setTimeRemaining(remaining);
                } else {
                    // Fallback cuối cùng
                    const duration = exam.duration * 60000;
                    setTimeRemaining(duration);
                }

                toast.success('Đã bắt đầu làm bài thi!');
            } else {
                toast.error('Không thể bắt đầu làm bài thi');
            }
        } catch (err) {
            console.error('Error starting exam:', err);
            toast.error('Lỗi khi bắt đầu làm bài thi');
        }
    };

    // Timer effect
    useEffect(() => {
        if (!examStarted || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1000) {
                    // Auto submit when time runs out
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeRemaining]);

    // Format time remaining
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Auto submit when time runs out
    const handleAutoSubmit = async () => {
        try {
            toast.warning('Hết thời gian! Bài thi sẽ được nộp tự động.');

            // Gọi handleSubmitExam để hiện modal kết quả
            await handleSubmitExam();

            // Sau khi modal hiện ra, tự động navigate sau 5 giây
            setTimeout(() => {
                navigate(`/student/dashboard/my-courses/${courseId}/quizzes`);
            }, 5000);

        } catch (error) {
            console.error('Error in auto submit:', error);

            // Nếu có lỗi, vẫn navigate về trang quizzes
            setTimeout(() => {
                navigate(`/student/dashboard/my-courses/${courseId}/quizzes`);
            }, 2000);
        }
    };

    // Handle loading and error states
    if (loading) {
        return (
            <div className="quiz-take-main">
                {/* Debug component - remove in production */}
                {/* <DebugApi examId={quizId} /> */}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '18px',
                    color: '#666'
                }}>
                    Đang tải bài thi...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-take-main">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '18px',
                    color: '#e53e3e'
                }}>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            backgroundColor: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return <div className="quiz-take-empty">Không tìm thấy đề thi hoặc câu hỏi.</div>;
    }

    // If exam hasn't started yet, show start button
    if (!examStarted) {
        return (
            <div className="quiz-take-main">
                <Breadcrumb
                    items={[
                        { label: 'Bài kiểm tra', link: `/student/dashboard/my-courses/${courseId}/quizzes` },
                        { label: 'Chi tiết bài kiểm tra', onClick: () => navigate(`/student/dashboard/my-courses/${courseId}/quizzes/${quizId}`) },
                        { label: 'Làm bài' }
                    ]}
                />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '400px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    margin: '20px',
                    padding: '40px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: '16px', color: '#2d3748' }}>{exam.name}</h2>

                    <div style={{ marginBottom: '24px', textAlign: 'center', color: '#4a5568' }}>
                        <p><strong>Số câu hỏi:</strong> {questions.length}</p>
                        <p><strong>Thời gian:</strong> {exam.duration} phút</p>
                        <p><strong>Loại bài thi:</strong> {exam.examType}</p>
                    </div>

                    <button
                        onClick={handleStartExam}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2c5aa0'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3182ce'}
                    >
                        Bắt đầu làm bài
                    </button>
                </div>
            </div>
        );
    }

    const handleSelectAnswer = async (questionId, answerValue) => {
        try {
            // Update local state immediately for better UX
            setAnswers(prev => ({ ...prev, [questionId]: answerValue }));

            // Submit answer to server
            const response = await submitAnswerApi(quizId, user._id, questionId, answerValue);

            // Check if submission was successful
            if (!response || !response.success) {
                console.warn('Answer submission may have failed:', response);
            }

        } catch (err) {
            console.error('Error submitting answer:', err);
            toast.error('Không thể lưu câu trả lời');

            // Revert local state if API fails
            setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[questionId];
                return newAnswers;
            });
        }
    };

    const handleSubmitExam = async () => {
        try {
            const response = await submitExamApi(quizId, user._id);

            if (response && response.success) {
                setExamResult(response.data);
                setShowConfirm(false);
                setShowSuccess(true);
                toast.success('Nộp bài thành công!');
            } else {
                const errorMessage = response?.error || response?.message || 'Không thể nộp bài thi';
                toast.error(errorMessage);
                console.error('Submit exam API response:', response);
            }
        } catch (err) {
            console.error('Error submitting exam:', err);

            let errorMessage = 'Không thể nộp bài thi';

            if (err.response) {
                errorMessage = err.response.data?.error || err.response.data?.message || `Lỗi server: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'Lỗi kết nối mạng';
            } else {
                errorMessage = err.message || 'Lỗi không xác định';
            }

            toast.error(errorMessage);
        }
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
    };
    const handlePrev = () => {
        if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
    };

    // tính điểm mỗi câu cho sinh viên biết
    const getPointsPerQuestion = () => {
        if (!exam || !questions || questions.length === 0) {
            return '1.00';
        }

        // Nếu backend đã trả về points cho câu hỏi hiện tại
        if (questions[currentIdx]?.points) {
            return questions[currentIdx].points.toFixed(2);
        }

        // Tính chia đều từ maxScore
        const maxScore = exam.maxScore || 10;
        const totalQuestions = questions.length;
        const pointsPerQuestion = maxScore / totalQuestions;

        return pointsPerQuestion.toFixed(2);
    };



    return (
        <div className="quiz-take-main">
            {/* Debug component - remove in production */}
            {/* <DebugApi examId={quizId} /> */}

            <Breadcrumb
                items={[
                    { label: 'Bài kiểm tra', link: `/student/dashboard/my-courses/${courseId}/quizzes` },
                    { label: 'Chi tiết bài kiểm tra', onClick: () => navigate(`/student/dashboard/my-courses/${courseId}/quizzes/${quizId}`, { state: { quiz: exam } }) },
                    { label: 'Làm bài' }
                ]}
            />


            {/* Modal xác nhận nộp bài */}
            {showConfirm && (
                <div className="quiz-modal-overlay">
                    <div className="quiz-modal">
                        <h3>Bạn có chắc chắn muốn nộp bài?</h3>
                        <div className="quiz-modal-actions">
                            <button className="quiz-modal-btn" onClick={handleSubmitExam}>Xác nhận</button>
                            <button className="quiz-modal-btn cancel" onClick={() => setShowConfirm(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal thông báo nộp bài thành công */}
            {showSuccess && (
                <div className="quiz-modal-overlay">
                    <div className="quiz-modal">
                        {/* Pháo hoa SVG đơn giản */}
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <svg width="80" height="80" viewBox="0 0 80 80">
                                <g>
                                    <circle cx="40" cy="40" r="8" fill="#FFD700" />
                                    <line x1="40" y1="10" x2="40" y2="30" stroke="#FF6347" strokeWidth="3" />
                                    <line x1="40" y1="50" x2="40" y2="70" stroke="#00BFFF" strokeWidth="3" />
                                    <line x1="10" y1="40" x2="30" y2="40" stroke="#32CD32" strokeWidth="3" />
                                    <line x1="50" y1="40" x2="70" y2="40" stroke="#FF69B4" strokeWidth="3" />
                                    <line x1="20" y1="20" x2="32" y2="32" stroke="#FFD700" strokeWidth="3" />
                                    <line x1="60" y1="20" x2="48" y2="32" stroke="#FFD700" strokeWidth="3" />
                                    <line x1="20" y1="60" x2="32" y2="48" stroke="#FFD700" strokeWidth="3" />
                                    <line x1="60" y1="60" x2="48" y2="48" stroke="#FFD700" strokeWidth="3" />
                                </g>
                            </svg>
                        </div>
                        <h2 style={{ color: '#FF9800', textAlign: 'center', marginBottom: 8 }}>🎉 Bạn đã nộp bài thành công! 🎉</h2>
                        {/* Hiển thị kết quả từ API hoặc tính toán local */}
                        {(() => {
                            if (examResult) {
                                // Sử dụng kết quả từ API
                                return (
                                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                        <div style={{ fontSize: 18, margin: '8px 0' }}>
                                            <strong>Số câu đúng:</strong> {examResult.correctAnswers || 0} / {examResult.totalQuestions || questions.length}
                                        </div>
                                        <div style={{ fontSize: 18, margin: '8px 0' }}>
                                            <strong>Điểm số:</strong> {examResult.score || 0}
                                        </div>
                                        <div style={{ fontSize: 16, margin: '8px 0', color: '#666' }}>
                                            <strong>Tỷ lệ:</strong> {((examResult.correctAnswers || 0) / (examResult.totalQuestions || questions.length) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            } else {
                                // Tính toán local nếu chưa có kết quả từ API
                                let correctCount = 0;
                                questions.forEach(q => {
                                    const selectedIdx = answers[q._id];
                                    if (selectedIdx !== undefined && q.options[selectedIdx]?.isCorrect) correctCount++;
                                });
                                const total = questions.length;
                                const score = correctCount;
                                return (
                                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                        <div style={{ fontSize: 18, margin: '8px 0' }}>
                                            <strong>Số câu đúng:</strong> {correctCount} / {total}
                                        </div>
                                        <div style={{ fontSize: 18, margin: '8px 0' }}>
                                            <strong>Điểm số:</strong> {score}
                                        </div>
                                        <div style={{ fontSize: 16, margin: '8px 0', color: '#666' }}>
                                            <strong>Tỷ lệ:</strong> {(correctCount / total * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                        <div className="quiz-modal-actions" style={{ justifyContent: 'center', gap: '12px' }}>
                            <button className="quiz-modal-btn" onClick={() => navigate(`/student/dashboard/my-courses/${courseId}/quizzes`)}>Đóng</button>
                            <button
                                className="quiz-modal-btn"
                                onClick={() => navigate(`/student/dashboard/my-courses/${courseId}/quizzes/${quizId}/review`)}
                                style={{ backgroundColor: '#3182ce' }}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header quiz */}
            <div className="quiz-take-header">
                <div className="quiz-take-title">
                    <span className="quiz-take-icon">📝</span>
                    <span className="quiz-take-title-text">{exam.name}</span>
                </div>
                <div className="quiz-take-info">
                    <span>Mã đề: {exam._id}</span>
                    <span>Thời gian còn lại: <span style={{ color: 'red' }}>
                        {timeRemaining ? formatTime(timeRemaining) : '00:00:00'}
                    </span></span>
                </div>
            </div>
            <div className="quiz-take-container">
                <div className="quiz-take-left">
                    <div className="quiz-take-question-box">
                        <div className="quiz-take-question-meta">
                            <span className="quiz-take-question-number">Câu hỏi {currentIdx + 1}</span>
                            <span className="quiz-take-question-score">Đạt điểm {getPointsPerQuestion()}</span>
                        </div>
                        <div className="quiz-take-question-content">
                            {questions[currentIdx]?.content || 'No question content available'}
                        </div>
                        
                        {/* Hiển thị theo loại câu hỏi */}
                        {questions[currentIdx]?.questionType === 'fill_in_blank' || questions[currentIdx]?.type === 'fill_in_blank' ? (
                            // Câu hỏi điền từ
                            <div className="quiz-take-fill-blank">
                                <label className="fill-blank-label">Nhập câu trả lời của bạn:</label>
                                <textarea
                                    className="fill-blank-input"
                                    value={answers[questions[currentIdx]._id] || ''}
                                    onChange={(e) => handleSelectAnswer(questions[currentIdx]._id, e.target.value)}
                                    placeholder="Nhập câu trả lời..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        minHeight: '80px'
                                    }}
                                />
                                {answers[questions[currentIdx]._id] && (
                                    <div style={{ marginTop: '8px', color: '#059669', fontSize: '14px' }}>
                                        ✓ Câu trả lời đã được lưu
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Câu hỏi trắc nghiệm
                            <div className="quiz-take-options">
                                {questions[currentIdx]?.options && questions[currentIdx].options.length > 0 ? (
                                    questions[currentIdx].options.map((opt, idx) => (
                                        <label key={idx} className={`quiz-take-option-label${answers[questions[currentIdx]._id] === idx ? ' selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name={`answer-${questions[currentIdx]._id}`}
                                                checked={answers[questions[currentIdx]._id] === idx}
                                                onChange={() => handleSelectAnswer(questions[currentIdx]._id, idx)}
                                            />
                                            <span className="quiz-take-option-text">{String.fromCharCode(97 + idx)}. {opt.text || 'No option text'}</span>
                                        </label>
                                    ))
                                ) : (
                                    <div style={{ color: 'red', padding: '10px' }}>
                                        No options available for this question
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="quiz-take-question-actions">
                            <button className="quiz-take-nav-btn" onClick={handlePrev} disabled={currentIdx === 0}>Quay lại</button>
                            <button className="quiz-take-nav-btn" onClick={handleNext} disabled={currentIdx === questions.length - 1}>Trang tiếp</button>
                        </div>
                    </div>
                </div>
                <div className="quiz-take-right">
                    <div className="quiz-take-user">
                        <div className="quiz-take-avatar">
                            <img src={user?.avatar || '/default-avatar.png'} alt={user?.fullName || 'User'} />
                        </div>
                        <div className="quiz-take-username">{user?.fullName || 'Học sinh'}</div>
                    </div>
                    <div className="quiz-take-question-list-box">
                        <div className="quiz-take-question-list-title">Bảng câu hỏi</div>
                        <div className="quiz-take-question-list">
                            {questions.map((q, idx) => (
                                <button
                                    key={q._id}
                                    className={`quiz-take-question-btn${currentIdx === idx ? ' active' : ''}${answers[q._id] !== undefined ? ' answered' : ''}`}
                                    onClick={() => setCurrentIdx(idx)}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <button className="quiz-take-submit-btn" onClick={() => setShowConfirm(true)}>Nộp bài</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTakingPage;