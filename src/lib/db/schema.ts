import { pgTable, serial, text, numeric, varchar, timestamp, boolean, integer, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", ["SUPERADMIN", "ADMIN", "MODER", "USER"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",      // Ожидает подтверждения
  "confirmed",    // Подтверждён
  "processing",   // В обработке
  "ready",        // Готов к выдаче/доставке
  "delivering",   // В доставке
  "completed",    // Завершён
  "cancelled",    // Отменён
]);

// Упрощённый enum для способа получения (без привязки к магазину)
export const deliveryTypeEnum = pgEnum("delivery_type", [
  "pickup",    // Самовывоз (магазин определяется из orderPart.storeId)
  "delivery",  // Доставка
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",       // Наличными при получении
  "card",       // Картой при получении
  "online",     // Онлайн оплата
]);

// ==================== МАГАЗИНЫ ====================

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // rybinskaya, svobody
  name: varchar("name", { length: 255 }).notNull(), // Рыбинская 25Н
  shortName: varchar("short_name", { length: 100 }), // Рыбинская
  address: varchar("address", { length: 500 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  
  // Часы работы
  workingHours: jsonb("working_hours").$type<{
    monSat: string;  // "08:00-16:00"
    sun: string;     // "08:00-14:00"
  }>(),
  
  // Координаты для карты
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  
  // Описание ассортимента
  assortmentDescription: text("assortment_description"), // "Стройматериалы, смеси, профили..."
  
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

// ==================== КАЛЬКУЛЯТОР МАТЕРИАЛОВ ====================

// Категории калькулятора (штукатурка, шпатлёвка, плиточный клей и т.д.)
export const calculatorCategories = pgTable("calculator_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // plaster, putty, tile_glue
  name: varchar("name", { length: 255 }).notNull(), // Штукатурка
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Emoji или иконка
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Поля ввода для категорий калькулятора
export const calculatorInputs = pgTable("calculator_inputs", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => calculatorCategories.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull(), // area, thickness, layers
  label: varchar("label", { length: 255 }).notNull(), // Площадь поверхности
  unit: varchar("unit", { length: 50 }).notNull(), // м², мм, шт
  defaultValue: real("default_value").notNull(),
  minValue: real("min_value").notNull(),
  maxValue: real("max_value"), // Может быть null (без ограничения)
  step: real("step").notNull(),
  tooltip: text("tooltip"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DEPRECATED: Продукты калькулятора - теперь используем products.calculatorCategorySlug
// Таблица оставлена для обратной совместимости, но не используется
export const calculatorProducts = pgTable("calculator_products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => calculatorCategories.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id), // Связь с товаром в каталоге
  
  name: varchar("name", { length: 255 }).notNull(),
  consumption: real("consumption").notNull(),
  consumptionUnit: varchar("consumption_unit", { length: 100 }).notNull(),
  bagWeight: real("bag_weight"),
  price: numeric("price", { precision: 10, scale: 2 }),
  tooltip: text("tooltip"),
  productUrlId: varchar("product_url_id", { length: 255 }),
  
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Формулы расчёта для категорий (хранятся как JSON)
export const calculatorFormulas = pgTable("calculator_formulas", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => calculatorCategories.id, { onDelete: "cascade" }).unique(),
  
  // Тип формулы и параметры
  formulaType: varchar("formula_type", { length: 50 }).notNull(), // standard, paint, profnastil, sheets
  formulaParams: jsonb("formula_params"), // Дополнительные параметры формулы
  
  // Единица результата
  resultUnit: varchar("result_unit", { length: 100 }).notNull(), // мешков, листов, упаковок
  resultUnitTemplate: varchar("result_unit_template", { length: 255 }), // мешков ({bagWeight}кг)
  
  // Рекомендации (шаблоны)
  recommendationsTemplate: jsonb("recommendations_template"), // ["Добавьте 10-15% на неровности"]
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ПОЛЬЗОВАТЕЛИ ====================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  
  // Основные данные
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash"), // null если регистрация через Telegram
  
  // Telegram
  telegramId: varchar("telegram_id", { length: 50 }).unique(),
  telegramUsername: varchar("telegram_username", { length: 100 }),
  
  // Контактные данные
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: boolean("email_verified").default(false),
  phone: varchar("phone", { length: 20 }),
  phoneVerified: boolean("phone_verified").default(false),
  
  // Профиль
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatar: text("avatar"),
  
  // Роль и статус
  role: userRoleEnum("role").default("USER").notNull(),
  isActive: boolean("is_active").default(true),
  
  // Даты
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== СЕССИИ ====================

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== КУПОНЫ ====================

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Тип скидки
  discountType: varchar("discount_type", { length: 20 }).notNull(), // "percent" | "fixed"
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  
  // Ограничения
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscountAmount: numeric("max_discount_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"), // Общее количество использований
  usagePerUser: integer("usage_per_user").default(1), // Использований на пользователя
  usageCount: integer("usage_count").default(0),
  
  // Даты действия
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Статус
  isActive: boolean("is_active").default(true),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ИСПОЛЬЗОВАНИЕ КУПОНОВ ====================

export const couponUsages = pgTable("coupon_usages", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderAmount: numeric("order_amount", { precision: 10, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// ==================== КАТЕГОРИИ ====================

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }), // Для Header
  description: text("description"),
  image: text("image"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ПОДКАТЕГОРИИ ====================

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: text("image"),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ТОВАРЫ ====================

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  urlId: varchar("url_id", { length: 255 }).notNull().unique(), // URL slug товара
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  image: text("image"),
  
  // Связи с категориями
  categoryId: integer("category_id").notNull().references(() => categories.id),
  subcategoryId: integer("subcategory_id").notNull().references(() => subcategories.id),
  
  // Связь с магазином
  storeId: integer("store_id").references(() => stores.id), // null = все магазины (legacy)
  
  // Цены
  price: numeric("price", { precision: 10, scale: 2 }), // Фиксированная цена
  pricesBySize: jsonb("prices_by_size"), // {"1.5м": 800, "2м": 1000}
  sizeText: varchar("size_text", { length: 255 }), // "Выберите длину:"
  
  // Дополнительные поля
  unit: varchar("unit", { length: 50 }).default("шт"),
  brand: varchar("brand", { length: 255 }),
  inStock: boolean("in_stock").default(true),
  isWeight: boolean("is_weight").default(false),
  quantityStep: numeric("quantity_step", { precision: 10, scale: 2 }),
  minQuantity: numeric("min_quantity", { precision: 10, scale: 2 }),
  
  // Поля для калькулятора материалов
  consumption: real("consumption"), // Расход (8.5 кг/м² при 10мм)
  consumptionUnit: varchar("consumption_unit", { length: 100 }), // кг/м²/см, л/м², м²/уп
  bagWeight: real("bag_weight"), // Вес мешка/объём упаковки
  calculatorCategorySlug: varchar("calculator_category_slug", { length: 100 }), // plaster, putty, и т.д.
  
  // Мета
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

// ==================== STORE RELATIONS ====================

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  orderParts: many(orderParts),
}));

// ==================== ТИПЫ ====================

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export type CouponUsage = typeof couponUsages.$inferSelect;
export type NewCouponUsage = typeof couponUsages.$inferInsert;

// ==================== USER RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  couponUsages: many(couponUsages),
  createdCoupons: many(coupons),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [coupons.createdById],
    references: [users.id],
  }),
  usages: many(couponUsages),
}));

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponUsages.userId],
    references: [users.id],
  }),
}));

// ==================== CALCULATOR RELATIONS ====================

export const calculatorCategoriesRelations = relations(calculatorCategories, ({ many, one }) => ({
  products: many(calculatorProducts),
  inputs: many(calculatorInputs),
  formula: one(calculatorFormulas),
}));

export const calculatorProductsRelations = relations(calculatorProducts, ({ one }) => ({
  category: one(calculatorCategories, {
    fields: [calculatorProducts.categoryId],
    references: [calculatorCategories.id],
  }),
  product: one(products, {
    fields: [calculatorProducts.productId],
    references: [products.id],
  }),
}));

export const calculatorInputsRelations = relations(calculatorInputs, ({ one }) => ({
  category: one(calculatorCategories, {
    fields: [calculatorInputs.categoryId],
    references: [calculatorCategories.id],
  }),
}));

export const calculatorFormulasRelations = relations(calculatorFormulas, ({ one }) => ({
  category: one(calculatorCategories, {
    fields: [calculatorFormulas.categoryId],
    references: [calculatorCategories.id],
  }),
}));

// ==================== CALCULATOR TYPES ====================

export type CalculatorCategory = typeof calculatorCategories.$inferSelect;
export type NewCalculatorCategory = typeof calculatorCategories.$inferInsert;

export type CalculatorProduct = typeof calculatorProducts.$inferSelect;
export type NewCalculatorProduct = typeof calculatorProducts.$inferInsert;

export type CalculatorInput = typeof calculatorInputs.$inferSelect;
export type NewCalculatorInput = typeof calculatorInputs.$inferInsert;

export type CalculatorFormula = typeof calculatorFormulas.$inferSelect;
export type NewCalculatorFormula = typeof calculatorFormulas.$inferInsert;

// ==================== СЛАЙДЫ ГЛАВНОЙ СТРАНИЦЫ ====================

export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  buttonText: varchar("button_text", { length: 100 }),
  buttonLink: varchar("button_link", { length: 255 }),
  emoji: varchar("emoji", { length: 50 }).notNull(), // Эмодзи для слайда
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;

// ==================== АКЦИИ ====================

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discount: varchar("discount", { length: 50 }), // "-10%", "Бесплатно", "Низкие цены"
  validUntil: varchar("valid_until", { length: 100 }), // "До конца месяца", "Постоянная акция"
  image: text("image"),
  icon: varchar("icon", { length: 50 }).default('percent'), // percent, truck, gift, calendar, tag
  color: varchar("color", { length: 50 }).default('red'), // red, green, blue, orange, purple
  link: varchar("link", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;

// ==================== БЛОГ ====================

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"), // Краткое описание для карточки
  content: text("content").notNull(), // Полный текст статьи (markdown)
  image: text("image"), // Главное изображение
  category: varchar("category", { length: 100 }), // Категория: советы, новости, обзоры
  tags: text("tags"), // JSON массив тегов
  relatedProductIds: text("related_product_ids"), // JSON массив ID товаров
  authorId: integer("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

// ==================== ЗАКАЗЫ ====================

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  
  // Номер заказа (уникальный, генерируется)
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  
  // Пользователь (может быть null для гостевых заказов)
  userId: integer("user_id").references(() => users.id),
  
  // Контактные данные заказчика
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  
  // Статус заказа (общий)
  status: orderStatusEnum("status").default("pending").notNull(),
  
  // Способ оплаты (один на весь заказ)
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  
  // Суммы
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(), // Сумма товаров
  deliveryPrice: numeric("delivery_price", { precision: 10, scale: 2 }).default("0"), // Общая стоимость доставки
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"), // Скидка
  total: numeric("total", { precision: 10, scale: 2 }).notNull(), // Итого
  
  // Купон
  couponId: integer("coupon_id").references(() => coupons.id),
  couponCode: varchar("coupon_code", { length: 50 }),
  
  // Комментарии
  customerComment: text("customer_comment"), // Комментарий от покупателя
  adminComment: text("admin_comment"), // Внутренний комментарий админа
  
  // Даты
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ЧАСТИ ЗАКАЗА (ПО МАГАЗИНАМ) ====================

export const orderParts = pgTable("order_parts", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  
  // Магазин этой части заказа
  storeId: integer("store_id").notNull().references(() => stores.id),
  
  // Способ получения для этой части (text в БД для совместимости)
  deliveryType: text("delivery_type").notNull(), // pickup или delivery
  
  // Адрес доставки (только если deliveryType = delivery)
  deliveryAddress: text("delivery_address"),
  deliveryComment: text("delivery_comment"),
  
  // Суммы этой части
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryPrice: numeric("delivery_price", { precision: 10, scale: 2 }).default("0"),
  
  // Статус этой части (может отличаться от общего статуса заказа)
  partStatus: orderStatusEnum("part_status").default("pending").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  orderPartId: integer("order_part_id").references(() => orderParts.id, { onDelete: "cascade" }),
  
  // Товар (может быть null если товар удалён)
  productId: integer("product_id").references(() => products.id),
  
  // Магазин товара (дублируем для быстрого доступа)
  storeId: integer("store_id").references(() => stores.id),
  
  // Данные товара на момент заказа (сохраняем для истории)
  urlId: varchar("url_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  image: text("image"),
  
  // Количество и цены
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Цена за единицу
  size: varchar("size", { length: 100 }), // Выбранный размер/вариант
  unit: varchar("unit", { length: 50 }), // Единица измерения (шт, м², кг)
  
  // Итого по позиции
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ORDER RELATIONS ====================

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  parts: many(orderParts),
  items: many(orderItems),
}));

export const orderPartsRelations = relations(orderParts, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderParts.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [orderParts.storeId],
    references: [stores.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  orderPart: one(orderParts, {
    fields: [orderItems.orderPartId],
    references: [orderParts.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [orderItems.storeId],
    references: [stores.id],
  }),
}));

// ==================== ORDER TYPES ====================

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderPart = typeof orderParts.$inferSelect;
export type NewOrderPart = typeof orderParts.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
