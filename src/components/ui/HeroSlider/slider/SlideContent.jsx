import React from 'react';

const SlideContent = ({ title, subtitle }) => {
  return (
    <div className="slide-text">
      <h1 className="slide-title">{title}</h1>
      <p className="slide-subtitle">{subtitle}</p>
      <div className="slide-actions">
        <button className="btn-primary">Bắt đầu thi</button>
        <button className="btn-secondary">Xem demo</button>
      </div>
    </div>
  );
};

export default SlideContent;
