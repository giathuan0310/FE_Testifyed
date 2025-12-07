import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { exportClassResultsToExcel, exportClassResultsToJSON, exportClassResultsToCSV } from '../../../utils/exportUtils';
import './ExportActions.css';

const ExportActions = ({ classResults, disabled = false }) => {
    const [exportLoading, setExportLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showExportMenu && !event.target.closest('.export-dropdown')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showExportMenu]);

    const handleExportGrades = async (format = 'excel') => {
        if (!classResults) {
            toast.warning('Chưa có dữ liệu để xuất');
            return;
        }

        setExportLoading(true);

        try {
            let fileName;

            switch (format) {
                case 'excel':
                    fileName = exportClassResultsToExcel(classResults);
                    toast.success(`✅ Đã xuất file Excel: ${fileName}`);
                    break;
                case 'csv':
                    fileName = exportClassResultsToCSV(classResults);
                    toast.success(`✅ Đã xuất file CSV: ${fileName}`);
                    break;
                case 'json':
                    fileName = exportClassResultsToJSON(classResults);
                    toast.success(`✅ Đã xuất file JSON: ${fileName}`);
                    break;
                default:
                    throw new Error('Định dạng không được hỗ trợ');
            }

            console.log('Exported file:', fileName);

        } catch (error) {
            console.error('Export error:', error);
            toast.error(`❌ Lỗi khi xuất file: ${error.message}`);
        } finally {
            setExportLoading(false);
            setShowExportMenu(false);
        }
    };

    const handlePrintReport = () => {
        if (!classResults) {
            toast.warning('Chưa có dữ liệu để in');
            return;
        }

        // Tạo cửa sổ in
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintableReport(classResults);

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const generatePrintableReport = (classResults) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bảng điểm ${classResults.className}</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .student-info { text-align: left; }
                    .excellent { color: #38a169; }
                    .good { color: #3182ce; }
                    .average { color: #d69e2e; }
                    .poor { color: #e53e3e; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BẢNG ĐIỂM LỚP HỌC</h1>
                    <h2>${classResults.className}</h2>
                    <p>Môn học: ${classResults.subjectName}</p>
                </div>
                
                <div class="info">
                    <p><strong>Tổng số sinh viên:</strong> ${classResults.totalStudents}</p>
                    <p><strong>Tổng số bài thi:</strong> ${classResults.totalExams}</p>
                    <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th rowspan="2">Họ và tên</th>
                            <th rowspan="2">MSSV</th>
                            <th colspan="${classResults.exams.length}">Điểm các bài thi</th>
                            <th rowspan="2">Điểm TB</th>
                            <th rowspan="2">Phần trăm</th>
                        </tr>
                        <tr>
                            ${classResults.exams.map(exam => `<th>${exam.name}<br>(${exam.maxScore} điểm)</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${classResults.students.map(student => {
            const validResults = student.results.filter(r => r.hasResult && r.score > 0);
            const avgScore = validResults.length > 0
                ? (validResults.reduce((acc, result) => acc + result.score, 0) / validResults.length).toFixed(2)
                : 0;
            const avgPercentage = Math.round(avgScore * 10);
            const scoreClass = avgPercentage >= 80 ? 'excellent' : avgPercentage >= 70 ? 'good' : avgPercentage >= 50 ? 'average' : 'poor';

            return `
                                <tr>
                                    <td class="student-info">${student.fullName}</td>
                                    <td>${student.studentId}</td>
                                    ${classResults.exams.map(exam => {
                const result = student.results.find(r => r.examId === exam._id);
                if (result && result.hasResult) {
                    const percentage = Math.round((result.score / exam.maxScore) * 100);
                    const examScoreClass = percentage >= 80 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'average' : 'poor';
                    return `<td class="${examScoreClass}">${result.score} (${percentage}%)</td>`;
                }
                return '<td>-</td>';
            }).join('')}
                                    <td class="${scoreClass}"><strong>${avgScore}</strong></td>
                                    <td class="${scoreClass}"><strong>${avgPercentage}%</strong></td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; text-align: right;">
                    <p><em>Ngày in: ${new Date().toLocaleString('vi-VN')}</em></p>
                </div>
            </body>
            </html>
        `;
    };

    if (!classResults) {
        return null;
    }

    return (
        <div className="export-actions">
            <div className="export-dropdown">
                <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="export-btn"
                    disabled={disabled || exportLoading}
                >
                    {exportLoading ? (
                        <>⏳ Đang xuất...</>
                    ) : (
                        <>📤 Xuất dữ liệu ▼</>
                    )}
                </button>

                {showExportMenu && (
                    <div className="export-menu">
                        <button
                            onClick={() => handleExportGrades('excel')}
                            className="export-option"
                            disabled={exportLoading}
                        >
                            📊 Xuất Excel (Đầy đủ)
                        </button>
                        <button
                            onClick={() => handleExportGrades('csv')}
                            className="export-option"
                            disabled={exportLoading}
                        >
                            📄 Xuất CSV (Đơn giản)
                        </button>
                        <button
                            onClick={() => handleExportGrades('json')}
                            className="export-option"
                            disabled={exportLoading}
                        >
                            💾 Xuất JSON (Backup)
                        </button>
                        <hr className="export-divider" />
                        <button
                            onClick={handlePrintReport}
                            className="export-option"
                            disabled={exportLoading}
                        >
                            🖨️ In báo cáo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportActions;