'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import type { 
  MaterialCalculatorProps, 
  MaterialCategory, 
  MaterialConfig,
  ApiCategory 
} from './types';
import { CALCULATOR_CATEGORY_ICONS, MATERIALS_CONFIG } from './config';
import { createCalculateFunction } from './utils';
import CategorySelector from './CategorySelector';
import ProductSelector from './ProductSelector';
import InputFields from './InputFields';
import ResultCard from './ResultCard';

export default function MaterialCalculator({ 
  className = '', 
  alwaysExpanded = false, 
  useDatabase = false 
}: MaterialCalculatorProps) {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | string>('plaster');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [values, setValues] = useState<Record<string, number>>({});
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Состояния для данных из БД
  const [dbCategories, setDbCategories] = useState<ApiCategory[]>([]);
  const [dbLoading, setDbLoading] = useState(useDatabase);
  const [dbError, setDbError] = useState<string | null>(null);

  // Загрузка данных из БД
  useEffect(() => {
    if (!useDatabase) return;
    
    const fetchData = async () => {
      try {
        setDbLoading(true);
        const res = await fetch('/api/calculator');
        if (!res.ok) throw new Error('Failed to fetch calculator data');
        const data = await res.json();
        
        if (data.length > 0) {
          setDbCategories(data);
          setSelectedCategory(data[0].slug);
        } else {
          setDbError('Данные калькулятора не найдены в базе');
        }
      } catch (error) {
        console.error('Error fetching calculator data:', error);
        setDbError('Ошибка загрузки данных');
      } finally {
        setDbLoading(false);
      }
    };
    
    fetchData();
  }, [useDatabase]);

  // Определяем конфиг в зависимости от источника данных
  const { config, categories, isDbMode } = useMemo(() => {
    if (useDatabase && dbCategories.length > 0) {
      const dbCat = dbCategories.find(c => c.slug === selectedCategory);
      if (dbCat) {
        const convertedConfig: MaterialConfig = {
          name: dbCat.name,
          description: dbCat.description || '',
          icon: dbCat.icon,
          products: dbCat.products.map(p => ({
            id: p.id.toString(),
            productId: p.productId,
            urlId: p.urlId,
            name: p.name,
            consumption: p.consumption,
            consumptionUnit: p.consumptionUnit,
            bagWeight: p.bagWeight || undefined,
            price: p.price,
            pricesBySize: (p.pricesBySize as Record<string, number> | null) ?? null,
            sizeText: p.sizeText || null,
            unit: p.unit || null,
            tooltip: p.tooltip || undefined,
            categorySlug: p.categorySlug,
            subcategorySlug: p.subcategorySlug,
            categoryName: p.categoryName,
            subcategoryName: p.subcategoryName,
            image: p.image,
          })),
          inputs: dbCat.inputs.map(i => ({
            key: i.key,
            label: i.label,
            unit: i.unit,
            defaultValue: i.defaultValue ?? 10,
            min: i.min ?? 1,
            max: i.max ?? 500,
            step: i.step ?? 1,
            tooltip: i.tooltip || undefined,
          })),
          calculate: createCalculateFunction(dbCat.formula),
        };
        return {
          config: convertedConfig,
          categories: dbCategories.map(c => c.slug),
          isDbMode: true,
        };
      }
    }
    
    return {
      config: MATERIALS_CONFIG[selectedCategory as MaterialCategory] || MATERIALS_CONFIG.plaster,
      categories: Object.keys(MATERIALS_CONFIG) as string[],
      isDbMode: false,
    };
  }, [useDatabase, dbCategories, selectedCategory]);
  
  // Выбранный продукт
  const selectedProduct = useMemo(() => {
    return config.products.find(p => p.id === selectedProductId) || config.products[0];
  }, [config, selectedProductId]);

  // Варианты через pricesBySize
  const productSizes = useMemo(() => {
    const pricesBySize = (selectedProduct as any)?.pricesBySize as Record<string, number> | null | undefined;
    if (!pricesBySize) return [] as Array<{ size: string; price: number }>;
    return Object.entries(pricesBySize).map(([size, price]) => ({ size, price }));
  }, [selectedProduct]);

  useEffect(() => {
    if (productSizes.length > 0) {
      setSelectedSize(productSizes[0].size);
    } else {
      setSelectedSize(undefined);
    }
    setAddedToCart(false);
  }, [selectedProductId, productSizes.length]);

  const currentPrice = useMemo(() => {
    const pricesBySize = (selectedProduct as any)?.pricesBySize as Record<string, number> | null | undefined;
    if (pricesBySize && selectedSize && pricesBySize[selectedSize] != null) {
      return pricesBySize[selectedSize];
    }
    if (selectedProduct?.price != null) return selectedProduct.price;
    return undefined;
  }, [selectedProduct, selectedSize]);

  const currentBagWeight = useMemo(() => {
    if (selectedSize) {
      const match = selectedSize.match(/(\d+(?:\.\d+)?)\s*(кг|л|м²|мм)?/i);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    return selectedProduct?.bagWeight || undefined;
  }, [selectedProduct, selectedSize]);

  const productForCalc = useMemo(() => {
    return { 
      ...selectedProduct, 
      price: currentPrice,
      bagWeight: currentBagWeight,
    } as typeof selectedProduct;
  }, [selectedProduct, currentPrice, currentBagWeight]);

  // Текущие значения с дефолтами
  const currentValues = useMemo(() => {
    const defaults: Record<string, number> = {};
    config.inputs.forEach(input => {
      defaults[input.key] = values[input.key] ?? input.defaultValue;
    });
    return defaults;
  }, [config, values]);

  // Результат расчёта
  const result = useMemo(() => {
    return config.calculate(currentValues, productForCalc);
  }, [config, currentValues, productForCalc]);

  const handleCategoryChange = (category: MaterialCategory | string) => {
    setSelectedCategory(category);
    setSelectedProductId('');
    setValues({});
    setAddedToCart(false);
  };

  const handleValueChange = (key: string, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setAddedToCart(false);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setAddedToCart(false);
  };

  // Добавление в корзину
  const handleAddToCart = () => {
    const urlIdForCart = selectedProduct.urlId || selectedProduct.productUrlId;
    if (!urlIdForCart || currentPrice == null) return;
    
    const productIdForCart = selectedProduct.productId?.toString() 
      || selectedProduct.catalogProductId?.toString() 
      || selectedProduct.id;
    
    const mainCat = selectedProduct.categorySlug || config.name;
    const subCat = selectedProduct.subcategorySlug || config.name;
    
    addItem({
      productId: productIdForCart,
      title: selectedProduct.name,
      urlId: urlIdForCart,
      image: selectedProduct.image || null,
      price: currentPrice,
      size: selectedSize,
      quantity: result.amount,
      unit: result.unit,
      mainCategory: mainCat,
      subCategory: subCat,
      categorySlug: selectedProduct.categorySlug,
      subcategorySlug: selectedProduct.subcategorySlug,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const canAddToCart = !!(
    (selectedProduct.urlId || selectedProduct.productUrlId) && 
    currentPrice != null && 
    result.amount > 0
  );

  const getCategoryInfo = useCallback((slug: string) => {
    const IconComponent = CALCULATOR_CATEGORY_ICONS[slug] || CALCULATOR_CATEGORY_ICONS['default'];
    if (isDbMode) {
      const cat = dbCategories.find(c => c.slug === slug);
      return { name: cat?.name || slug, Icon: IconComponent };
    }
    const localConfig = MATERIALS_CONFIG[slug as MaterialCategory];
    return { name: localConfig?.name || slug, Icon: IconComponent };
  }, [isDbMode, dbCategories]);

  // Загрузка
  if (dbLoading) {
    return (
      <section className={alwaysExpanded ? className : `py-8 lg:py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка калькулятора...</p>
          </div>
        </div>
      </section>
    );
  }

  if (dbError && !isDbMode) {
    console.warn('Calculator: using local data fallback:', dbError);
  }

  return (
    <section className={alwaysExpanded ? className : `py-8 lg:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Заголовок */}
          {alwaysExpanded ? (
            <div className="p-4 sm:p-5 bg-linear-to-r from-sky-500 to-cyan-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-xl sm:text-2xl">Калькулятор материалов</h1>
                  <p className="text-sky-100 text-sm">Точный расчёт на основе данных производителей</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-linear-to-r from-sky-500 to-cyan-500 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-lg sm:text-xl">Калькулятор материалов</h2>
                  <p className="text-sky-100 text-sm">Точный расчёт на основе данных производителей</p>
                </div>
              </div>
              <svg 
                className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {(isExpanded || alwaysExpanded) && (
            <div className="p-4 sm:p-6">
              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={handleCategoryChange}
                getCategoryInfo={getCategoryInfo}
              />

              <ProductSelector
                products={config.products}
                selectedProduct={selectedProduct}
                productSizes={productSizes}
                selectedSize={selectedSize}
                onProductChange={setSelectedProductId}
                onSizeChange={handleSizeChange}
              />

              <InputFields
                inputs={config.inputs}
                currentValues={currentValues}
                onValueChange={handleValueChange}
              />

              <ResultCard
                result={result}
                canAddToCart={canAddToCart}
                addedToCart={addedToCart}
                onAddToCart={handleAddToCart}
                amount={result.amount}
                unit={result.unit}
              />

              {/* Дисклеймер */}
              <p className="mt-4 text-xs text-gray-400 text-center">
                * Расчёт является приблизительным. Точный расход зависит от состояния основания и техники нанесения.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
