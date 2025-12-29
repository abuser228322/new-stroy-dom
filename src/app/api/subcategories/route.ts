import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subcategories, categories } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/subcategories - получить подкатегории
// Параметры:
// - categorySlug: slug категории (для фильтрации)
// - slug: slug конкретной подкатегории
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");
    const slug = searchParams.get("slug");

    // Если запрашивается конкретная подкатегория
    if (slug && categorySlug) {
      // Сначала находим категорию
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });

      if (!category) {
        return NextResponse.json(
          { error: "Категория не найдена" },
          { status: 404 }
        );
      }

      const subcategory = await db.query.subcategories.findFirst({
        where: and(
          eq(subcategories.slug, slug),
          eq(subcategories.categoryId, category.id)
        ),
        with: {
          category: true,
        },
      });

      if (!subcategory) {
        return NextResponse.json(
          { error: "Подкатегория не найдена" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          image: subcategory.image,
          sortOrder: subcategory.sortOrder,
          isActive: subcategory.isActive,
          category: subcategory.category ? {
            id: subcategory.category.id,
            name: subcategory.category.name,
            slug: subcategory.category.slug,
          } : null,
        },
      });
    }

    // Если указан categorySlug - возвращаем подкатегории этой категории
    if (categorySlug) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });

      if (!category) {
        return NextResponse.json(
          { error: "Категория не найдена" },
          { status: 404 }
        );
      }

      const allSubcategories = await db.query.subcategories.findMany({
        where: and(
          eq(subcategories.categoryId, category.id),
          eq(subcategories.isActive, true)
        ),
        orderBy: [asc(subcategories.sortOrder)],
      });

      return NextResponse.json({
        subcategories: allSubcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          image: sub.image,
          sortOrder: sub.sortOrder,
          isActive: sub.isActive,
        })),
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
      });
    }

    // Если ничего не указано - возвращаем все активные подкатегории
    const allSubcategories = await db.query.subcategories.findMany({
      where: eq(subcategories.isActive, true),
      with: {
        category: true,
      },
      orderBy: [asc(subcategories.sortOrder)],
    });

    return NextResponse.json({
      subcategories: allSubcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        image: sub.image,
        sortOrder: sub.sortOrder,
        isActive: sub.isActive,
        category: sub.category ? {
          id: sub.category.id,
          name: sub.category.name,
          slug: sub.category.slug,
        } : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Ошибка при получении подкатегорий" },
      { status: 500 }
    );
  }
}
