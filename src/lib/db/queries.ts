// Серверные функции для получения данных из БД
// Используются в Server Components (страницах каталога)
import { db } from "@/lib/db";
import { categories, subcategories, products } from "@/lib/db/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";

// ==================== КАТЕГОРИИ ====================

export async function getAllCategories() {
  try {
    const allCategories = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      with: {
        subcategories: {
          where: eq(subcategories.isActive, true),
          orderBy: [asc(subcategories.sortOrder)],
        },
      },
      orderBy: [asc(categories.sortOrder)],
    });

    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.slug, slug),
        eq(categories.isActive, true)
      ),
      with: {
        subcategories: {
          where: eq(subcategories.isActive, true),
          orderBy: [asc(subcategories.sortOrder)],
        },
      },
    });

    return category || null;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
}

// ==================== ПОДКАТЕГОРИИ ====================

export async function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string) {
  try {
    // Сначала находим категорию
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });

    if (!category) return null;

    const subcategory = await db.query.subcategories.findFirst({
      where: and(
        eq(subcategories.slug, subcategorySlug),
        eq(subcategories.categoryId, category.id),
        eq(subcategories.isActive, true)
      ),
      with: {
        category: true,
      },
    });

    return subcategory || null;
  } catch (error) {
    console.error("Error fetching subcategory by slug:", error);
    return null;
  }
}

export async function getSubcategoriesByCategorySlug(categorySlug: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });

    if (!category) return [];

    const allSubcategories = await db.query.subcategories.findMany({
      where: and(
        eq(subcategories.categoryId, category.id),
        eq(subcategories.isActive, true)
      ),
      orderBy: [asc(subcategories.sortOrder)],
    });

    return allSubcategories;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

// ==================== ТОВАРЫ ====================

export interface ProductFilter {
  categorySlug?: string;
  subcategorySlug?: string;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filter: ProductFilter = {}) {
  try {
    const { categorySlug, subcategorySlug, inStock, search, page = 1, limit = 50 } = filter;
    const offset = (page - 1) * limit;

    // Начинаем с базового условия
    const conditions = [eq(products.isActive, true)];

    // Получаем ID категории по slug
    let categoryId: number | undefined;
    if (categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (category) {
        categoryId = category.id;
        conditions.push(eq(products.categoryId, categoryId));
      } else {
        return { products: [], total: 0, totalPages: 0 };
      }
    }

    // Получаем ID подкатегории по slug
    if (subcategorySlug && categoryId) {
      const subcategory = await db.query.subcategories.findFirst({
        where: and(
          eq(subcategories.slug, subcategorySlug),
          eq(subcategories.categoryId, categoryId)
        ),
      });
      if (subcategory) {
        conditions.push(eq(products.subcategoryId, subcategory.id));
      } else {
        return { products: [], total: 0, totalPages: 0 };
      }
    }

    // Фильтр по наличию
    if (inStock !== undefined) {
      conditions.push(eq(products.inStock, inStock));
    }

    const whereClause = and(...conditions);

    // Запрос товаров
    const [allProducts, countResult] = await Promise.all([
      db.query.products.findMany({
        where: whereClause,
        with: {
          category: true,
          subcategory: true,
        },
        orderBy: [asc(products.sortOrder), desc(products.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Преобразуем в формат для фронтенда
    const formattedProducts = allProducts.map(product => ({
      id: product.id.toString(),
      urlId: product.urlId,
      title: product.title,
      description: product.description,
      image: product.image,
      mainCategory: product.category?.name || "",
      subCategory: product.subcategory?.name || "",
      categorySlug: product.category?.slug || "",
      subcategorySlug: product.subcategory?.slug || "",
      price: product.price ? parseFloat(product.price) : undefined,
      pricesBySize: product.pricesBySize as Record<string, number> | undefined,
      sizeText: product.sizeText || undefined,
      unit: product.unit || "шт",
      brand: product.brand || undefined,
      inStock: product.inStock,
      isWeight: product.isWeight,
      quantityStep: product.quantityStep ? parseFloat(product.quantityStep) : undefined,
      minQuantity: product.minQuantity ? parseFloat(product.minQuantity) : undefined,
    }));

    return { products: formattedProducts, total, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

export async function getProductByUrlId(urlId: string) {
  try {
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.urlId, urlId),
        eq(products.isActive, true)
      ),
      with: {
        category: true,
        subcategory: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id.toString(),
      urlId: product.urlId,
      title: product.title,
      description: product.description,
      image: product.image,
      mainCategory: product.category?.name || "",
      subCategory: product.subcategory?.name || "",
      categorySlug: product.category?.slug || "",
      subcategorySlug: product.subcategory?.slug || "",
      price: product.price ? parseFloat(product.price) : undefined,
      pricesBySize: product.pricesBySize as Record<string, number> | undefined,
      sizeText: product.sizeText || undefined,
      unit: product.unit || "шт",
      brand: product.brand || undefined,
      inStock: product.inStock,
      isWeight: product.isWeight,
      quantityStep: product.quantityStep ? parseFloat(product.quantityStep) : undefined,
      minQuantity: product.minQuantity ? parseFloat(product.minQuantity) : undefined,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Типы для экспорта
export type DBCategory = Awaited<ReturnType<typeof getCategoryBySlug>>;
export type DBSubcategory = Awaited<ReturnType<typeof getSubcategoryBySlug>>;
export type DBProduct = NonNullable<Awaited<ReturnType<typeof getProductByUrlId>>>;
