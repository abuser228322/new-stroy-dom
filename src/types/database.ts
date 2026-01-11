/**
 * Типы из базы данных (Drizzle)
 * Реэкспорт автоматически сгенерированных типов из schema.ts
 */
export type {
  // Категории
  Category as DBCategory,
  NewCategory,
  Subcategory as DBSubcategory,
  NewSubcategory,
  
  // Товары
  Product as DBProduct,
  NewProduct,
  
  // Пользователи
  User,
  NewUser,
  
  // Сессии
  Session,
  NewSession,
  
  // Купоны
  Coupon,
  NewCoupon,
  CouponUsage,
  NewCouponUsage,
  
  // Калькулятор
  CalculatorCategory,
  NewCalculatorCategory,
  CalculatorProduct,
  NewCalculatorProduct,
  CalculatorInput,
  NewCalculatorInput,
  CalculatorFormula,
  NewCalculatorFormula,
  
  // Блог
  BlogPost as DBBlogPost,
  NewBlogPost,
  
  // Промо и слайды
  Promotion as DBPromotion,
  NewPromotion,
  HeroSlide,
  NewHeroSlide,
  
  // Заказы
  Order as DBOrder,
  NewOrder,
  OrderItem as DBOrderItem,
  NewOrderItem,
} from '@/lib/db/schema';

// Enum типы (значения)
export { 
  userRoleEnum, 
  orderStatusEnum, 
  deliveryTypeEnum, 
  paymentMethodEnum 
} from '@/lib/db/schema';
