import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamResultApi, getExamByIdApi, getStudentAttemptsApi } from '../../../service/api/apiExam';
import { useAppStore } from '../../../store/appStore';
import Breadcrumb from '../../../components/layout/Breadcrumb/Breadcrumb';
import { toast } from 'react-toastify';
import './styles/ExamReviewPage.css';

const ExamReviewPage = () => {
    const { quizId, courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAppStore();

    const [examResult, setExamResult] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!user?._id || !quizId) return;
            try {
                const attemptsData = await getStudentAttemptsApi(quizId, user._id);
                if (attemptsData.success) {
                    setAttempts(attemptsData.data);
                    if (attemptsData.data.length > 0) {
                        const latestAttempt = Math.max(...attemptsData.data.map(a => a.attempt));
                        setSelectedAttempt(latestAttempt);
                    }
                }
            } catch (error) {
                console.error('Error fetching attempts:', error);
            }
        };
        fetchAttempts();
    }, [quizId, user]);

    useEffect(() => {
        const fetchExamReview = async () => {
            if (!user?._id || !quizId || selectedAttempt === null) return;
            try {
                setLoading(true);
                setError(null);
                const examData = await getExamByIdApi(quizId);
                const examInfo = examData.success ? examData.data : examData;
                setExam(examInfo);

                const resultData = await getExamResultApi(quizId, user._id, selectedAttempt);

                if (resultData && resultData.success) {
                    setExamResult(resultData.data);
                    if (resultData.data.questions) {
                        setQuestions(resultData.data.questions);
                    }
                } else {
                    throw new Error(resultData?.error || 'Không thể lấy kết quả thi');
                }

            } catch (err) {
                console.error('Error fetching exam review:', err);
                const errorMessage = err.response?.data?.error || err.message || 'Không thể tải kết quả thi';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchExamReview();
    }, [quizId, user, selectedAttempt]);



    // Robust extractor for various shapes of ObjectId returned from backend/API
    const extractId = (val) => {
        if (!val && val !== 0) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        // common mongodb shape { $oid: '...' }
        if (val.$oid) return val.$oid;
        if (val['$oid']) return val['$oid'];
        // nested _id
        if (val._id) return extractId(val._id);
        // ObjectId string like ObjectId("...")
        if (typeof val.toString === 'function') {
            const s = val.toString();
            const m = s.match(/ObjectId\(\"?([a-fA-F0-9]+)\"?\)/);
            if (m) return m[1];
            // fallback
            return s;
        }
        return '';
    };

    // Build a map of gradingDetails by questionId for fast & robust lookup
    const gradingMap = useMemo(() => {
        const map = new Map();
        const details = examResult?.gradingDetails || [];
        details.forEach(d => {
            if (!d) return;
            const qid = extractId(d.questionId ?? d.question ?? d.question?._id);
            if (qid) map.set(qid, d);
        });
        return map;
    }, [examResult]);

    // Derived totals if backend didn't include aggregated fields
    const derivedTotals = useMemo(() => {
        const details = examResult?.gradingDetails || [];
        let totalScore = 0;
        let correctCount = 0;
        const totalQuestions = questions?.length || details.length || 0;
        details.forEach(d => {
            const score = Number(d?.score ?? 0);
            totalScore += score;
            const isCorrect = (typeof d?.isCorrect === 'boolean') ? d.isCorrect : (score > 0);
            if (isCorrect) correctCount++;
        });
        totalScore = Math.round((totalScore + Number.EPSILON) * 100) / 100;
        return { totalScore, correctCount, totalQuestions };
    }, [examResult, questions]);


    // Format helpers
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };
    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        const duration = new Date(endTime) - new Date(startTime);
        const minutes = Math.floor(duration / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Find selected answer safely (compare as string)
    const getSelectedAnswer = (questionId) => {
        if (!examResult?.answers) return null;
        return examResult.answers.find(ans => extractId(ans.questionId) === extractId(questionId));
    };

    const getPercentage = () => {
        const totalQ = examResult?.totalQuestions ?? derivedTotals.totalQuestions;
        const correct = examResult?.correctAnswers ?? derivedTotals.correctCount;
        if (!totalQ) return 0;
        return ((correct || 0) / totalQ * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="exam-review-main">
                <div className="loading-container">Đang tải kết quả thi...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-review-main">
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="back-btn">Quay lại</button>
                </div>
            </div>
        );
    }

    if (!examResult || !exam) {
        return (
            <div className="exam-review-main">
                <div className="error-container">Không tìm thấy kết quả thi</div>
            </div>
        );
    }

    return (
        <div className="exam-review-main">
            <Breadcrumb
                items={[
                    { label: 'Bài kiểm tra', link: `/student/dashboard/my-courses/${courseId}/quizzes` },
                    { label: exam.name, link: `/student/dashboard/my-courses/${courseId}/quizzes/${quizId}` },
                    { label: 'Kết quả chi tiết' }
                ]}
            />

            <div className="exam-review-header">
                <div className="exam-review-title">
                    <h2>📊 Kết quả chi tiết: {exam.name}</h2>
                </div>

                {attempts.length > 1 && (
                    <div className="attempt-selector">
                        <label htmlFor="attempt-select">Chọn lần thi:</label>
                        <select
                            id="attempt-select"
                            value={selectedAttempt || ''}
                            onChange={(e) => setSelectedAttempt(parseInt(e.target.value))}
                            className="attempt-select"
                        >
                            {attempts.map(attempt => (
                                <option key={attempt.attempt} value={attempt.attempt}>
                                    Lần {attempt.attempt} - {attempt.score} điểm - {formatDateTime(attempt.submitTime)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="exam-review-summary">
                    <div className="summary-grid">
                        <div className="summary-item">
                            <label>Lần thi:</label>
                            <span className="attempt-value">Lần {examResult.attempt || 1}</span>
                        </div>
                        <div className="summary-item">
                            <label>Điểm số:</label>
                            <span className="score-value">
                                {(typeof examResult.score === 'number' ? examResult.score : derivedTotals.totalScore).toFixed(2)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <label>Số câu đúng:</label>
                            <span className="correct-value">
                                {(typeof examResult.correctAnswers === 'number' ? examResult.correctAnswers : derivedTotals.correctCount)} / {(examResult.totalQuestions || derivedTotals.totalQuestions || questions.length)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <label>Tỷ lệ:</label>
                            <span className="percentage-value">{getPercentage()}%</span>
                        </div>
                        <div className="summary-item">
                            <label>Thời gian làm bài:</label>
                            <span>{formatDuration(examResult.startTime, examResult.submitTime)}</span>
                        </div>
                        <div className="summary-item">
                            <label>Thời gian nộp:</label>
                            <span>{formatDateTime(examResult.submitTime)}</span>
                        </div>
                        <div className="summary-item">
                            <label>Trạng thái:</label>
                            <span className={`status-badge ${examResult.status}`}>
                                {examResult.status === 'completed' ? 'Hoàn thành' : examResult.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="exam-review-content">
                <h3>Chi tiết từng câu hỏi</h3>

                {questions.length > 0 ? (
                    <div className="questions-review-list">
                        {questions.map((question, index) => {
                            const selectedAnswer = getSelectedAnswer(question._id);
                            const questionType = question.questionType || question.type || 'multiple_choice';

                            let isCorrect = false;
                            let similarityInfo = null;
                            let displayScore = 0;
                            const maxScore = question.points || 1;

                            if (questionType === 'fill_in_blank') {
                                const gradingDetail = gradingMap.get(extractId(question._id)) || {};

                                // displayScore: prefer numeric score stored, fallback to full points if isCorrect true
                                if (typeof gradingDetail.score === 'number') {
                                    displayScore = gradingDetail.score;
                                } else if (gradingDetail.isCorrect === true) {
                                    displayScore = maxScore;
                                } else {
                                    displayScore = 0;
                                }

                                // isCorrect: explicit flag else fallback to score > 0
                                if (typeof gradingDetail.isCorrect === 'boolean') {
                                    isCorrect = gradingDetail.isCorrect;
                                } else {
                                    isCorrect = displayScore > 0;
                                }

                                // student answer: prefer stored answer in answers[] else gradingDetail.studentAnswer or answer
                                const studentText = selectedAnswer?.answer ?? gradingDetail.studentAnswer ?? gradingDetail.answer ?? '(Không có câu trả lời)';

                                // ai scoring extraction (robust)
                                const aiScoringSource = gradingDetail.aiScoring || gradingDetail.detail || gradingDetail.result || gradingDetail.scoring || gradingDetail;
                                const sim = aiScoringSource && (aiScoringSource.similarity ?? aiScoringSource.score ?? aiScoringSource.sim ?? null);
                                const expl = aiScoringSource && (aiScoringSource.explanation ?? aiScoringSource.feedback ?? null);
                                const method = aiScoringSource && (aiScoringSource.method ?? aiScoringSource.source ?? null);
                                const correctAnswerFromDetail = aiScoringSource && (aiScoringSource.correctAnswer ?? gradingDetail.correctAnswer ?? question.textAnswer ?? null);
                                const feedback = aiScoringSource && (aiScoringSource.feedback ?? null);

                                if (sim !== null || expl !== null || correctAnswerFromDetail !== null) {
                                    similarityInfo = {
                                        similarity: typeof sim === 'number' ? sim : (typeof sim === 'string' ? parseFloat(sim) || 0 : 0),
                                        explanation: expl || '',
                                        method: method || null,
                                        correctAnswer: correctAnswerFromDetail || '',
                                        feedback: feedback || '',
                                        studentAnswer: studentText
                                    };
                                } else {
                                    similarityInfo = { similarity: 0, explanation: '', correctAnswer: question.textAnswer || '', studentAnswer: studentText };
                                }

                                return (
                                    <div key={question._id} className="question-review-item">
                                        <div className="question-review-header">
                                            <div className="question-number">
                                                Câu {index + 1}
                                                <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {isCorrect ? '✅ Đúng' : '❌ Sai'}
                                                </span>
                                                <span className="question-type-badge">Điền từ</span>
                                            </div>
                                            <div className="question-points">
                                                {(displayScore || 0).toFixed(2)} / {maxScore} điểm
                                            </div>
                                        </div>

                                        <div className="question-content">{question.content}</div>

                                        <div className="fill-blank-answer-review">
                                            <div className="student-text-answer">
                                                <label>📝 Câu trả lời của bạn:</label>
                                                <div className={`text-answer-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {similarityInfo.studentAnswer || selectedAnswer?.answer || '(Không có câu trả lời)'}
                                                </div>
                                            </div>

                                            <div className="ai-scoring-info">
                                                <div className="ai-method-badge">
                                                    {similarityInfo.method === 'ai_gemini' && <span className="badge-gemini">🤖 Google Gemini AI</span>}
                                                    {similarityInfo.method === 'exact_match' && <span className="badge-exact">✓ Chính xác</span>}
                                                    {similarityInfo.method === 'acceptable_answer' && <span className="badge-acceptable">✓ Đáp án được chấp nhận</span>}
                                                    {similarityInfo.method === 'fallback_similarity' && <span className="badge-similarity">📊 Thuật toán tương đồng</span>}
                                                    {!similarityInfo.method && <span className="badge-similarity">📊 Điểm tương đồng</span>}
                                                </div>

                                                <div className="similarity-score">
                                                    <label>🎯 Độ chính xác:</label>
                                                    <div className="similarity-bar-container">
                                                        <div
                                                            className="similarity-bar"
                                                            style={{
                                                                width: `${similarityInfo.similarity}%`,
                                                                backgroundColor: similarityInfo.similarity >= 80 ? '#10b981' :
                                                                    similarityInfo.similarity >= 60 ? '#f59e0b' : '#ef4444'
                                                            }}
                                                        >
                                                            {similarityInfo.similarity.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="ai-explanation">
                                                    <label>💡 Đánh giá:</label>
                                                    <p>{similarityInfo.explanation}</p>
                                                </div>

                                                {similarityInfo.feedback && (
                                                    <div className="ai-feedback">
                                                        <label>📝 Góp ý:</label>
                                                        <p>{similarityInfo.feedback}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="correct-text-answer">
                                                <label>✓ Đáp án mẫu:</label>
                                                <div className="text-answer-box correct">
                                                    {similarityInfo?.correctAnswer || question.textAnswer || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // multiple choice
                                const selectedIndex = selectedAnswer?.answer;
                                const isCorrectOption = selectedIndex !== undefined && question.options?.[selectedIndex]?.isCorrect;
                                isCorrect = !!isCorrectOption;
                                displayScore = isCorrect ? (question.points || 1) : 0;

                                return (
                                    <div key={question._id} className="question-review-item">
                                        <div className="question-review-header">
                                            <div className="question-number">
                                                Câu {index + 1}
                                                <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {isCorrect ? '✅ Đúng' : '❌ Sai'}
                                                </span>
                                            </div>
                                            <div className="question-points">
                                                {(displayScore || 0).toFixed(2)} / {maxScore} điểm
                                            </div>
                                        </div>

                                        <div className="question-content">{question.content}</div>

                                        <div className="question-options">
                                            {question.options?.map((option, optIndex) => {
                                                const isSelected = selectedAnswer && Number(selectedAnswer.answer) === optIndex;
                                                const isCorrectOption = option.isCorrect;
                                                let optionClass = 'option-item';
                                                if (isSelected && isCorrectOption) optionClass += ' selected-correct';
                                                else if (isSelected && !isCorrectOption) optionClass += ' selected-incorrect';
                                                else if (isCorrectOption) optionClass += ' correct-answer';

                                                return (
                                                    <div key={optIndex} className={optionClass}>
                                                        <span className="option-letter">{String.fromCharCode(97 + optIndex)}.</span>
                                                        <span className="option-text">{option.text}</span>
                                                        <div className="option-indicators">
                                                            {isSelected && <span className="indicator selected">👆 Bạn chọn</span>}
                                                            {isCorrectOption && <span className="indicator correct">✅ Đáp án đúng</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    <div className="no-questions">Không có câu hỏi để hiển thị</div>
                )}
            </div>

            <div className="exam-review-footer">
                <button onClick={() => navigate(`/student/dashboard/my-courses/${courseId}/quizzes`)} className="back-to-list-btn">
                    Quay lại danh sách
                </button>
            </div>
        </div>
    );
};

export default ExamReviewPage;