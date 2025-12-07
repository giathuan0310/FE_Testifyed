import React from 'react';

const SliderNavigation = ({ 
  currentSlide, 
  totalSlides, 
  onPrevious, 
  onNext, 
  onGoToSlide 
}) => {
  return (
    <>
      {/* Navigation arrows */}
      <button className="nav-arrow nav-prev" onClick={onPrevious}>
        <span>‹</span>
      </button>
      <button className="nav-arrow nav-next" onClick={onNext}>
        <span>›</span>
      </button>

      {/* Slide indicators */}
      <div className="slide-indicators">
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? "active" : ""}`}
            onClick={() => onGoToSlide(index)}
          />
        ))}
      </div>
    </>
  );
};

export default SliderNavigation;
