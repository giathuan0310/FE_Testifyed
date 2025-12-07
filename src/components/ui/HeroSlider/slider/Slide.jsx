import React from 'react';
import SlideContent from './SlideContent';
import SlideVisual from './SlideVisual';

const Slide = ({ slide, isActive }) => {
  return (
    <div
      className={`slide ${isActive ? "active" : ""}`}
      style={{
        backgroundImage: `url(${slide.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient overlay */}
      <div
        className="gradient-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: slide.gradient,
          zIndex: 1,
        }}
      />

      <div className="slide-content">
        <SlideContent
          title={slide.title}
          subtitle={slide.subtitle}
        />
        <SlideVisual />
      </div>

      {/* Decorative wave */}
      <div className="wave-decoration">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>
    </div>
  );
};

export default Slide;
