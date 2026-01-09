"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  emoji: string;
}

// Цвета для слайдов (чередуются)
const SLIDE_COLORS = [
  "from-orange-500 to-orange-400",
  "from-sky-600 to-sky-500",
  "from-green-700 to-green-600",
  "from-purple-600 to-purple-500",
  "from-rose-500 to-rose-400",
];

// Фолбэк слайды, если в БД пусто
const DEFAULT_SLIDES: Slide[] = [];

const HeroSlider = () => {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Загрузка слайдов из API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/slides');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSlides(data);
          }
        }
      } catch (error) {
        console.log('Using default slides');
      }
    };
    fetchSlides();
  }, []);

  const totalSlides = slides.length;

  // Автоплей
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Обработка свайпов
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Контейнер с отступами для кнопок */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-10">
        {/* На мобильных mx-0, на десктопе mx-5 для кнопок */}
        <div className="relative h-[200px] md:h-[320px] md:mx-5">
          {/* Слайдер с закруглениями */}
          <div className="absolute inset-0 rounded-xl md:rounded-2xl overflow-hidden">
            {/* Слайды */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-500 ease-in-out bg-gradient-to-r ${SLIDE_COLORS[index % SLIDE_COLORS.length]} ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div className="h-full flex items-center px-4 md:px-12">
                  <div className="max-w-xl text-white">
                    {/* Иконка - меньше на мобильных */}
                    <div className="text-2xl md:text-5xl mb-2 md:mb-4">{slide.emoji}</div>
                    {/* Заголовок - компактнее на мобильных */}
                    <h2 className="text-lg md:text-4xl font-bold mb-1 md:mb-3">
                      {slide.title}
                    </h2>
                    {/* Подзаголовок - скрыт на очень маленьких экранах, обрезан на мобильных */}
                    <p className="text-xs md:text-lg text-white/90 mb-3 md:mb-6 line-clamp-1 md:line-clamp-2">
                      {slide.description}
                    </p>
                    {/* Кнопка - компактнее на мобильных */}
                    {slide.buttonLink && slide.buttonText && (
                      <Link
                        href={slide.buttonLink}
                        className="inline-block bg-white text-gray-800 font-semibold px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        {slide.buttonText}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Декоративные элементы - только на десктопе */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-20">
                  <div className="text-[200px]">{slide.emoji}</div>
                </div>
              </div>
            ))}

            {/* Индикаторы - выше на мобильных чтобы не перекрывались кнопкой */}
            <div className="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Слайд ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Стрелки навигации - ТОЛЬКО на десктопе (md+), на мобильных свайп */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg hover:bg-gray-50 rounded-full items-center justify-center text-gray-700 transition-all hover:scale-110 z-20"
            aria-label="Предыдущий слайд"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg hover:bg-gray-50 rounded-full items-center justify-center text-gray-700 transition-all hover:scale-110 z-20"
            aria-label="Следующий слайд"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
