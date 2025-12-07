import React from 'react';
import './StatsCard.css';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  subtitle,
  trend,
  loading = false,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    blue: 'stats-card-blue',
    green: 'stats-card-green',
    yellow: 'stats-card-yellow',
    red: 'stats-card-red',
    purple: 'stats-card-purple',
    gray: 'stats-card-gray',
    orange: 'stats-card-orange',
    indigo: 'stats-card-indigo',
    cyan: 'stats-card-cyan',
    emerald: 'stats-card-emerald'
  };

  const cardClasses = [
    'stats-card',
    colorClasses[color],
    onClick ? 'stats-card-clickable' : '',
    loading ? 'stats-card-loading' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="stats-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="stats-card-content">
        {icon && (
          <div className="stats-icon">
            {typeof icon === 'string' ? (
              <span className="stats-icon-text">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
        
        <div className="stats-info">
          <div className="stats-header">
            <h3 className="stats-title">{title}</h3>
            {trend && (
              <div className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                <span className="trend-icon">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                <span className="trend-value">{trend.value}%</span>
              </div>
            )}
          </div>
          
          <div className="stats-value">{value}</div>
          
          {subtitle && (
            <div className="stats-subtitle">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;