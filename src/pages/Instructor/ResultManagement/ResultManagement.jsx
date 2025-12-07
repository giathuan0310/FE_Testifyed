import React from "react";
import { useClasses } from '../../../hooks/useClasses';
import { useClassResults } from '../../../hooks/useClassResults';
import { toast } from 'react-toastify';
import ExportActions from '../../../components/ui/ExportActions/ExportActions';
import {
    calculatePercentage,
    getScoreClass,
    getStudentExamResult,
    calculateStudentAverage,
    calculateExamAverage,
    calculateClassAverage,
    calculateClassPercentage,
    formatDate
} from './components/ScoreCalculations';
import {
    FiPlus,
    FiEdit3,
    FiTrash2,
    FiCopy,
    FiEye,
    FiUsers,
    FiX,

} from 'react-icons/fi';
import { FcComboChart, FcSurvey } from "react-icons/fc";
import './ResultManagement.css';
import ResultDetailsModal from "./ResultDetailsModal";
import { useState } from "react";
import { SearchBar } from "../../../components/ui";
const ResultManagement = ({ forAdmin = false }) => {
    // const { classes, isLoading: classesLoading } = useClasses();
    const { classes, filteredClasses, searchTerm, setSearchTerm, isLoading: classesLoading } = useClasses({ forAdmin });
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailParams, setDetailParams] = useState({ examId: null, studentId: null, attempt: null });
    // const [classSearch, setClassSearch] = useState('');
    const {
        classResults,
        selectedClassId,
        loading: resultsLoading,
        error: resultsError,
        fetchClassResults,
        resetError,

    } = useClassResults();


    const handleClassSelect = async (classId) => {
        if (selectedClassId === classId) return;
        resetError();

        try {
            const result = await fetchClassResults(classId);
            if (result.success) {
                toast.success('Tải kết quả lớp thành công!');
            } else {
                toast.error(result.error || 'Lỗi khi tải kết quả lớp');
            }
        } catch (error) {
            console.error('Error in handleClassSelect:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        }
    };
    const openDetail = (examId, studentId, attempt = 1) => {
        setDetailParams({ examId, studentId, attempt });
        setDetailModalOpen(true);
    };

    return (
        <div className="result-management-container">
            {/* Header */}
            <div className="result-page-header">
                <div className="result-header-content">

                    <div className="header-icon">
                        <FcComboChart size={40} />   <h1> Quản lý kết quả sinh viên</h1>
                    </div>
                    <p>Xem và xuất các kết quả sinh viên trong hệ thống</p>
                </div>
                {selectedClassId && (
                    <div className="header-actions">
                        <ExportActions
                            classResults={classResults}
                            disabled={!classResults || resultsLoading}
                        />
                    </div>
                )}
            </div>

            {/* Classes Navigation */}
            <div className="classes-navigation">
                <h3 className="header-icon"><FcSurvey size={32} /> Danh sách lớp học</h3>
                <div className="search-section">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm kiếm lớp học phần theo tên hoặc mã lớp..."
                        size="large"
                    />
                </div>
                {classesLoading ? (
                    <div className="loading-classes">Đang tải danh sách lớp...</div>
                ) : (
                    <div className="classes-horizontal-list">
                        {filteredClasses && filteredClasses.length > 0 ? (
                            filteredClasses.map(classItem => (
                                <div
                                    key={classItem._id}
                                    className={`class-card ${selectedClassId === classItem._id ? 'active' : ''}`}
                                    onClick={() => handleClassSelect(classItem._id)}
                                >
                                    <div className="class-card-content">
                                        <h4>{classItem.name}</h4>
                                        <p>{classItem.subjectId?.name || 'Chưa có môn học'}</p>
                                        {forAdmin && (
                                            <p className="instructor-name">
                                                <FiUsers size={16} /> Giảng viên: {classItem.teacherId?.fullName || classItem.teacherObj?.fullName || classItem.instructorName || '—'}
                                            </p>
                                        )}
                                        <span className="student-count">
                                            👥 {classItem.studentIds?.length || 0} sinh viên
                                        </span>
                                    </div>
                                    {selectedClassId === classItem._id && (
                                        <div className="selected-indicator">✓</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-classes-horizontal">
                                <p>Không tìm thấy lớp phù hợp</p>
                            </div>
                        )}


                    </div>
                )}
            </div>

            {/* Results Section */}
            {
                selectedClassId && (
                    <div className="results-section">
                        {resultsLoading ? (
                            <div className="loading-results">
                                <div className="loading-spinner"></div>
                                <p>Đang tải kết quả...</p>
                            </div>
                        ) : resultsError ? (
                            <div className="error-results">
                                <p>❌ {resultsError}</p>
                                <button onClick={() => handleClassSelect(selectedClassId)} className="retry-btn">
                                    🔄 Thử lại
                                </button>
                            </div>
                        ) : classResults ? (
                            <div className="results-content">
                                {/* Class Info */}
                                <div className="class-info-rs">
                                    <h2>📋 Bảng điểm lớp {classResults.className}</h2>
                                    <p>📚 Môn học: {classResults.subjectName}</p>
                                    <div className="class-stats-rs">
                                        <span>👥 {classResults.totalStudents} sinh viên</span>
                                        <span>📝 {classResults.totalExams} bài thi</span>
                                    </div>
                                </div>

                                {/* Results Table */}
                                {classResults.students && classResults.students.length > 0 ? (
                                    <div className="results-table-container">
                                        <table className="results-table">
                                            <thead>
                                                <tr>
                                                    <th rowSpan="2" className="student-info-header">Thông tin sinh viên</th>
                                                    <th colSpan={classResults.exams?.length || 0} className="exams-header">
                                                        Điểm các bài thi
                                                    </th>
                                                    <th rowSpan="2" className="average-header">Điểm TB</th>
                                                    <th rowSpan="2" className="percentage-header">Phần trăm</th>
                                                </tr>
                                                <tr>
                                                    {classResults.exams?.map((exam, idx) => (
                                                        <th key={`${exam._id}-${idx}`} className="exam-header">
                                                            <div className="exam-header-content">
                                                                <span className="exam-name">{exam.name}</span>
                                                                <span className="exam-max-score">({exam.maxScore} điểm)</span>
                                                            </div>
                                                        </th>
                                                    ))}

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {classResults.students.map((student, index) => {
                                                    const studentAvg = calculateStudentAverage(student, classResults.exams);
                                                    const avgPercentage = calculatePercentage(studentAvg, 10);

                                                    return (
                                                        <tr key={student._id} className="student-row">
                                                            <td className="student-info">
                                                                <div className="student-details">
                                                                    <span className="student-name">{student.fullName}</span>
                                                                    <span className="student-id">MSSV: {student.studentId}</span>
                                                                </div>
                                                            </td>
                                                            {classResults.exams?.map((exam, colIdx) => {
                                                                const result = getStudentExamResult(student, exam._id);
                                                                const percentage = calculatePercentage(result.score, exam.maxScore);

                                                                return (
                                                                    <td key={`${exam._id}-${colIdx}`} className="exam-score">
                                                                        {result.hasResult ? (
                                                                            <div className={`score-display ${getScoreClass(percentage)}`}>
                                                                                <span className="score">{result.score} </span>
                                                                                <span className="percentage">({percentage}%)</span>
                                                                                {result.attempt > 0 && (
                                                                                    <span className="attempt">Lần nộp {result.attempt}</span>
                                                                                )}
                                                                                <button onClick={() => openDetail(exam._id, student._id, result.attempt || 1)}>
                                                                                    Xem chi tiết
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="no-result">
                                                                                <span>Chưa làm</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}

                                                            <td className="student-average">
                                                                <span className={`avg-score ${getScoreClass(avgPercentage)}`}>
                                                                    {studentAvg}
                                                                </span>
                                                            </td>
                                                            <td className="student-percentage">
                                                                <span className={`percentage-value ${getScoreClass(avgPercentage)}`}>
                                                                    {avgPercentage}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* Average Row */}
                                                <tr className="average-row">
                                                    <td className="average-label">
                                                        <strong>📊 Điểm trung bình lớp</strong>
                                                    </td>
                                                    {classResults.exams?.map((exam, idx) => (
                                                        <td key={`${exam._id}-avg-${idx}`} className="exam-average">
                                                            <strong>{calculateExamAverage(classResults.students, exam._id)}</strong>
                                                        </td>
                                                    ))}
                                                    <td className="class-total-average">
                                                        <strong>{calculateClassAverage(classResults.students)}</strong>
                                                    </td>
                                                    <td className="class-percentage">
                                                        <strong>{calculateClassPercentage(classResults.students)}%</strong>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="no-results">
                                        <p>📝 Chưa có kết quả thi nào trong lớp này</p>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <ResultDetailsModal
                            open={detailModalOpen}
                            onClose={() => setDetailModalOpen(false)}
                            examId={detailParams.examId}
                            studentId={detailParams.studentId}
                            attempt={detailParams.attempt}
                        />
                    </div>
                )
            }
        </div >
    );
};

export default ResultManagement;