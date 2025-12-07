import { useState, useEffect } from 'react';
import { SLIDER_CONFIG } from '../constants/sliderData';

export const useSlider = (totalSlides) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  // Auto slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDER_CONFIG.AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [totalSlides, timerKey]);

  const resetTimer = () => {
    setTimerKey(prev => prev + 1);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetTimer();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    resetTimer();
  };

  return {
    currentSlide,
    goToSlide,
    nextSlide,
    prevSlide
  };
};
