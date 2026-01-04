import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculatorCategories } from '@/lib/db/schema';
import { eq, gt, lt, desc, asc } from 'drizzle-orm';

// POST - Переместить категорию вверх/вниз
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { direction } = body; // 'up' или 'down'

    const categoryId = parseInt(id);
    const db = getDb();
    
    // Получаем текущую категорию
    const [currentCategory] = await db
      .select()
      .from(calculatorCategories)
      .where(eq(calculatorCategories.id, categoryId));

    if (!currentCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const currentSort = currentCategory.sortOrder ?? 0;

    // Находим соседнюю категорию для обмена
    let neighborCategory;
    if (direction === 'up') {
      [neighborCategory] = await db
        .select()
        .from(calculatorCategories)
        .where(lt(calculatorCategories.sortOrder, currentSort))
        .orderBy(desc(calculatorCategories.sortOrder))
        .limit(1);
    } else {
      [neighborCategory] = await db
        .select()
        .from(calculatorCategories)
        .where(gt(calculatorCategories.sortOrder, currentSort))
        .orderBy(asc(calculatorCategories.sortOrder))
        .limit(1);
    }

    if (!neighborCategory) {
      return NextResponse.json(
        { error: 'Cannot move in that direction' },
        { status: 400 }
      );
    }

    const neighborSort = neighborCategory.sortOrder ?? 0;

    // Меняем sortOrder местами (без транзакции)
    await db
      .update(calculatorCategories)
      .set({ sortOrder: neighborSort })
      .where(eq(calculatorCategories.id, currentCategory.id));

    await db
      .update(calculatorCategories)
      .set({ sortOrder: currentSort })
      .where(eq(calculatorCategories.id, neighborCategory.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving category:', error);
    return NextResponse.json(
      { error: 'Failed to move category' },
      { status: 500 }
    );
  }
}
