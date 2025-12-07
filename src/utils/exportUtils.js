import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Xuất bảng điểm lớp ra file Excel
 */
export const exportClassResultsToExcel = (classResults) => {
    if (!classResults || !classResults.students || !classResults.exams) {
        throw new Error('Không có dữ liệu để xuất');
    }

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();

    // === SHEET 1: BẢNG ĐIỂM CHI TIẾT ===
    const detailData = [];

    // Header row 1
    const header1 = ['Thông tin sinh viên', '', ...classResults.exams.map(() => ''), 'Tổng kết', ''];

    // Header row 2  
    const header2 = ['Họ và tên', 'MSSV', ...classResults.exams.map(exam => exam.name), 'Điểm TB', 'Phần trăm'];

    // Header row 3 - Điểm tối đa
    const header3 = ['', '', ...classResults.exams.map(exam => `(${exam.maxScore} điểm)`), '', ''];

    detailData.push(header1, header2, header3);

    // Dữ liệu sinh viên
    classResults.students.forEach(student => {
        const row = [
            student.fullName,
            student.studentId
        ];

        // Điểm từng bài thi
        classResults.exams.forEach(exam => {
            const result = student.results.find(r => r.examId === exam._id);
            if (result && result.hasResult) {
                const percentage = Math.round((result.score / exam.maxScore) * 100);
                row.push(`${result.score} (${percentage}%) - Lần ${result.attempt}`);
            } else {
                row.push('Chưa làm');
            }
        });

        // Điểm trung bình
        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        const avgScore = validResults.length > 0
            ? (validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length).toFixed(2)
            : 0;
        const avgPercentage = Math.round(avgScore * 10);

        row.push(avgScore, `${avgPercentage}%`);
        detailData.push(row);
    });

    // Dòng trung bình lớp
    const avgRow = ['ĐIỂM TRUNG BÌNH LỚP', ''];
    classResults.exams.forEach(exam => {
        const validScores = classResults.students
            .map(student => student.results.find(r => r.examId === exam._id))
            .filter(result => result && result.hasResult && result.score > 0);

        if (validScores.length > 0) {
            const avgScore = (validScores.reduce((acc, result) => acc + result.score, 0) / validScores.length).toFixed(2);
            avgRow.push(avgScore);
        } else {
            avgRow.push('0.00');
        }
    });

    // Tính trung bình tổng lớp
    const allStudentAvgs = classResults.students.map(student => {
        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        return validResults.length > 0
            ? validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length
            : 0;
    });
    const classAvg = allStudentAvgs.length > 0
        ? (allStudentAvgs.reduce((acc, avg) => acc + avg, 0) / allStudentAvgs.length).toFixed(2)
        : 0;
    const classAvgPercentage = Math.round(classAvg * 10);

    avgRow.push(classAvg, `${classAvgPercentage}%`);
    detailData.push(avgRow);

    // Tạo worksheet cho bảng điểm chi tiết
    const detailWorksheet = XLSX.utils.aoa_to_sheet(detailData);

    // Merge cells cho header
    detailWorksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // "Thông tin sinh viên"
        { s: { r: 0, c: classResults.exams.length + 2 }, e: { r: 0, c: classResults.exams.length + 3 } } // "Tổng kết"
    ];

    // Set column widths
    const colWidths = [
        { wch: 25 }, // Họ tên
        { wch: 12 }, // MSSV
        ...classResults.exams.map(() => ({ wch: 20 })), // Các bài thi
        { wch: 10 }, // Điểm TB
        { wch: 12 }  // Phần trăm
    ];
    detailWorksheet['!cols'] = colWidths;

    // === SHEET 2: THỐNG KÊ TỔNG QUAN ===
    const statsData = [
        ['THỐNG KÊ TỔNG QUAN'],
        [''],
        ['Thông tin lớp học'],
        ['Tên lớp:', classResults.className],
        ['Môn học:', classResults.subjectName],
        ['Tổng số sinh viên:', classResults.totalStudents],
        ['Tổng số bài thi:', classResults.totalExams],
        [''],
        ['Thống kê điểm số'],
        ['Điểm trung bình lớp:', classAvg],
        ['Phần trăm đạt (>=5):', calculatePassRate(classResults) + '%'],
        ['Phần trăm giỏi (>=8):', calculateExcellentRate(classResults) + '%'],
        [''],
        ['Chi tiết từng bài thi']
    ];

    // Thêm thống kê từng bài thi
    classResults.exams.forEach((exam, index) => {
        const validScores = classResults.students
            .map(student => student.results.find(r => r.examId === exam._id))
            .filter(result => result && result.hasResult && result.score > 0);

        const examAvg = validScores.length > 0
            ? (validScores.reduce((acc, result) => acc + result.score, 0) / validScores.length).toFixed(2)
            : 0;

        const passCount = validScores.filter(result => result.score >= (exam.maxScore * 0.5)).length;
        const passRate = validScores.length > 0 ? Math.round((passCount / validScores.length) * 100) : 0;

        statsData.push(
            [`Bài thi ${index + 1}: ${exam.name}`],
            [`  - Điểm trung bình: ${examAvg}/${exam.maxScore}`],
            [`  - Tỷ lệ đạt: ${passRate}% (${passCount}/${validScores.length})`],
            [`  - Số người chưa làm: ${classResults.totalStudents - validScores.length}`]
        );
    });

    const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
    statsWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    // === SHEET 3: DANH SÁCH CHI TIẾT ĐIỂM ===
    const rawData = [
        ['STT', 'Họ và tên', 'MSSV', 'Tên bài thi', 'Điểm', 'Điểm tối đa', 'Phần trăm', 'Lần thử', 'Thời gian nộp', 'Trạng thái']
    ];

    let stt = 1;
    classResults.students.forEach(student => {
        classResults.exams.forEach(exam => {
            const result = student.results.find(r => r.examId === exam._id);
            if (result && result.hasResult) {
                const percentage = Math.round((result.score / exam.maxScore) * 100);
                const submitTime = result.submitTime ? new Date(result.submitTime).toLocaleString('vi-VN') : '';

                rawData.push([
                    stt++,
                    student.fullName,
                    student.studentId,
                    exam.name,
                    result.score,
                    exam.maxScore,
                    `${percentage}%`,
                    result.attempt,
                    submitTime,
                    'Đã nộp'
                ]);
            } else {
                rawData.push([
                    stt++,
                    student.fullName,
                    student.studentId,
                    exam.name,
                    0,
                    exam.maxScore,
                    '0%',
                    0,
                    '',
                    'Chưa làm'
                ]);
            }
        });
    });

    const rawWorksheet = XLSX.utils.aoa_to_sheet(rawData);
    rawWorksheet['!cols'] = [
        { wch: 5 },  // STT
        { wch: 25 }, // Họ tên
        { wch: 12 }, // MSSV
        { wch: 30 }, // Tên bài thi
        { wch: 8 },  // Điểm
        { wch: 12 }, // Điểm tối đa
        { wch: 10 }, // Phần trăm
        { wch: 8 },  // Lần thử
        { wch: 20 }, // Thời gian
        { wch: 12 }  // Trạng thái
    ];

    // Thêm các sheets vào workbook
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, 'Bảng điểm tổng hợp');
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Thống kê');
    XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Chi tiết điểm');

    // Tạo tên file
    const fileName = `BangDiem_${classResults.className}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;

    // Xuất file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);

    return fileName;
};

// Helper functions
const calculatePassRate = (classResults) => {
    const allStudentAvgs = classResults.students.map(student => {
        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        return validResults.length > 0
            ? validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length
            : 0;
    });

    const passedStudents = allStudentAvgs.filter(avg => avg >= 5).length;
    return allStudentAvgs.length > 0 ? Math.round((passedStudents / allStudentAvgs.length) * 100) : 0;
};

const calculateExcellentRate = (classResults) => {
    const allStudentAvgs = classResults.students.map(student => {
        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        return validResults.length > 0
            ? validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length
            : 0;
    });

    const excellentStudents = allStudentAvgs.filter(avg => avg >= 8).length;
    return allStudentAvgs.length > 0 ? Math.round((excellentStudents / allStudentAvgs.length) * 100) : 0;
};

/**
 * Xuất dữ liệu JSON để backup
 */
export const exportClassResultsToJSON = (classResults) => {
    const dataStr = JSON.stringify(classResults, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `BangDiem_${classResults.className}_${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, fileName);
    return fileName;
};

/**
 * Xuất CSV đơn giản
 */
export const exportClassResultsToCSV = (classResults) => {
    const headers = ['Họ và tên', 'MSSV', ...classResults.exams.map(exam => exam.name), 'Điểm TB', 'Phần trăm'];
    const csvData = [headers];

    classResults.students.forEach(student => {
        const row = [student.fullName, student.studentId];

        classResults.exams.forEach(exam => {
            const result = student.results.find(r => r.examId === exam._id);
            row.push(result && result.hasResult ? result.score : 0);
        });

        const validResults = student.results.filter(r => r.hasResult && r.score > 0);
        const avgScore = validResults.length > 0
            ? (validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length).toFixed(2)
            : 0;
        const avgPercentage = Math.round(avgScore * 10);

        row.push(avgScore, avgPercentage);
        csvData.push(row);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `BangDiem_${classResults.className}_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
    return fileName;
};