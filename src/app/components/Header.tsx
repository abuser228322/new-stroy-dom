'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useCategories, type Category } from '@/hooks/useCategories';

// Статус работы магазина
function StoreStatus() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();
    const currentTime = hours + minutes / 60;
    
    // Новый график: Пн-Сб: 08:00-16:00, Вск: 08:00-14:00
    const isSunday = day === 0;
    
    if (isSunday) {
      setIsOpen(currentTime >= 8 && currentTime < 14);
    } else {
      setIsOpen(currentTime >= 8 && currentTime < 16);
    }
  }, []);
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
      <span className="text-gray-600">Пн-Сб 08:00-16:00, Вск 08:00-14:00</span>
    </div>
  );
}

// Навигационные ссылки
const navLinks = [
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Верхняя строка - контакты и статус */}
      <div className="hidden md:block bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-6">
              <StoreStatus />
              <span className="text-gray-500">г. Астрахань, ул. Рыбинская 25Н</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/policy" className="text-gray-500 hover:text-sky-600 transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основная строка - логотип, навигация, телефон, корзина */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Строй Дом</span>
              <p className="text-xs text-gray-500 hidden sm:block">Стройматериалы в Астрахани</p>
            </div>
          </Link>

          {/* Кнопка Каталог с mega-menu */}
          <div 
            className="relative hidden lg:block"
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

          {/* Навигация - десктоп */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Телефон, избранное, корзина и мобильное меню */}
          <div className="flex items-center gap-2">
            {/* Телефон */}
            <a
              href="tel:+79371333366"
              className="hidden lg:flex items-center gap-2 text-gray-800 hover:text-sky-600 transition-colors mr-2"
            >
              <span className="font-semibold text-sm">8-937-133-33-66</span>
            </a>

            {/* Избранное */}
            <Link
              href="/favorites"
              className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Избранное"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Корзина */}
            <Link
              href="/cart"
              className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Корзина"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-sky-600 transition-colors"
              aria-label="Меню"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              {/* Кнопка каталога в мобильном меню */}
              <Link
                href="/catalog"
                className="flex items-center gap-2 bg-sky-500 text-white font-medium py-3 px-4 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Каталог товаров
              </Link>
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-sky-600 font-medium py-2 px-4 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/policy"
                className="text-gray-500 hover:text-sky-600 py-2 px-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Политика конфиденциальности
              </Link>
              <div className="pt-2 px-4">
                <p className="text-sm text-gray-600">Пн-Сб 08:00-16:00, Вск 08:00-14:00</p>
              </div>
              <a
                href="tel:+79371333366"
                className="flex items-center gap-2 text-sky-600 font-semibold py-2 px-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                8-937-133-33-66
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
