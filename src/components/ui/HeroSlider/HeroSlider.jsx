import React from "react";
import "./HeroSlider.css";
import { SLIDES_DATA } from "../../../constants/sliderData";
import { useSlider } from "../../../hooks/useSlider";
import Slide from "./slider/Slide";
import SliderNavigation from "./slider/SliderNavigation";
import DesignCredit from "./slider/DesignCredit";

const HeroSlider = () => {
  const { currentSlide, goToSlide, nextSlide, prevSlide } = useSlider(SLIDES_DATA.length);

  return (
    <section className="hero-slider">
      <div className="slider-container">
        {SLIDES_DATA.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
          />
        ))}
      </div>

      <SliderNavigation
        currentSlide={currentSlide}
        totalSlides={SLIDES_DATA.length}
        onPrevious={prevSlide}
        onNext={nextSlide}
        onGoToSlide={goToSlide}
      />

      <DesignCredit />
    </section>
  );
};

export default HeroSlider;
