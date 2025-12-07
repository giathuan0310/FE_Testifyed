import React from 'react';

const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.id} className="stat-card">
            <div className="stat-card-content">
              <div className={`stat-icon ${stat.color}`}>
                <IconComponent size={24} />
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;