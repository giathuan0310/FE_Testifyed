import React, { useState } from 'react';
// import { mockExamSchedules, mockExams, mockClasses, mockCategories } from '../../../mockData';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulesContent.css';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store/appStore';

import { useMyExamSchedules } from '../../../hooks/useExamSchedules';
import { useMemo } from 'react';
import { useEffect } from 'react';


// Hàm gộp dữ liệu lịch thi theo ngày, trả về object {dateString: [chi tiết lịch thi]}
function getExamSchedulesByDate(examSchedules) {
    const result = {};
    examSchedules.forEach(schedule => {
        const exam = schedule.examId;
        const classObj = schedule.classId;
        const dateObj = new Date(schedule.startTime);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const detail = {
            _id: schedule._id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status: schedule.status,
            exam: exam ? { _id: exam._id, name: exam.name } : null,
            class: classObj ? {
                _id: classObj._id,
                name: classObj.name,
                teacherId: classObj.teacherId

            } : null
        };
        if (!result[dateString]) result[dateString] = [];
        result[dateString].push(detail);
    });
    return result;
}

const statusMap = {
    scheduled: "Đã lên lịch",
    in_progress: "Đang diễn ra",
    completed: "Đã hoàn thành"
};
const DashboardContent = () => {
    const user = useAppStore(state => state.user);
    const [date, setDate] = useState(new Date());
    const [selectedDateData, setSelectedDateData] = useState(null);
    const navigate = useNavigate();
    const { examSchedules, isLoading } = useMyExamSchedules();

    // Gộp dữ liệu lịch thi theo ngày
    const examSchedulesByDate = useMemo(() => getExamSchedulesByDate(examSchedules), [examSchedules]);
    // Tự động hiển thị lịch thi của ngày hiện tại khi vào trang
    useEffect(() => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        setSelectedDateData(examSchedulesByDate[dateString] || null);
    }, [examSchedules, date]);

    const handleDateClick = (value) => {
        setDate(value);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        setSelectedDateData(examSchedulesByDate[dateString] || null);
    };

    const formatDay = (locale, date) => {
        return date.getDate();
    };

    return (
        <div className="dashboard-content-wrapper">
            <div className="dashboard-welcome">
                <h2 style={{ color: '#ff9900ff' }}>Chào mừng quay trở lại, {user.fullName}!👋</h2>
            </div>

            <div className="calendar-container">
                <Calendar
                    onChange={handleDateClick}
                    value={date}
                    tileContent={({ date, view }) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateString = `${year}-${month}-${day}`;
                        if (examSchedulesByDate[dateString]) {
                            return <div className="exam-dot"></div>;
                        }
                        return null;
                    }}
                    locale="vi"
                    formatDay={formatDay}
                />
            </div>

            <div className="selected-date-info">
                {isLoading ? (
                    <p>Đang tải lịch thi...</p>
                ) : selectedDateData ? (
                    <>
                        <h3>Lịch thi ngày {date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</h3>
                        {selectedDateData.map((item, index) => (
                            <div key={item._id} className="exam-detailss">
                                <p><strong>Thời gian:</strong> {new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Sự kiện:</strong> {item.exam ? item.exam.name : 'Không có thông tin'}</p>
                                <p><strong>Tên Lớp lớp:</strong> {item.class ? item.class.name : 'Không có thông tin'}</p>
                                <p><strong>Giảng viên:</strong> {item.class && item.class.teacherId ? item.class.teacherId.fullName : 'Không có thông tin'}</p>
                                <p><strong>Trạng thái:</strong> {statusMap[item.status] || item.status}</p>
                                {item.class && (
                                    <button
                                        className="exam-view-btn"

                                        onClick={() => navigate(`/student/dashboard/my-courses/${item.class._id}`)}
                                    >
                                        Xem chi tiết lớp học
                                    </button>
                                )}

                                <hr />
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Không có lịch thi hoặc sự kiện nào vào ngày này.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardContent;