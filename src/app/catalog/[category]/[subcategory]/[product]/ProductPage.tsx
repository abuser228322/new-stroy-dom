'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import type { Product } from '@/app/types/types';

interface ProductPageProps {
  product: Product;
  category: { id: number; slug: string; name: string };
  subcategory: { id: number; slug: string; name: string };
  relatedProducts: Product[];
}

export default function ProductPage({ product, category, subcategory, relatedProducts }: ProductPageProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.pricesBySize ? Object.keys(product.pricesBySize)[0] : undefined
  );
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [isAdded, setIsAdded] = useState(false);

  // Получаем текущую цену - реактивно пересчитывается при изменении selectedSize
  // Если есть pricesBySize - используем его, иначе берём базовую цену
  const price = useMemo(() => {
    if (product.pricesBySize && selectedSize && product.pricesBySize[selectedSize] != null) {
      return product.pricesBySize[selectedSize];
    }
    if (product.price != null) return product.price;
    return null;
  }, [product.price, product.pricesBySize, selectedSize]);

  const totalPrice = price ? price * quantity : null;

  // Шаг изменения количества
  const step = product.quantityStep || 1;
  const minQty = product.minQuantity || 1;

  // Изменение количества
  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta * step;
    if (newQty >= minQty) {
      setQuantity(Math.round(newQty * 100) / 100);
    }
  };

  // Добавление в корзину
  const handleAddToCart = () => {
    if (price === null) return;
    
    addItem({
      productId: product.id,
      title: product.title,
      urlId: product.urlId,
      image: product.image,
      price,
      size: selectedSize,
      quantity,
      unit: product.unit,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Форматирование цены
  const formatPrice = (p: number) => p.toLocaleString('ru-RU');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Хлебные крошки - компактные */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
          <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="shrink-0">
              <Link href="/catalog" className="text-gray-400 hover:text-sky-600 transition-colors" itemProp="item">
                <span itemProp="name">Каталог</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li className="text-gray-300 shrink-0">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="shrink-0">
              <Link 
                href={`/catalog/${category.slug}`} 
                className="text-gray-400 hover:text-sky-600 transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{category.name}</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li className="text-gray-300 shrink-0">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="shrink-0">
              <Link 
                href={`/catalog/${category.slug}/${subcategory.slug}`} 
                className="text-gray-400 hover:text-sky-600 transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{subcategory.name}</span>
              </Link>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </div>
      </nav>

      {/* Основной контент */}
      <article className="max-w-7xl mx-auto px-4 py-4 sm:py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          
          {/* Изображение */}
          <div className="relative aspect-square bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 sm:p-6 lg:p-8"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg className="w-20 h-20 sm:w-24 sm:h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Бейджи */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.inStock === false && (
                <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  Нет в наличии
                </span>
              )}
              {product.brand && (
                <span className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {product.brand}
                </span>
              )}
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="flex flex-col gap-4 sm:gap-5">
            
            {/* Заголовок */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* Статус наличия */}
            <div className="flex items-center gap-2 text-sm">
              {product.inStock !== false ? (
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  В наличии
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-500 font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Нет в наличии
                </span>
              )}
            </div>

            {/* Выбор размера */}
            {product.pricesBySize && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{product.sizeText || 'Выберите:'}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.pricesBySize).map(([size, sizePrice]) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {size} — {formatPrice(sizePrice)} ₽
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Блок цены */}
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-gray-200">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-0.5">Цена за {product.unit || 'шт'}</p>
                  {price !== null ? (
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {formatPrice(price)} <span className="text-base sm:text-lg text-gray-400">₽</span>
                    </p>
                  ) : (
                    <p className="text-lg text-gray-500">Цена по запросу</p>
                  )}
                </div>
                {totalPrice !== null && quantity > 1 && (
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Сумма</p>
                    <p className="text-lg sm:text-xl font-bold text-sky-600">
                      {formatPrice(totalPrice)} ₽
                    </p>
                  </div>
                )}
              </div>

              {/* Количество и кнопка корзины */}
              <div className="flex gap-3">
                {/* Количество */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= minQty}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 sm:w-14 text-center font-medium text-gray-900 text-sm">
                    {quantity} {product.unit || 'шт'}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Кнопка в корзину */}
                <button
                  onClick={handleAddToCart}
                  disabled={price === null || product.inStock === false}
                  className={`flex-1 h-10 sm:h-11 px-4 sm:px-6 rounded-lg font-medium text-white text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                    isAdded
                      ? 'bg-green-500'
                      : price === null || product.inStock === false
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600 active:scale-[0.98]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Добавлено</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      В корзину
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Кнопки связи */}
            <div className="flex gap-2 sm:gap-3">
              <a
                href="tel:+79371333366"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Позвонить
              </a>
              <a
                href="https://wa.me/79371333366"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-green-200 bg-green-50 rounded-lg text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            {/* Гарантии */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 bg-white rounded-lg border border-gray-100 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Гарантия</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 bg-white rounded-lg border border-gray-100 text-center">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Возврат</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 bg-white rounded-lg border border-gray-100 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Доставка</p>
              </div>
            </div>

            {/* Описание */}
            {product.description && (
              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Описание</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Характеристики */}
            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Характеристики</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <dt className="text-gray-500">Категория</dt>
                  <dd className="font-medium text-gray-900">{category.name}</dd>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <dt className="text-gray-500">Подкатегория</dt>
                  <dd className="font-medium text-gray-900">{subcategory.name}</dd>
                </div>
                {product.unit && (
                  <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <dt className="text-gray-500">Единица</dt>
                    <dd className="font-medium text-gray-900">{product.unit}</dd>
                  </div>
                )}
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <dt className="text-gray-500">Артикул</dt>
                  <dd className="font-medium text-gray-900 font-mono text-xs">{product.urlId}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Похожие товары */}
        {relatedProducts.length > 0 && (
          <section className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Похожие товары
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct}
                  categorySlug={category.slug}
                  subcategorySlug={subcategory.slug}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}

// Карточка похожего товара
function RelatedProductCard({ product, categorySlug, subcategorySlug }: { 
  product: Product; 
  categorySlug: string;
  subcategorySlug: string;
}) {
  const getPrice = () => {
    if (product.price) return product.price;
    if (product.pricesBySize) {
      return Math.min(...Object.values(product.pricesBySize));
    }
    return null;
  };

  const price = getPrice();
  const productUrl = `/catalog/${categorySlug}/${subcategorySlug}/${product.urlId}`;

  return (
    <Link 
      href={productUrl}
      className="group bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-2 sm:p-3"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {product.title}
        </h3>
        {price !== null ? (
          <p className="mt-1.5 text-sm sm:text-base font-bold text-gray-900">
            {product.pricesBySize ? 'от ' : ''}{price.toLocaleString('ru-RU')} ₽
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-500">Цена по запросу</p>
        )}
      </div>
    </Link>
  );
}
