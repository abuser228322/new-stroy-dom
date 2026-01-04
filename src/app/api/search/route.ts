import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, subcategories } from "@/lib/db/schema";
import { eq, and, or, ilike, sql, asc, desc } from "drizzle-orm";

// GET /api/search - поиск товаров
// Параметры:
// - q: поисковый запрос (обязательный)
// - limit: количество результатов (по умолчанию 8)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const queryLower = query.toLowerCase();

    // Поиск по названию и описанию (case-insensitive)
    const searchResults = await db.query.products.findMany({
      where: and(
        eq(products.isActive, true),
        or(
          ilike(products.title, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(products.brand, `%${query}%`)
        )
      ),
      with: {
        category: true,
        subcategory: true,
      },
      orderBy: [
        // Приоритет: 
        // 0 - название начинается с запроса (арматура при поиске "армат")
        // 1 - слово в названии начинается с запроса 
        // 2 - запрос содержится где-то в названии
        // 3 - остальное (в описании/бренде)
        sql`CASE 
          WHEN LOWER(${products.title}) LIKE ${queryLower + '%'} THEN 0
          WHEN LOWER(${products.title}) LIKE ${'% ' + queryLower + '%'} THEN 1
          WHEN LOWER(${products.title}) LIKE ${'%' + queryLower + '%'} THEN 2
          ELSE 3 
        END`,
        asc(products.sortOrder),
        desc(products.createdAt),
      ],
      limit,
    });

    // Преобразуем для фронтенда
    const formattedProducts = searchResults.map(product => ({
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
      unit: product.unit || "шт",
      brand: product.brand || undefined,
      inStock: product.inStock,
    }));

    return NextResponse.json({
      products: formattedProducts,
      query,
      total: formattedProducts.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Ошибка поиска", products: [] },
      { status: 500 }
    );
  }
}
