import type { LucideIcon } from 'lucide-react';

// Типы материалов
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

// Конкретные продукты с реальным расходом
export interface ProductOption {
  id: string;
  productId?: number;        // Реальный ID товара в БД
  urlId?: string;            // URL ID товара
  name: string;
  consumption: number;       // Расход на единицу
  consumptionUnit: string;   // Единица расхода (кг/м² при 10мм, л/м² и т.д.)
  bagWeight?: number;        // Вес мешка/объём упаковки
  price?: number;            // Цена за упаковку
  tooltip?: string;          // Подсказка
  // Данные для корзины (из реального товара)
  categorySlug?: string;
  subcategorySlug?: string;
  categoryName?: string;
  subcategoryName?: string;
  image?: string | null;
  // Устаревшее (для локальных данных)
  productUrlId?: string;
  catalogProductId?: number;
  // Дополнительные поля
  pricesBySize?: Record<string, number> | null;
  sizeText?: string | null;
  unit?: string | null;
}

export interface MaterialConfig {
  name: string;
  description: string;
  icon: string;
  products: ProductOption[];
  inputs: InputConfig[];
  calculate: (values: Record<string, number>, product: ProductOption) => CalculationResult;
}

export interface InputConfig {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

export interface CalculationResult {
  amount: number;
  unit: string;
  totalWeight?: number;
  details: string;
  estimatedPrice?: number;
  recommendations?: string[];
}

// Интерфейсы для данных из API
export interface ApiProduct {
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

export interface ApiInput {
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

export interface ApiFormula {
  id: number;
  formulaType: string;
  formulaParams: Record<string, any>;
  resultUnit: string;
  resultUnitTemplate: string | null;
  recommendationsTemplate: any;
}

export interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  isActive: boolean;
  products: ApiProduct[];
  inputs: ApiInput[];
  formula: ApiFormula | null;
}

// Пропсы для компонентов
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
  products: ProductOption[];
  selectedProduct: ProductOption;
  productSizes: Array<{ size: string; price: number }>;
  selectedSize: string | undefined;
  onProductChange: (productId: string) => void;
  onSizeChange: (size: string) => void;
}

export interface InputFieldsProps {
  inputs: InputConfig[];
  currentValues: Record<string, number>;
  onValueChange: (key: string, value: number) => void;
}

export interface ResultCardProps {
  result: CalculationResult;
  canAddToCart: boolean;
  addedToCart: boolean;
  onAddToCart: () => void;
  amount: number;
  unit: string;
}
