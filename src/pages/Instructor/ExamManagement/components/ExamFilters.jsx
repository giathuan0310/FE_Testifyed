import React from 'react';
import { SearchBar } from '../../../../components/ui';
import { EXAM_STATUS } from '../../../../constants/instructor';

const ExamFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,

}) => {
  const getStatusText = (status) => {
    const statusMap = {
      [EXAM_STATUS.SCHEDULED]: 'Đã lên lịch',
      [EXAM_STATUS.ACTIVE]: 'Đang diễn ra',
      [EXAM_STATUS.COMPLETED]: 'Đã hoàn thành',
      [EXAM_STATUS.DRAFT]: 'Bản Nháp'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="filter-section">
      <div className="filter-header">
        <h2>Bộ lọc kỳ thi</h2>
      </div>
      <div className="filter-grid">
        <div className="form-group">
          <label>Tìm kiếm</label>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Nhập tên kỳ thi hoặc môn học..."
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
            {Object.values(EXAM_STATUS).map(status => (
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

export default ExamFilters;