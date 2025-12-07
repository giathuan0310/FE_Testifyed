import React from 'react';
import { StatsCard } from '../../../../components/ui';

const ExamStats = ({ stats, subjects }) => {
  return (
    <div className="exam-stats">
      <StatsCard
        title="Tổng kỳ thi"
        value={stats.totalExams}
        icon="📝"
        color="blue"
      />

      <StatsCard
        title="Đang diễn ra"
        value={stats.activeExams}
        icon="▶️"
        color="green"
      />
      <StatsCard
        title="Đã hoàn thành"
        value={stats.completedExams}
        icon="✅"
        color="purple"
      />
      <StatsCard
        title="Bản Nháp"
        value={stats.draftExams}
        icon="📚"
        color="red"
      />
    </div>
  );
};

export default ExamStats;