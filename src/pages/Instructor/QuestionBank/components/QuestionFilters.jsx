import React from 'react';
import { SearchBar } from '../../../../components/ui';
import { QUESTION_LEVELS, QUESTION_STATUS } from '../../../../constants/instructor';

const QuestionFilters = ({
  searchTerm,
  setSearchTerm,
  levelFilter,
  setLevelFilter,
  subjectFilter,
  setSubjectFilter,
  statusFilter,
  setStatusFilter,
  subjects,
  levelOptions,
  statusOptions
}) => {
  const getLevelText = (level) => {
    const levelMap = {
      [QUESTION_LEVELS.EASY]: 'Dễ',
      [QUESTION_LEVELS.MEDIUM]: 'Trung bình',
      [QUESTION_LEVELS.HARD]: 'Khó'
    };
    return levelMap[level] || level;
  };

  const getStatusText = (status) => {
    const statusMap = {
      [QUESTION_STATUS.ACTIVE]: 'Hoạt động',
      [QUESTION_STATUS.INACTIVE]: 'Không hoạt động',
      [QUESTION_STATUS.DRAFT]: 'Bản nháp'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="filter-section">
      <div className="filter-header">
        <h2>Bộ lọc câu hỏi</h2>
      </div>
      <div className="filter-grid">
        <div className="form-group">
          <label>Tìm kiếm</label>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Nhập nội dung câu hỏi hoặc môn học..."
            size="medium"
          />
        </div>
        <div className="form-group">
          <label>Độ khó</label>
          <select
            className="form-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {levelOptions.map(level => (
              <option key={level} value={level}>
                {getLevelText(level)}
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
            <option value="all">Tất cả</option>
            {subjects && subjects.length > 0 && subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Trạng thái</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {getStatusText(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuestionFilters;