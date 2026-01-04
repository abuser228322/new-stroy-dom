'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SearchProduct {
  id: string;
  urlId: string;
  title: string;
  image?: string | null;
  price?: number;
  pricesBySize?: Record<string, number>;
  unit?: string;
  mainCategory: string;
  subCategory: string;
  categorySlug?: string;
  subcategorySlug?: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

export default function SearchBar({ className = '', placeholder = 'Поиск товаров...', onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounced поиск
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.products || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Обработка изменения инпута
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Debounce запросов
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300);
  };

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        closeSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const product = results[selectedIndex];
          navigateToProduct(product);
        } else if (results.length > 0) {
          // Переходим на первый товар
          navigateToProduct(results[0]);
        }
        break;
      case 'Escape':
        closeSearch();
        break;
    }
  };

  // Переход на страницу товара
  const navigateToProduct = (product: SearchProduct) => {
    const url = product.categorySlug && product.subcategorySlug
      ? `/catalog/${product.categorySlug}/${product.subcategorySlug}/${product.urlId}`
      : `/product/${product.urlId}`;
    router.push(url);
    closeSearch();
  };

  // Закрытие поиска
  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    onClose?.();
  };

  // Клик вне компонента закрывает дропдаун
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Получение цены товара
  const getProductPrice = (product: SearchProduct): string => {
    if (product.price) {
      return `${product.price.toLocaleString('ru-RU')} ₽`;
    }
    if (product.pricesBySize) {
      const prices = Object.values(product.pricesBySize);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return `от ${minPrice.toLocaleString('ru-RU')} ₽`;
      }
    }
    return 'Цена по запросу';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Поле поиска */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 sm:h-11 pl-10 pr-10 text-sm sm:text-base rounded-lg border border-gray-200 
                     bg-gray-50 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 
                     outline-none transition-all placeholder:text-gray-400"
        />
        
        {/* Иконка поиска */}
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>

        {/* Индикатор загрузки / Кнопка очистки */}
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Выпадающий список результатов */}
      {isOpen && (
        <div 
          className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden overflow-y-auto"
          style={isMobile ? {
            position: 'fixed',
            left: '8px',
            right: '8px',
            top: '60px',
            maxHeight: '60vh',
            zIndex: 9999
          } : {
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: '8px',
            maxHeight: '70vh',
            zIndex: 60
          }}
        >
          {results.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-50">
                {results.map((product, index) => (
                  <li key={product.id}>
                    <button
                      onClick={() => navigateToProduct(product)}
                      className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 text-left transition-colors ${
                        index === selectedIndex 
                          ? 'bg-sky-50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Изображение товара */}
                      <div className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Информация о товаре */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate hidden sm:block">
                          {product.mainCategory}
                        </p>
                      </div>

                      {/* Цена */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-sky-600 whitespace-nowrap">
                          {getProductPrice(product)}
                        </p>
                        {product.unit && (
                          <p className="text-xs text-gray-400">/ {product.unit}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-4 py-6 sm:py-8 text-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-sm sm:text-base">Товары не найдены</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Попробуйте изменить запрос</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
