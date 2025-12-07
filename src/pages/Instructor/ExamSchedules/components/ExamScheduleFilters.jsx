import React from 'react';
import { SearchBar } from '../../../../components/ui';
import { EXAM_SCHEDULE_STATUS, EXAM_SCHEDULE_STATUS_TEXT } from '../../../../constants/instructor';

const ExamScheduleFilters = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    subjectFilter,
    setSubjectFilter,
    classFilter,
    setClassFilter,
    subjects,
    classes
}) => {
    const getStatusText = (status) => {
        return EXAM_SCHEDULE_STATUS_TEXT[status] || status;
    };

    return (
        <div className="filter-section">
            <div className="filter-header">
                <h2>Bộ lọc lịch thi</h2>
            </div>
            <div className="filter-grid">
                <div className="form-group">
                    <label>Tìm kiếm</label>
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Nhập tên lịch thi..."
                        size="medium"
                    />
                </div>

                <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.values(EXAM_SCHEDULE_STATUS).map(status => (
                            <option key={status} value={status}>
                                {getStatusText(status)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Môn học</label>
                    <select
                        className="form-select"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="all">Tất cả môn học</option>
                        {subjects && subjects.length > 0 && subjects.map(subject => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name} ({subject.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Lớp học</label>
                    <select
                        className="form-select"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="all">Tất cả lớp học</option>
                        {classes && classes.length > 0 && classes.map(classItem => (
                            <option key={classItem._id} value={classItem._id}>
                                {classItem.name} ({classItem.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ExamScheduleFilters;