import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorInputs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить все inputs категории
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    
    const inputsList = await db
      .select()
      .from(calculatorInputs)
      .where(eq(calculatorInputs.categoryId, parseInt(id)))
      .orderBy(calculatorInputs.sortOrder);

    return NextResponse.json(inputsList);
  } catch (error) {
    console.error('Error fetching inputs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inputs' },
      { status: 500 }
    );
  }
}

// POST - Создать input
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Получаем максимальный sortOrder
    const [maxSort] = await db
      .select({ maxOrder: calculatorInputs.sortOrder })
      .from(calculatorInputs)
      .where(eq(calculatorInputs.categoryId, parseInt(id)))
      .orderBy(desc(calculatorInputs.sortOrder))
      .limit(1);

    const nextSortOrder = (maxSort?.maxOrder || 0) + 1;

    const [newInput] = await db
      .insert(calculatorInputs)
      .values({
        categoryId: parseInt(id),
        key: body.key,
        label: body.label,
        unit: body.unit || '',
        defaultValue: body.defaultValue || 0,
        minValue: body.minValue || 0,
        maxValue: body.maxValue || null,
        step: body.step || 1,
        tooltip: body.tooltip || null,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(newInput, { status: 201 });
  } catch (error) {
    console.error('Error creating input:', error);
    return NextResponse.json(
      { error: 'Failed to create input' },
      { status: 500 }
    );
  }
}
