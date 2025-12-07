import React from 'react';
import { FileX, Search, Plus } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = FileX, 
  title = 'Không có dữ liệu', 
  message = 'Chưa có dữ liệu để hiển thị',
  actionText = '',
  onAction = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};

// Các empty states có sẵn
export const EmptySubjects = ({ onCreateSubject }) => (
  <EmptyState
    icon={FileX}
    title="Chưa có môn học nào"
    message="Bạn chưa tạo môn học nào. Hãy tạo môn học đầu tiên để bắt đầu."
    actionText="Tạo môn học"
    onAction={onCreateSubject}
  />
);

export const EmptyExams = ({ onCreateExam }) => (
  <EmptyState
    icon={FileX}
    title="Chưa có bài thi nào"
    message="Bạn chưa tạo bài thi nào. Hãy tạo bài thi đầu tiên."
    actionText="Tạo bài thi"
    onAction={onCreateExam}
  />
);

export const EmptySchedules = ({ onCreateSchedule }) => (
  <EmptyState
    icon={FileX}
    title="Chưa có lịch thi nào"
    message="Bạn chưa lên lịch thi nào. Hãy tạo lịch thi đầu tiên."
    actionText="Tạo lịch thi"
    onAction={onCreateSchedule}
  />
);

export const NoSearchResults = () => (
  <EmptyState
    icon={Search}
    title="Không tìm thấy kết quả"
    message="Không có dữ liệu nào khớp với từ khóa tìm kiếm của bạn."
  />
);

export default EmptyState;