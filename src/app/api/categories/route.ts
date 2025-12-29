import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, subcategories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/categories - получить все категории с подкатегориями
// GET /api/categories?slug=profnastil - получить конкретную категорию
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // Получить конкретную категорию по slug
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: asc(subcategories.sortOrder),
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Категория не найдена" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    // Получить все активные категории с подкатегориями
    const allCategories = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      with: {
        subcategories: {
          where: eq(subcategories.isActive, true),
          orderBy: asc(subcategories.sortOrder),
        },
      },
      orderBy: asc(categories.sortOrder),
    });

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Ошибка при получении категорий" },
      { status: 500 }
    );
  }
}
