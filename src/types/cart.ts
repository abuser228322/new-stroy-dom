/**
 * Типы для корзины и заказов
 */

// ==================== МАГАЗИНЫ ====================

export interface Store {
  id: number;
  slug: string;
  name: string;
  shortName?: string;
  address: string;
  phone?: string;
  workingHours?: {
    monSat: string;
    sun: string;
  };
  assortmentDescription?: string;
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
  storeId: number;                 // ID магазина
  storeSlug: string;               // Slug магазина (rybinskaya, svobody)
  storeName: string;               // Название магазина для отображения
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ==================== ЗАКАЗЫ ====================

// Данные о способе получения для одной части заказа (один магазин)
export interface OrderPartDeliveryData {
  storeId: number;
  storeSlug: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryComment?: string;
}

export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  customerComment?: string;
  couponCode?: string;
  // Данные доставки для каждого магазина
  partsDelivery: OrderPartDeliveryData[];
}

export interface OrderPart {
  id: number;
  storeId: number;
  store?: Store;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string | null;
  deliveryComment?: string | null;
  subtotal: number;
  deliveryPrice: number;
  partStatus: OrderStatusType;
  items: OrderItem[];
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatusType;
  parts: OrderPart[];
  items: OrderItem[];  // Все items для обратной совместимости
  subtotal: number;
  discount: number;
  deliveryPrice: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  paymentMethod: PaymentMethodValue;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface OrderItem {
  id: number;
  productId: string;
  urlId: string;
  title: string;
  image?: string | null;
  quantity: number;
  price: number;
  size?: string | null;
  unit?: string | null;
  total: number;
  storeId?: number;
  store?: Store;
}

// Типы статусов
export type OrderStatusType = 
  | 'pending'      // Новый
  | 'confirmed'    // Подтверждён
  | 'processing'   // Собирается
  | 'ready'        // Готов
  | 'delivering'   // Доставляется
  | 'completed'    // Выполнен
  | 'cancelled';   // Отменён

export type DeliveryTypeValue = 
  | 'pickup'    // Самовывоз
  | 'delivery'; // Доставка

export type PaymentMethodValue = 
  | 'cash'    // Наличные
  | 'card'    // Карта
  | 'online'; // Онлайн

// ==================== КОНТАКТНАЯ ФОРМА ====================

export interface ContactFormData {
  name: string;
  phone: string;
  message?: string;
}
