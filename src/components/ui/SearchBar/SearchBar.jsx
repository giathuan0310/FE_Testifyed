import React from 'react';
import './SearchBar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Tìm kiếm...',
  className = '',
  disabled = false,
  onClear,
  showClearButton = true,
  size = 'medium'
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  const sizeClasses = {
    small: 'search-bar-small',
    medium: 'search-bar-medium',
    large: 'search-bar-large'
  };

  return (
    <div className={`search-bar-container ${sizeClasses[size]} ${className}`}>
      <div className="search-bar-wrapper">
        <svg 
          className="search-icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        
        {showClearButton && value && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Xóa tìm kiếm"
          >
            <svg 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;