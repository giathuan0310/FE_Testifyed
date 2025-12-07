import React from 'react';
import { StatsCard } from '../../../../components/ui';

const ExamScheduleStats = ({ stats, subjects, classes }) => {
    return (
        <div className="schedule-stats">
            <StatsCard
                title="Tổng lịch thi"
                value={stats.total || 0}
                icon="📅"
                color="blue"
            />
            <StatsCard
                title="Đã lên lịch"
                value={stats.scheduled || 0}
                icon="⏰"
                color="yellow"
            />
            <StatsCard
                title="Đang diễn ra"
                value={stats.in_progress || 0}
                icon="▶️"
                color="green"
            />
            <StatsCard
                title="Đã hoàn thành"
                value={stats.completed || 0}
                icon="✅"
                color="purple"
            />
            <StatsCard
                title="Số lớp học"
                value={classes?.length || 0}
                icon="🏫"
                color="gray"
            />
            <StatsCard
                title="Số môn học"
                value={subjects?.length || 0}
                icon="📚"
                color="indigo"
            />
        </div>
    );
};

export default ExamScheduleStats;