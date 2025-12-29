import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, subcategories } from "@/lib/db/schema";
import type {} from "@/lib/db/schema";
import { eq, and, asc, desc, like, or, sql } from "drizzle-orm";

// GET /api/products - получить товары с фильтрами
// Параметры:
// - categorySlug: slug категории
// - subcategorySlug: slug подкатегории
// - search: поиск по названию
// - page, limit: пагинация
// - inStock: только в наличии
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const categorySlug = searchParams.get("categorySlug");
    const subcategorySlug = searchParams.get("subcategorySlug");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Строим условия фильтрации
    const conditions = [eq(products.isActive, true)];
    
    // Фильтр по категории (через slug)
    if (categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (category) {
        conditions.push(eq(products.categoryId, category.id));
      } else {
        // Категория не найдена - вернём пустой результат
        return NextResponse.json({
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        });
      }
    }
    
    // Фильтр по подкатегории (через slug)
    if (subcategorySlug && categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (category) {
        const subcategory = await db.query.subcategories.findFirst({
          where: and(
            eq(subcategories.slug, subcategorySlug),
            eq(subcategories.categoryId, category.id)
          ),
        });
        if (subcategory) {
          conditions.push(eq(products.subcategoryId, subcategory.id));
        } else {
          return NextResponse.json({
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
          });
        }
      }
    }
    
    // Фильтр по наличию
    if (inStock === "true") {
      conditions.push(eq(products.inStock, true));
    }
    
    // Поиск
    if (search) {
      conditions.push(
        or(
          like(products.title, `%${search}%`),
          like(products.description, `%${search}%`)
        )!
      );
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

    // Преобразуем данные для фронтенда (совместимость с текущим форматом)
    const formattedProducts = allProducts.map(product => ({
      id: product.id.toString(),
      urlId: product.urlId,
      title: product.title,
      description: product.description,
      image: product.image,
      mainCategory: product.category?.name || "",
      subCategory: product.subcategory?.name || "",
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

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Ошибка при получении товаров" },
      { status: 500 }
    );
  }
}
