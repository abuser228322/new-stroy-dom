/**
 * Скрипт миграции данных из products.ts в PostgreSQL
 * 
 * Запуск:
 * 1. Убедитесь, что DATABASE_URL установлен в .env.local
 * 2. Выполните: npm run db:generate && npm run db:push
 * 3. Выполните: npm run db:migrate-data
 * 
 * Порядок миграции:
 * 1. Категории (из menuCategories.ts)
 * 2. Подкатегории (из menuCategories.ts)
 * 3. Товары (из products.ts)
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";

// Импортируем схему
import { categories, subcategories, products, type NewCategory, type NewSubcategory, type NewProduct } from "../src/lib/db/schema";

// Импортируем исходные данные
import { menuCategories, type MenuCategory } from "../src/app/mock/menuCategories";
import type { Product as MockProduct } from "../src/app/types/types";

// Динамический импорт products.ts (он использует uuid)
async function getProducts(): Promise<MockProduct[]> {
  const { default: productsData } = await import("../src/app/mock/products");
  return productsData;
}

// Подключение к БД
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL не установлен в .env.local");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// Маппинг названий категорий на ID (заполняется в процессе миграции)
const categoryIdMap = new Map<string, number>();
const subcategoryIdMap = new Map<string, number>(); // key: "categoryName:subcategoryName"

async function migrateCategories(): Promise<void> {
  console.log("\n📁 Миграция категорий...");
  
  for (let i = 0; i < menuCategories.length; i++) {
    const cat = menuCategories[i];
    
    const newCategory: NewCategory = {
      slug: cat.slug,
      name: cat.name,
      shortName: cat.shortName || null,
      icon: cat.icon || null,
      image: cat.image || null,
      sortOrder: i,
      isActive: true,
    };

    try {
      // Проверяем, есть ли уже такая категория
      const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
      
      if (existing.length > 0) {
        console.log(`  ⏭️  Категория "${cat.name}" уже существует (ID: ${existing[0].id})`);
        categoryIdMap.set(cat.name, existing[0].id);
      } else {
        const [inserted] = await db.insert(categories).values(newCategory).returning();
        categoryIdMap.set(cat.name, inserted.id);
        console.log(`  ✅ Категория "${cat.name}" создана (ID: ${inserted.id})`);
      }
    } catch (error) {
      console.error(`  ❌ Ошибка при создании категории "${cat.name}":`, error);
    }
  }
  
  console.log(`\n📊 Всего категорий: ${categoryIdMap.size}`);
}

async function migrateSubcategories(): Promise<void> {
  console.log("\n📂 Миграция подкатегорий...");
  
  for (const cat of menuCategories) {
    const categoryId = categoryIdMap.get(cat.name);
    if (!categoryId) {
      console.error(`  ❌ Категория "${cat.name}" не найдена в маппинге!`);
      continue;
    }

    for (let i = 0; i < cat.subcategories.length; i++) {
      const sub = cat.subcategories[i];
      
      const newSubcategory: NewSubcategory = {
        slug: sub.slug,
        name: sub.name,
        image: sub.image || null,
        categoryId: categoryId,
        sortOrder: i,
        isActive: true,
      };

      try {
        // Проверяем, есть ли уже такая подкатегория в этой категории
        const existing = await db.select().from(subcategories)
          .where(and(
            eq(subcategories.slug, sub.slug),
            eq(subcategories.categoryId, categoryId)
          ));
        
        const mapKey = `${cat.name}:${sub.name}`;
        
        if (existing.length > 0) {
          console.log(`  ⏭️  Подкатегория "${sub.name}" в "${cat.name}" уже существует`);
          subcategoryIdMap.set(mapKey, existing[0].id);
        } else {
          const [inserted] = await db.insert(subcategories).values(newSubcategory).returning();
          subcategoryIdMap.set(mapKey, inserted.id);
          console.log(`  ✅ "${cat.name}" → "${sub.name}" (ID: ${inserted.id})`);
        }
      } catch (error) {
        console.error(`  ❌ Ошибка при создании подкатегории "${sub.name}":`, error);
      }
    }
  }
  
  console.log(`\n📊 Всего подкатегорий: ${subcategoryIdMap.size}`);
}

async function migrateProducts(): Promise<void> {
  console.log("\n📦 Миграция товаров...");
  
  const mockProducts = await getProducts();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of mockProducts) {
    // Получаем ID категории и подкатегории
    const categoryId = categoryIdMap.get(product.mainCategory);
    const subcategoryId = subcategoryIdMap.get(`${product.mainCategory}:${product.subCategory}`);

    if (!categoryId) {
      console.error(`  ❌ Категория "${product.mainCategory}" не найдена для товара "${product.title}"`);
      errors++;
      continue;
    }

    if (!subcategoryId) {
      console.error(`  ❌ Подкатегория "${product.subCategory}" не найдена для товара "${product.title}"`);
      errors++;
      continue;
    }

    const newProduct: NewProduct = {
      urlId: product.urlId,
      title: product.title,
      description: product.description || null,
      image: product.image || null,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      price: product.price?.toString() || null,
      pricesBySize: product.pricesBySize || null,
      sizeText: product.sizeText || null,
      unit: product.unit || "шт",
      brand: product.brand || null,
      inStock: product.inStock ?? true,
      isWeight: product.isWeight ?? false,
      quantityStep: product.quantityStep?.toString() || null,
      minQuantity: product.minQuantity?.toString() || null,
      isActive: true,
    };

    try {
      // Проверяем, есть ли уже такой товар
      const existing = await db.select().from(products).where(eq(products.urlId, product.urlId));
      
      if (existing.length > 0) {
        skipped++;
        // Не логируем каждый пропуск, чтобы не засорять вывод
      } else {
        await db.insert(products).values(newProduct);
        created++;
        
        // Логируем каждый 10-й товар
        if (created % 10 === 0) {
          console.log(`  ✅ Создано ${created} товаров...`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Ошибка при создании товара "${product.title}":`, error);
      errors++;
    }
  }

  console.log(`\n📊 Итого товаров:`);
  console.log(`   ✅ Создано: ${created}`);
  console.log(`   ⏭️  Пропущено (уже существуют): ${skipped}`);
  console.log(`   ❌ Ошибок: ${errors}`);
}

async function main(): Promise<void> {
  console.log("🚀 Начинаем миграцию данных в PostgreSQL...");
  console.log(`📍 Подключение: ${connectionString?.substring(0, 30)}...`);
  
  try {
    // Шаг 1: Категории
    await migrateCategories();
    
    // Шаг 2: Подкатегории
    await migrateSubcategories();
    
    // Шаг 3: Товары
    await migrateProducts();
    
    console.log("\n✅ Миграция завершена успешно!");
  } catch (error) {
    console.error("\n❌ Критическая ошибка миграции:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Запуск
main();
