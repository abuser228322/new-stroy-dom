/**
 * Типы для API запросов и ответов
 */

// ==================== КАТЕГОРИИ ====================

export interface Category {
  id: number;
  slug: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

// ==================== ТОВАРЫ ====================

export interface Product {
  id: string;                      // UUID идентификатор
  title: string;                   // "МП-20 Коричневый (1150х0.35мм)"
  description?: string | null;     // Описание товара
  image?: string | null;           // Путь к изображению
  mainCategory: string;            // "Профнастил"
  subCategory: string;             // "МП-20"
  urlId: string;                   // URL-идентификатор: "mp-20-korichnevyy"
  categorySlug?: string;           // Slug категории для URL
  subcategorySlug?: string;        // Slug подкатегории для URL
  
  // Цены
  price?: number;                  // Фиксированная цена
  pricesBySize?: Record<string, number> | null;  // Цены по размерам
  sizeText?: string | null;        // "Выберите длину:"
  
  // Дополнительно
  unit?: string;                   // "шт", "м", "кг"
  brand?: string | null;           // "Knauf", "Ceresit"
  inStock?: boolean | null;        // В наличии
  isWeight?: boolean | null;       // Для весовых товаров
  quantityStep?: number;           // Шаг изменения количества
  minQuantity?: number;            // Минимальное количество
}

// ==================== БЛОГ ====================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  publishedAt?: string | Date | null;
  isPublished?: boolean;
}

// ==================== АКЦИИ ====================

export interface Promotion {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  image?: string | null;
  discountPercent?: number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isActive?: boolean;
}

// ==================== СЛАЙДЕР ====================

export interface Slide {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

// ==================== API ОТВЕТЫ ====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== ПОИСК ====================

export interface SearchResult {
  id: string;
  title: string;
  urlId: string;
  image?: string | null;
  price?: number;
  categorySlug: string;
  subcategorySlug: string;
}
