"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Строительные материалы",
      subtitle: "Профнастил, сухие смеси, гипсокартон, утеплители и крепёж по низким ценам",
      button: {
        text: "Перейти в каталог",
        href: "/catalog",
      },
      bgColor: "from-orange-500 to-orange-400",
      icon: "🏗️"
    },
    {
      id: 2,
      title: "Бесплатная доставка",
      subtitle: "При заказе от 10 000 ₽ доставляем бесплатно по Астрахани и области",
      button: {
        text: "Узнать подробнее",
        href: "/contacts",
      },
      bgColor: "from-sky-600 to-sky-500",
      icon: "🚚"
    },
    {
      id: 3,
      title: "Скидки до 15%",
      subtitle: "Специальные цены для строительных бригад и оптовых покупателей",
      button: {
        text: "Смотреть акции",
        href: "/sales",
      },
      bgColor: "from-green-700 to-green-600",
      icon: "💰"
    },
  ];

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
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="relative h-[280px] md:h-[320px]">
          {/* Слайдер с закруглениями */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {/* Слайды */}
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-500 ease-in-out bg-gradient-to-r ${slide.bgColor} ${
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : index < currentSlide
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              }`}
            >
              <div className="h-full flex items-center px-6 md:px-12">
                <div className="max-w-xl text-white">
                  <div className="text-4xl md:text-6xl mb-4">{slide.icon}</div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-3">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-lg text-white/90 mb-6">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.button.href}
                    className="inline-block bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    {slide.button.text}
                  </Link>
                </div>
              </div>

              {/* Декоративные элементы */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden md:flex items-center justify-center opacity-20">
                <div className="text-[200px]">{slide.icon}</div>
              </div>
            </div>
          ))}

            {/* Индикаторы */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
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

          {/* Стрелки навигации - по краям, наполовину внутри/снаружи */}
          <button
            onClick={prevSlide}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-700 transition-all hover:scale-110 z-20"
            aria-label="Предыдущий слайд"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-700 transition-all hover:scale-110 z-20"
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
