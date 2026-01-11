/**
 * Типы для корзины и заказов
 */

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

// ==================== ЗАКАЗЫ ====================

export interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: 'pickup_rybinskaya' | 'pickup_svobody' | 'delivery';
  deliveryAddress?: string;
  deliveryComment?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  customerComment?: string;
  couponCode?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatusType;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryPrice: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryType: DeliveryTypeValue;
  deliveryAddress?: string | null;
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
  | 'pickup_rybinskaya'  // Самовывоз Рыбинская
  | 'pickup_svobody'     // Самовывоз Свободы
  | 'delivery';          // Доставка

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
