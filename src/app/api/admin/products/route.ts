import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, subcategories } from "@/lib/db/schema";
import { eq, asc, desc, like, or, and, sql } from "drizzle-orm";

// GET /api/admin/products - получить товары с фильтрами и пагинацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры фильтрации
    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    
    // Параметры пагинации
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Строим условия фильтрации
    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, parseInt(categoryId)));
    }
    
    if (subcategoryId) {
      conditions.push(eq(products.subcategoryId, parseInt(subcategoryId)));
    }
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(products.isActive, isActive === "true"));
    }
    
    if (search) {
      conditions.push(
        or(
          like(products.title, `%${search}%`),
          like(products.urlId, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    // Запрос товаров
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [allProducts, countResult] = await Promise.all([
      db.query.products.findMany({
        where: whereClause,
        with: {
          category: true,
          subcategory: true,
        },
        orderBy: desc(products.createdAt),
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products: allProducts,
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

// POST /api/admin/products - создать товар
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      urlId,
      title,
      description,
      image,
      categoryId,
      subcategoryId,
      price,
      pricesBySize,
      sizeText,
      unit,
      brand,
      inStock,
      isWeight,
      quantityStep,
      minQuantity,
      sortOrder,
      isActive,
    } = body;

    // Валидация обязательных полей
    if (!urlId || !title || !categoryId || !subcategoryId) {
      return NextResponse.json(
        { error: "urlId, title, categoryId и subcategoryId обязательны" },
        { status: 400 }
      );
    }

    // Проверяем уникальность urlId
    const existing = await db.query.products.findFirst({
      where: eq(products.urlId, urlId),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Товар с таким urlId уже существует" },
        { status: 409 }
      );
    }

    // Проверяем существование категории и подкатегории
    const [category, subcategory] = await Promise.all([
      db.query.categories.findFirst({ where: eq(categories.id, categoryId) }),
      db.query.subcategories.findFirst({ where: eq(subcategories.id, subcategoryId) }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    if (!subcategory) {
      return NextResponse.json(
        { error: "Подкатегория не найдена" },
        { status: 404 }
      );
    }

    // Создаём товар
    const [newProduct] = await db.insert(products).values({
      urlId,
      title,
      description: description || null,
      image: image || null,
      categoryId,
      subcategoryId,
      price: price?.toString() || null,
      pricesBySize: pricesBySize || null,
      sizeText: sizeText || null,
      unit: unit || "шт",
      brand: brand || null,
      inStock: inStock ?? true,
      isWeight: isWeight ?? false,
      quantityStep: quantityStep?.toString() || null,
      minQuantity: minQuantity?.toString() || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Ошибка при создании товара" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products - обновить товар
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID товара обязателен" },
        { status: 400 }
      );
    }

    // Преобразуем числовые поля
    if (updateData.price !== undefined) {
      updateData.price = updateData.price?.toString() || null;
    }
    if (updateData.quantityStep !== undefined) {
      updateData.quantityStep = updateData.quantityStep?.toString() || null;
    }
    if (updateData.minQuantity !== undefined) {
      updateData.minQuantity = updateData.minQuantity?.toString() || null;
    }

    const [updated] = await db.update(products)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Товар не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении товара" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - удалить товар
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID товара обязателен" },
        { status: 400 }
      );
    }

    const [deleted] = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Товар не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Товар удалён", deleted });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении товара" },
      { status: 500 }
    );
  }
}
