import { pgTable, serial, text, numeric, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
