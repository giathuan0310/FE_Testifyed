import React from 'react';
import { StatsCard } from '../../../../components/ui';

const QuestionStats = ({ stats, subjects }) => {
  // Provide default values to handle undefined props
  const safeStats = stats || {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    active: 0
  };
  
  const safeSubjects = subjects || [];

  return (
    <div className="question-stats">
      <StatsCard
        title="Tổng câu hỏi"
        value={safeStats.total || 0}
        icon="❓"
        color="blue"
      />
      <StatsCard
        title="Nhận biết"
        value={safeStats.easy || 0}
        icon="😊"
        color="green"
      />
      <StatsCard
        title="Thông hiểu"
        value={safeStats.medium || 0}
        icon="😐"
        color="yellow"
      />
      <StatsCard
        title="Vận dụng"
        value={safeStats.hard || 0}
        icon="😰"
        color="orange"
      />
      <StatsCard
        title="Vận dụng cao"
        value={safeStats.advanced || 0}
        icon="🔥"
        color="red"
      />
      <StatsCard
        title="Đang hoạt động"
        value={safeStats.active || 0}
        icon="✅"
        color="purple"
      />
      <StatsCard
        title="Môn học"
        value={safeSubjects.length}
        icon="�"
        color="gray"
      />
    </div>
  );
};

export default QuestionStats;