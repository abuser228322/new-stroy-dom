'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useCategories, type Category } from '@/hooks/useCategories';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';
import { formatStoreHoursLines, isStoreOpenNow, RYBINSKAYA_HOURS, SVOBODY_HOURS } from '../lib/storeHours';

function StoreOpenDot({ isOpen }: { isOpen: boolean }) {
  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isOpen ? 'bg-green-500 animate-ping' : 'bg-red-500 animate-pulse'
        }`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
    </span>
  );
}

// Компонент мобильного меню
function MobileMenu({ 
  isOpen, 
  onClose, 
  categories 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  categories: Category[];
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(() => isStoreOpenNow());
  const hoursLines = formatStoreHoursLines();

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

  useEffect(() => {
    const tick = () => setIsStoreOpen(isStoreOpenNow());
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <StoreOpenDot isOpen={isStoreOpen} />
            {hoursLines.monSat}, {hoursLines.sun}
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

// Навигационные ссылки
const navLinks = [
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/blog', label: 'Блог' },
  { href: '/sales', label: 'Акции' },
  { href: '/contacts', label: 'Контакты' },
];

export default function Header() {
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
  }, [activeCategory]);

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
                {navLinks.map((link) => (
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

          {/* Кнопка Каталог с mega-menu */}
          <div 
            className="relative hidden lg:block shrink-0"
            ref={catalogRef}
            onMouseEnter={handleCatalogEnter}
            onMouseLeave={handleCatalogLeave}
          >
            <button 
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
            </button>

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
