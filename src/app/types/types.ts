// ==================== ТИПЫ ДЛЯ СТРОЙ ДОМ ====================

// ==================== КАТЕГОРИИ ====================

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  categoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// ==================== ТОВАРЫ ====================

// Основной интерфейс товара (совместим с MenuData.tsx)
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
  
  // Цены (один из вариантов)
  price?: number;                  // Фиксированная цена
  pricesBySize?: Record<string, number>;  // Цены по размерам: {"1.5м": 800, "2м": 1000}
  sizeText?: string;               // "Выберите длину:"
  
  // Дополнительно
  unit?: string;                   // "шт", "м", "кг"
  brand?: string;                  // "Knauf", "Ceresit"
  inStock?: boolean | null;        // В наличии
  isWeight?: boolean | null;       // Для весовых товаров (краска, эмаль и т.д.)
  quantityStep?: number;           // Шаг изменения количества (для весовых товаров)
  minQuantity?: number;            // Минимальное количество для заказа
}

// ==================== КОРЗИНА ====================

export interface CartItem {
  productId: string;               // UUID товара
  title: string;                   // Название товара
  urlId: string;                   // URL-идентификатор
  image?: string | null;
  price: number;
  size?: string;                   // Выбранный размер (если есть)
  quantity: number;
  unit?: string;
  mainCategory: string;
  subCategory: string;
  categorySlug?: string;           // Slug категории для URL
  subcategorySlug?: string;        // Slug подкатегории для URL
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ==================== ЗАКАЗ ====================

export interface OrderFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  comment?: string;
  deliveryType: 'pickup' | 'delivery';
}

// ==================== КОНТАКТНАЯ ФОРМА ====================

export interface CreateContactRequestData {
  name: string;
  phone: string;
  message?: string;
}

export interface Order {
  id: number;
  items: CartItem[];
  customer: OrderFormData;
  totalPrice: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

// ==================== БЛОГ ====================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  image?: string;
  publishedAt: string;
  isPublished: boolean;
}

// ==================== АКЦИИ ====================

export interface Promotion {
  id: number;
  slug: string;
  title: string;
  description: string;
  image?: string;
  discountPercent?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

// ==================== ОТЗЫВЫ ====================

export interface Review {
  id: number;
  author: string;
  text: string;
  rating: number;           // 1-5
  createdAt: string;
  isApproved: boolean;
}

// ==================== СЛАЙДЕР ====================

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  sortOrder?: number;
}

// ==================== КОНТАКТЫ ====================

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  phones?: string[];
  email?: string;
  workingHours: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ==================== НАВИГАЦИЯ ====================

export interface NavLink {
  name: string;
  href: string;
  icon?: string;
}

export interface MenuCategory {
  name: string;
  slug: string;
  href: string;
  icon?: string;
  image?: string;
  subcategories: MenuSubcategory[];
}

export interface MenuSubcategory {
  name: string;
  slug: string;
  href: string;
  image?: string;
}
