import React, { useEffect, useState } from 'react';
import { getExamResultApi, getStudentAttemptsApi, getExamByIdApi } from '../../../service/api/apiExam';
import { useNavigate } from 'react-router-dom';
import './ResultDetailsModal.css';

const ResultDetailsModal = ({ open, onClose, examId, studentId, attempt }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(attempt ?? null);
    const [result, setResult] = useState(null);
    const [exam, setExam] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !examId || !studentId) return;
        const loadMeta = async () => {
            try {
                const attRes = await getStudentAttemptsApi(examId, studentId);
                const attemptsData = attRes?.data ?? attRes;
                const list = Array.isArray(attemptsData) ? attemptsData : (attemptsData?.data ?? []);
                setAttempts(list);
                const latest = list.length ? Math.max(...list.map(a => a.attempt || 0)) : (attempt ?? 1);
                setSelectedAttempt(attempt ?? latest);

                const examRes = await getExamByIdApi(examId);
                setExam(examRes?.data ?? examRes);
            } catch (err) {
                console.error(err);
                setError(err?.message || 'Lỗi tải thông tin');
            }
        };
        loadMeta();
    }, [open, examId, studentId, attempt]);

    useEffect(() => {
        if (!open || !examId || !studentId || selectedAttempt === null) return;
        const load = async () => {
            try {
                setLoading(true);
                const res = await getExamResultApi(examId, studentId, selectedAttempt);
                const payload = res?.data ?? res;
                setResult(payload.data ?? payload);
            } catch (err) {
                console.error(err);
                setError(err?.message || 'Lỗi tải kết quả');
                setResult(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [open, examId, studentId, selectedAttempt]);

    const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN') : 'N/A';
    const getPercentage = (score, max) => {
        if (!max || isNaN(score)) return '0.00';
        return ((score / max) * 100).toFixed(2);
    };

    if (!open) return null;

    return (
        <div className="rdm-page">
            <div className="rdm-page-inner">
                <div className="rdm-breadcrumb">
                    <button className="rdm-back-btn" onClick={() => { onClose?.(); }}>‹ Quay lại</button>
                    <span>{exam?.name || 'Kết quả chi tiết'}</span>
                </div>

                <div className="rdm-summary-card">
                    <div className="summary-left">
                        <h2>📊 Kết quả chi tiết: {exam?.name || ''}</h2>
                        <div className="meta-row">
                            <div>Lần thi: <strong>{result?.attempt ?? selectedAttempt ?? 1}</strong></div>
                            <div>Điểm: <strong className="rdm-score-value">{(result?.score ?? 0).toFixed?.(2) ?? result?.score}</strong></div>
                            <div>Số câu đúng: <strong className="rdm-correct-value">{result?.correctAnswers ?? 0} / {result?.totalQuestions ?? (result?.questions?.length ?? 0)}</strong></div>
                            <div>Tỷ lệ: <strong className="rdm-percentage-value">{getPercentage(result?.score ?? 0, exam?.maxScore ?? result?.maxScore ?? 1)}%</strong></div>
                        </div>
                        <div className="meta-row small">
                            <div>Thời gian nộp: {formatDateTime(result?.submitTime)}</div>
                            <div>Trạng thái: <span className="rdm-status">{result?.status === 'completed' ? 'HOÀN THÀNH' : result?.status}</span></div>
                        </div>
                    </div>

                    <div className="summary-right">
                        {attempts.length > 0 && (
                            <select className='bg' value={selectedAttempt ?? ''} onChange={(e) => setSelectedAttempt(parseInt(e.target.value))}>
                                {attempts.map(a => (
                                    <option key={`att-${a.attempt}`} value={a.attempt}>
                                        Lần {a.attempt} - {a.score} điểm - {formatDateTime(a.submitTime)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="rdm-questions-section">
                    <h3>Chi tiết từng câu hỏi</h3>
                    {loading ? <div>Đang tải...</div> : error ? <div className="error">{error}</div> : (
                        (result?.questions || []).map((q, idx) => {
                            const gd = (result?.gradingDetails || []).find(g => {
                                try { return (g.questionId?.toString?.() ?? g.questionId) === (q._id?.toString?.() ?? q._id); } catch { return false; }
                            });
                            return (
                                <div key={`q-${q._id ?? idx}`} className="rdm-question-card">
                                    <div className="rdm-question-header">
                                        <div className={`rdm-q-index ${gd?.isCorrect ? 'correct' : 'wrong'}`}>Câu {idx + 1}</div>
                                        <div className="rdm-q-points">{(gd?.score ?? q.points ?? 0).toFixed ? (gd?.score ?? q.points ?? 0).toFixed(2) : (gd?.score ?? q.points ?? 0)} / {(q.points ?? 0)} điểm</div>
                                    </div>

                                    <div className="rdm-q-content">{q.question || q.content || q.text}</div>

                                    {/* Multiple choice */}
                                    {q.options && Array.isArray(q.options) && (
                                        <ul className="rdm-options-list">
                                            {q.options.map((opt, i) => {
                                                const isSelected = result?.answers?.find(a => a.questionId?.toString?.() === (q._id?.toString?.() ?? q._id))?.answer == i;
                                                const isCorrect = !!opt.isCorrect;
                                                return (
                                                    <li key={`opt-${i}`} className={`rdm-option-item ${isCorrect ? 'correct' : ''} ${isSelected ? 'selected' : ''}`}>
                                                        <span className="rdm-option-letter">{String.fromCharCode(97 + i)}.</span>
                                                        <span className="rdm-option-text">{opt.text}</span>
                                                        <div className="rdm-option-tags">
                                                            {isSelected && <span className="tag you-selected">Bạn chọn</span>}
                                                            {isCorrect && <span className="tag correct-tag">Đáp án đúng</span>}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {/* Fill in blank */}
                                    {q.questionType === 'fill_in_blank' || q.type === 'fill_in_blank' ? (
                                        <div className="rdm-fill-answer">
                                            <div className="student-answer">
                                                <label>Câu trả lời của học sinh:</label>
                                                <div className={`rdm-answer-box ${gd?.isCorrect ? 'correct' : ''}`}>{(result?.answers || []).find(a => a.questionId?.toString?.() === (q._id?.toString?.() ?? q._id))?.answer ?? ''}</div>
                                            </div>
                                            <div className="model-answer">
                                                <label>Đáp án mẫu:</label>
                                                <div className="rdm-answer-box">{q.textAnswer ?? q.correctAnswer ?? ''}</div>
                                            </div>

                                            {gd?.aiScoring && (
                                                <div className="rdm-ai-block">
                                                    <div className="ai-score">Điểm tương đồng: {gd.aiScoring.similarity ?? gd.aiScoring.score}</div>
                                                    <div className="ai-feedback">{gd.aiScoring.feedback}</div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="rdm-page-footer">
                    <button className="rdm-close-btn" onClick={() => onClose?.()}>Quay lại</button>
                </div>
            </div>
        </div>
    );
};

export default ResultDetailsModal;