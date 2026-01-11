'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import type { Product, CartItem } from '@/types';

interface ProductCardProps {
  product: Product;
  categorySlug?: string;
  subcategorySlug?: string;
  className?: string;
}

export default function ProductCard({
  product,
  categorySlug,
  subcategorySlug,
  className = '',
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Определяем слаги из товара если не переданы
  const catSlug = categorySlug || product.categorySlug || '';
  const subSlug = subcategorySlug || product.subcategorySlug || '';

  // Получаем размеры и цены из Record<string, number> или одиночной цены
  const sizes = useMemo(() => {
    if (product.pricesBySize && Object.keys(product.pricesBySize).length > 0) {
      return Object.entries(product.pricesBySize).map(([size, price]) => ({ size, price }));
    }
    // Если нет размеров, создаём один с базовой ценой
    return [{ size: product.unit || 'шт', price: product.price || 0 }];
  }, [product.pricesBySize, product.price, product.unit]);

  const currentSize = sizes[selectedSizeIndex];
  const hasMultipleSizes = sizes.length > 1 && product.pricesBySize;

  // Ссылка на товар
  const productUrl = subSlug
    ? `/catalog/${catSlug}/${subSlug}/${product.urlId}`
    : `/catalog/${catSlug}/${product.urlId}`;

  // Обработчик добавления в корзину
  const handleAddToCart = async () => {
    setIsAdding(true);

    const cartItem: CartItem = {
      productId: product.id,
      title: product.title,
      urlId: product.urlId,
      image: product.image,
      price: currentSize.price,
      size: hasMultipleSizes ? currentSize.size : undefined,
      quantity: 1,
      unit: product.unit,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      categorySlug: catSlug,
      subcategorySlug: subSlug,
      storeId: product.storeId || 1,
      storeSlug: product.storeSlug || 'rybinskaya',
      storeName: product.storeName || 'Рыбинская',
    };

    addItem(cartItem);

    // Показываем анимацию успеха
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 300);
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <article
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col ${className}`}
    >
      {/* Изображение */}
      <Link href={productUrl} className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image || '/images/placeholder.jpg'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Статус наличия */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg">
              Нет в наличии
            </span>
          </div>
        )}
      </Link>

      {/* Контент */}
      <div className="flex flex-col grow p-2 sm:p-4">
        {/* Бренд */}
        {product.brand && (
          <span className="text-[10px] sm:text-xs text-sky-600 font-medium mb-1">{product.brand}</span>
        )}

        {/* Название */}
        <Link href={productUrl} className="group/title">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base line-clamp-2 group-hover/title:text-sky-600 transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Выбор размера */}
        {hasMultipleSizes && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {sizes.map((size, index) => (
                <button
                  key={size.size}
                  onClick={() => setSelectedSizeIndex(index)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    index === selectedSizeIndex
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-sky-500'
                  }`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Цена */}
        <div className="mt-auto mb-2 sm:mb-3">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-base sm:text-xl font-bold text-gray-900">
              {formatPrice(currentSize.price)} ₽
            </span>
            {product.unit && !hasMultipleSizes && (
              <span className="text-[10px] sm:text-sm text-gray-500">/ {product.unit}</span>
            )}
          </div>
        </div>

        {/* Кнопка добавления в корзину */}
        <button
          onClick={handleAddToCart}
          disabled={product.inStock === false || isAdding}
          className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            product.inStock === false
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : showSuccess
              ? 'bg-emerald-500 text-white'
              : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98]'
          }`}
        >
          {isAdding ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : showSuccess ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Добавлено
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              В корзину
            </>
          )}
        </button>
      </div>
    </article>
  );
}
