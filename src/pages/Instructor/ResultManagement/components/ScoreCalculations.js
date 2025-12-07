/**
 * Utility functions for score calculations
 */

export const calculatePercentage = (score, maxScore) => {
    if (!score || !maxScore || maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
};

export const getScoreClass = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'average';
    return 'poor';
};

export const getStudentExamResult = (student, examId) => {
    const result = student.results.find(r => r.examId === examId);
    return result || { score: 0, hasResult: false, attempt: 0 };
};

export const calculateStudentAverage = (student, exams) => {
    const validResults = student.results.filter(r => r.hasResult && r.score > 0);
    if (validResults.length === 0) return 0;
    const sum = validResults.reduce((acc, result) => acc + result.score, 0);
    return (sum / validResults.length).toFixed(2);
};

export const calculateExamAverage = (students, examId) => {
    const validScores = students
        .map(student => getStudentExamResult(student, examId))
        .filter(result => result.hasResult && result.score > 0);

    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, result) => acc + result.score, 0);
    return (sum / validScores.length).toFixed(2);
};

export const calculateClassAverage = (students) => {
    if (!students || students.length === 0) return "0.00";

    const studentAverages = students.map(student => {
        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        return validResults.length > 0
            ? validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length
            : 0;
    });

    const sum = studentAverages.reduce((acc, avg) => acc + avg, 0);
    return (sum / studentAverages.length).toFixed(2);
};

export const calculateClassPercentage = (students) => {
    if (!students || students.length === 0) return 0;

    const classAvg = parseFloat(calculateClassAverage(students));
    return Math.round(classAvg * 10);
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};