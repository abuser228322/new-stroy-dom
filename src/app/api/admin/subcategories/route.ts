import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subcategories, categories } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";

// GET /api/admin/subcategories - получить подкатегории
// Параметры: categoryId (опционально) - фильтр по категории
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      // Получить подкатегории конкретной категории
      const subs = await db.query.subcategories.findMany({
        where: eq(subcategories.categoryId, parseInt(categoryId)),
        with: {
          category: true,
        },
        orderBy: asc(subcategories.sortOrder),
      });
      return NextResponse.json(subs);
    }

    // Получить все подкатегории с информацией о категории
    const allSubcategories = await db.query.subcategories.findMany({
      with: {
        category: true,
      },
      orderBy: asc(subcategories.sortOrder),
    });

    return NextResponse.json(allSubcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Ошибка при получении подкатегорий" },
      { status: 500 }
    );
  }
}

// POST /api/admin/subcategories - создать подкатегорию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, slug, categoryId, description, image, sortOrder, isActive } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: "Название, slug и categoryId обязательны" },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    const [newSubcategory] = await db.insert(subcategories).values({
      name,
      slug,
      categoryId,
      description: description || null,
      image: image || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Ошибка при создании подкатегории" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/subcategories - обновить подкатегорию
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID подкатегории обязателен" },
        { status: 400 }
      );
    }

    const [updated] = await db.update(subcategories)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(subcategories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Подкатегория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении подкатегории" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subcategories - удалить подкатегорию
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID подкатегории обязателен" },
        { status: 400 }
      );
    }

    const [deleted] = await db.delete(subcategories)
      .where(eq(subcategories.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Подкатегория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Подкатегория удалена", deleted });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении подкатегории" },
      { status: 500 }
    );
  }
}
