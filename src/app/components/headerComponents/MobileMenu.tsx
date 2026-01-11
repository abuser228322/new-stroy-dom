'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatStoreHoursLines, isStoreOpenNow, RYBINSKAYA_HOURS, SVOBODY_HOURS } from '../../lib/storeHours';
import { StoreOpenDot } from './StoreOpenDot';
import type { MobileMenuProps } from './types';

export function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Блокируем скролл body когда меню открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Меню */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col animate-slideIn">
        {/* Шапка меню */}
        <div className="bg-linear-to-r from-sky-500 to-sky-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Строй Дом</h2>
                <p className="text-sky-100 text-xs">Стройматериалы</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Контент меню со скроллом */}
        <div className="flex-1 overflow-y-auto">
          {/* Каталог */}
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Каталог</p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <div key={category.slug}>
                  <div className="flex items-center">
                    <Link
                      href={`/catalog/${category.slug}`}
                      onClick={onClose}
                      className="flex-1 flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-sm">{category.shortName || category.name}</span>
                    </Link>
                    {category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.slug)}
                        className="p-2.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${expandedCategory === category.slug ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Подкатегории */}
                  {expandedCategory === category.slug && category.subcategories.length > 0 && (
                    <div className="ml-4 pl-3 border-l-2 border-sky-100 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/catalog/${category.slug}/${sub.slug}`}
                          onClick={onClose}
                          className="block px-3 py-2 text-sm text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Разделитель */}
          <div className="h-px bg-gray-100 mx-3" />

          {/* Навигация */}
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Навигация</p>
            <nav className="space-y-1">
              <Link
                href="/blog"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
                <span className="font-medium text-sm">Блог</span>
              </Link>
              <Link
                href="/sales"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium text-sm">Акции</span>
              </Link>
              <Link
                href="/contacts"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-sm">Контакты</span>
              </Link>
              <Link
                href="/policy"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-sm">Политика конфиденциальности</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Нижняя панель */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* График работы обоих магазинов */}
          <div className="space-y-2 mb-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="shrink-0 mt-0.5">
                <StoreOpenDot isOpen={isStoreOpenNow(RYBINSKAYA_HOURS)} />
              </div>
              <div className="text-gray-600">
                <p className="font-medium text-gray-700">Рыбинская, 25Н</p>
                <p>Пн-Сб: 08:00-16:00, Вск: 08:00-14:00</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="shrink-0 mt-0.5">
                <StoreOpenDot isOpen={isStoreOpenNow(SVOBODY_HOURS)} />
              </div>
              <div className="text-gray-600">
                <p className="font-medium text-gray-700">пл. Свободы, 14К</p>
                <p>Пн-Сб: 09:00-19:00, Вск: 10:00-18:00</p>
              </div>
            </div>
          </div>
          <a
            href="tel:+79371333366"
            className="flex items-center justify-center gap-2 w-full bg-sky-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-sky-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            8-937-133-33-66
          </a>
        </div>
      </div>
    </>
  );
}
