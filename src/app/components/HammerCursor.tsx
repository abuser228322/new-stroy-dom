'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Компонент кастомного курсора-молотка с анимацией удара при клике.
 * 
 * Для работы нужны два изображения в public/:
 * - /hammer.png — обычное положение молотка
 * - /hammer-hit.png — молоток в положении удара (опущен/повёрнут)
 * 
 * Если hammer-hit.png нет, анимация всё равно будет работать через CSS transform.
 */
export default function HammerCursor() {
  const [isHitting, setIsHitting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Отслеживаем позицию мыши
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  // Анимация удара при клике
  const handleMouseDown = useCallback(() => {
    setIsHitting(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    // Небольшая задержка перед возвратом в исходное положение
    setTimeout(() => setIsHitting(false), 100);
  }, []);

  // Скрываем когда мышь уходит с окна
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Скрываем системный курсор через CSS (уже сделано в globals.css)
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave, handleMouseEnter]);

  // На тач-устройствах не показываем кастомный курсор
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-[9999] hidden lg:block"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-8px, -8px) rotate(${isHitting ? '25deg' : '0deg'})`,
        transition: 'transform 0.08s ease-out',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hammer.png"
        alt=""
        width={25}
        height={25}
        className="select-none"
        style={{
          imageRendering: 'crisp-edges',
        }}
        draggable={false}
      />
    </div>
  );
}
