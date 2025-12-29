import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, subcategories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/admin/categories - получить все категории
export async function GET() {
  try {
    const allCategories = await db.query.categories.findMany({
      with: {
        subcategories: {
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

// POST /api/admin/categories - создать категорию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, slug, shortName, description, image, icon, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Название и slug обязательны" },
        { status: 400 }
      );
    }

    const [newCategory] = await db.insert(categories).values({
      name,
      slug,
      shortName: shortName || null,
      description: description || null,
      image: image || null,
      icon: icon || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Ошибка при создании категории" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories - обновить категорию
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID категории обязателен" },
        { status: 400 }
      );
    }

    const [updated] = await db.update(categories)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении категории" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - удалить категорию
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID категории обязателен" },
        { status: 400 }
      );
    }

    const [deleted] = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Категория удалена", deleted });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении категории" },
      { status: 500 }
    );
  }
}
