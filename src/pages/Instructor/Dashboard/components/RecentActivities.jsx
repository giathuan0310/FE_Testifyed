import React from 'react';
import { FiActivity } from 'react-icons/fi';

const RecentActivities = ({ activities }) => {
  return (
    <div className="recent-activities">
      <h2>Hoạt động gần đây</h2>
      {activities.length > 0 ? (
        <div className="activity-list">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <IconComponent size={16} />
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-activities">
          <FiActivity size={48} color="#cbd5e1" />
          <p>Chưa có hoạt động nào gần đây</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;