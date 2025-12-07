import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ actions }) => {
  return (
    <div className="quick-actions">
      <h2>Hành động nhanh</h2>
      <div className="actions-grid">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Link key={index} to={action.link} className="action-card">
              <div className="action-icon">
                <IconComponent size={20} />
              </div>
              <div className="action-info">
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;