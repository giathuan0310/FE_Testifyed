import React from 'react';
import './PageHeader.css';
import { Plus, RefreshCw } from 'lucide-react';

const PageHeader = ({ 
  title, 
  subtitle, 
  onAdd, 
  onRefresh,
  addButtonText = "Thêm mới",
  showAddButton = true,
  showRefreshButton = true,
  children
}) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        <div className="header-actions">
          {children}
          {showRefreshButton && (
            <button 
              className="header-btn refresh-btn"
              onClick={onRefresh}
              title="Làm mới"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          )}
          {showAddButton && onAdd && (
            <button 
              className="header-btn add-btn"
              onClick={onAdd}
            >
              <Plus size={16} />
              {addButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;