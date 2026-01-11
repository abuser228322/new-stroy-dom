/**
 * Типы для калькулятора материалов
 */
import type { LucideIcon } from 'lucide-react';

// ==================== КАТЕГОРИИ МАТЕРИАЛОВ ====================

export type MaterialCategory = 
  | 'plaster'      // Штукатурка
  | 'putty'        // Шпатлёвка
  | 'tile_glue'    // Плиточный клей
  | 'floor_mix'    // Смеси для пола
  | 'paint'        // Краска
  | 'primer'       // Грунтовка
  | 'profnastil'   // Профнастил
  | 'gkl'          // Гипсокартон
  | 'insulation';  // Утеплитель

// ==================== ПРОДУКТЫ ====================

export interface CalculatorProductOption {
  id: string;
  productId?: number;        // Реальный ID товара в БД
  urlId?: string;            // URL ID товара
  name: string;
  consumption: number;       // Расход на единицу
  consumptionUnit: string;   // Единица расхода
  bagWeight?: number;        // Вес мешка/объём упаковки
  price?: number;            // Цена за упаковку
  tooltip?: string;          // Подсказка
  
  // Данные для корзины
  categorySlug?: string;
  subcategorySlug?: string;
  categoryName?: string;
  subcategoryName?: string;
  image?: string | null;
  
  // Legacy поля (для локальных данных)
  productUrlId?: string;
  catalogProductId?: number;
  
  // Цены по размерам
  pricesBySize?: Record<string, number> | null;
  sizeText?: string | null;
  unit?: string | null;
}

// ==================== КОНФИГУРАЦИЯ ====================

export interface CalculatorMaterialConfig {
  name: string;
  description: string;
  icon: string;
  products: CalculatorProductOption[];
  inputs: CalculatorInputConfig[];
  calculate: (values: Record<string, number>, product: CalculatorProductOption) => CalculatorResult;
}

export interface CalculatorInputConfig {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

export interface CalculatorResult {
  amount: number;
  unit: string;
  totalWeight?: number;
  details: string;
  estimatedPrice?: number;
  recommendations?: string[];
}

// ==================== API ДАННЫЕ ====================

export interface CalculatorApiProduct {
  id: string;
  productId: number;
  urlId: string;
  name: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight: number | null;
  price: number | undefined;
  pricesBySize?: Record<string, number> | null;
  sizeText?: string | null;
  unit?: string | null;
  tooltip: string | null;
  categorySlug: string;
  subcategorySlug: string;
  categoryName: string;
  subcategoryName: string;
  image: string | null;
  brand: string | null;
  inStock: boolean;
}

export interface CalculatorApiInput {
  id?: number;
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number | null;
  max: number | null;
  step: number;
  tooltip: string | null;
}

export interface CalculatorApiFormula {
  id: number;
  formulaType: string;
  formulaParams: Record<string, any>;
  resultUnit: string;
  resultUnitTemplate: string | null;
  recommendationsTemplate: any;
}

export interface CalculatorApiCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  isActive: boolean;
  products: CalculatorApiProduct[];
  inputs: CalculatorApiInput[];
  formula: CalculatorApiFormula | null;
}

// ==================== ПРОПСЫ КОМПОНЕНТОВ ====================

export interface MaterialCalculatorProps {
  className?: string;
  alwaysExpanded?: boolean;
  useDatabase?: boolean;
}

export interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: MaterialCategory | string) => void;
  getCategoryInfo: (slug: string) => { name: string; Icon: LucideIcon };
}

export interface ProductSelectorProps {
  products: CalculatorProductOption[];
  selectedProduct: CalculatorProductOption;
  productSizes: Array<{ size: string; price: number }>;
  selectedSize: string | undefined;
  onProductChange: (productId: string) => void;
  onSizeChange: (size: string) => void;
}

export interface InputFieldsProps {
  inputs: CalculatorInputConfig[];
  currentValues: Record<string, number>;
  onValueChange: (key: string, value: number) => void;
}

export interface ResultCardProps {
  result: CalculatorResult;
  canAddToCart: boolean;
  addedToCart: boolean;
  onAddToCart: () => void;
  amount: number;
  unit: string;
}
