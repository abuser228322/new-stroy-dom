import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorCategories, calculatorProducts, calculatorInputs } from '@/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';

// GET - Получить все категории
export async function GET() {
  try {
    const categories = await db
      .select({
        id: calculatorCategories.id,
        slug: calculatorCategories.slug,
        name: calculatorCategories.name,
        description: calculatorCategories.description,
        icon: calculatorCategories.icon,
        sortOrder: calculatorCategories.sortOrder,
        isActive: calculatorCategories.isActive,
      })
      .from(calculatorCategories)
      .orderBy(asc(calculatorCategories.sortOrder));

    // Подсчитываем количество продуктов и полей для каждой категории
    const result = await Promise.all(
      categories.map(async (cat) => {
        const [productsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(calculatorProducts)
          .where(eq(calculatorProducts.categoryId, cat.id));
        
        const [inputsCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(calculatorInputs)
          .where(eq(calculatorInputs.categoryId, cat.id));

        return {
          ...cat,
          _count: {
            products: Number(productsCount?.count || 0),
            inputs: Number(inputsCount?.count || 0),
          },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching calculator categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Создать категорию
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Получаем максимальный sortOrder
    const [maxOrder] = await db
      .select({ max: sql<number>`COALESCE(MAX(sort_order), 0)` })
      .from(calculatorCategories);

    const [newCategory] = await db
      .insert(calculatorCategories)
      .values({
        slug: body.slug,
        name: body.name,
        description: body.description || null,
        icon: body.icon || '📦',
        isActive: body.isActive ?? true,
        sortOrder: (maxOrder?.max || 0) + 1,
      })
      .returning();

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating calculator category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
