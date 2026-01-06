import { pgTable, serial, text, numeric, varchar, timestamp, boolean, integer, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", ["SUPERADMIN", "ADMIN", "MODER", "USER"]);

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
