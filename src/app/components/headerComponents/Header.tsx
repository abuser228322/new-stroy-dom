'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCategories } from '@/hooks/useCategories';
import UserMenu from '../UserMenu';
import SearchBar from '../SearchBar';
import { formatStoreHoursLines, isStoreOpenNow, RYBINSKAYA_HOURS, SVOBODY_HOURS } from '../../lib/storeHours';
import { StoreOpenDot } from './StoreOpenDot';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS } from './types';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { items } = useCart();
  const { categories: menuCategories, loading: categoriesLoading } = useCategories();
  const catalogRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCatalogEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCatalogOpen(true);
    // При открытии ставим первую категорию активной
    if (!activeCategory && menuCategories.length > 0) {
      setActiveCategory(menuCategories[0].slug);
    }
  }, [activeCategory, menuCategories]);

  const handleCatalogLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsCatalogOpen(false);
      setActiveCategory(null);
    }, 150);
  }, []);

  const handleCategoryHover = useCallback((slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(slug);
  }, []);

  // Находим активную категорию
  const activeCategoryData = menuCategories.find(c => c.slug === activeCategory);

  // Статусы для двух точек
  const [isRybinskajaOpen, setIsRybinskajaOpen] = useState<boolean>(() => isStoreOpenNow(RYBINSKAYA_HOURS));
  const [isSvobodyOpen, setIsSvobodyOpen] = useState<boolean>(() => isStoreOpenNow(SVOBODY_HOURS));
  
  useEffect(() => {
    const tick = () => {
      setIsRybinskajaOpen(isStoreOpenNow(RYBINSKAYA_HOURS));
      setIsSvobodyOpen(isStoreOpenNow(SVOBODY_HOURS));
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  const rybinskajaHours = formatStoreHoursLines(RYBINSKAYA_HOURS);
  const svobodyHours = formatStoreHoursLines(SVOBODY_HOURS);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Верхняя строка - адреса с графиками и навигация (только на lg+) */}
      <div className="hidden lg:block bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-1">
              {/* Адрес 1 с тултипом */}
              <div className="group relative">
                <span className="text-gray-600 cursor-help flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                  <StoreOpenDot isOpen={isRybinskajaOpen} />
                  ул. Рыбинская 25Н
                </span>
                <div className="absolute left-0 top-full mt-1 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-lg">
                  <div className="font-medium mb-1">График работы:</div>
                  <div>{rybinskajaHours.monSat}</div>
                  <div>{rybinskajaHours.sun}</div>
                </div>
              </div>
              <span className="text-gray-300 mx-2">|</span>
              {/* Адрес 2 с тултипом */}
              <div className="group relative">
                <span className="text-gray-600 cursor-help flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                  <StoreOpenDot isOpen={isSvobodyOpen} />
                  пл. Свободы 14К
                </span>
                <div className="absolute left-0 top-full mt-1 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-lg">
                  <div className="font-medium mb-1">График работы:</div>
                  <div>{svobodyHours.monSat}</div>
                  <div>{svobodyHours.sun}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Навигационные ссылки */}
              <nav className="flex items-center gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:text-sky-600 font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <span className="text-gray-300">|</span>
              <Link href="/policy" className="text-gray-500 hover:text-sky-600 transition-colors text-xs">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основная строка - логотип, каталог, поиск, телефон, корзина */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-2 sm:gap-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg sm:text-xl font-bold text-gray-800">Строй Дом</span>
              <p className="text-xs text-gray-500 hidden md:block">Стройматериалы в Астрахани</p>
            </div>
          </Link>

          {/* Кнопка Каталог с mega-menu - ссылка + dropdown при hover */}
          <div 
            className="relative hidden lg:block shrink-0"
            ref={catalogRef}
            onMouseEnter={handleCatalogEnter}
            onMouseLeave={handleCatalogLeave}
          >
            <Link 
              href="/catalog"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                isCatalogOpen 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-sky-500 text-white hover:bg-sky-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Каталог
              <svg className={`w-4 h-4 transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Mega-menu - две колонки */}
            {isCatalogOpen && (
              <div 
                className="absolute left-0 top-full pt-2 z-50"
                onMouseEnter={handleCatalogEnter}
                onMouseLeave={handleCatalogLeave}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 flex" style={{ width: '720px' }}>
                  {/* Левая колонка - категории */}
                  <div className="w-64 bg-slate-50 rounded-l-xl border-r border-gray-100 py-2">
                    {menuCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/catalog/${category.slug}`}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm transition-all ${
                          activeCategory === category.slug
                            ? 'bg-sky-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onMouseEnter={() => handleCategoryHover(category.slug)}
                      >
                        <span className="font-medium">{category.shortName || category.name}</span>
                        {category.subcategories.length > 0 && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Правая колонка - подкатегории */}
                  <div className="flex-1 p-4">
                    {activeCategoryData && (
                      <>
                        <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                          {activeCategoryData.name}
                        </h3>
                        {activeCategoryData.subcategories.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1">
                            {activeCategoryData.subcategories.map((sub) => (
                              <Link
                                key={sub.slug}
                                href={`/catalog/${activeCategoryData.slug}/${sub.slug}`}
                                className="px-3 py-2 text-sm text-gray-600 hover:bg-sky-50 hover:text-sky-600 rounded transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Нет подкатегорий</p>
                        )}
                        <Link
                          href={`/catalog/${activeCategoryData.slug}`}
                          className="inline-block ml-3 mt-4 text-sm text-sky-600 hover:text-sky-700 font-medium"
                        >
                          Смотреть все →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Поиск товаров - занимает оставшееся место */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <SearchBar placeholder="Найти товары..." />
          </div>

          {/* Телефон, избранное, корзина и мобильное меню */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Телефон */}
            <a
              href="tel:+79371333366"
              className="hidden xl:flex items-center gap-2 text-gray-800 hover:text-sky-600 transition-colors mr-2"
            >
              <span className="font-semibold text-sm">8-937-133-33-66</span>
            </a>

            {/* Избранное */}
            <Link
              href="/favorites"
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Избранное"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Корзина */}
            <Link
              href="/cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Корзина"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Профиль / Вход */}
            <UserMenu />

            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Меню"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        categories={menuCategories}
      />
    </header>
  );
}
