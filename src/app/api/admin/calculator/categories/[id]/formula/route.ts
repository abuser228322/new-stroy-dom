import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorFormulas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Получить формулу категории
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const [formula] = await db
      .select()
      .from(calculatorFormulas)
      .where(eq(calculatorFormulas.categoryId, parseInt(id)));

    if (!formula) {
      return NextResponse.json(null);
    }

    return NextResponse.json(formula);
  } catch (error) {
    console.error('Error fetching formula:', error);
    return NextResponse.json(
      { error: 'Failed to fetch formula' },
      { status: 500 }
    );
  }
}

// POST - Создать или обновить формулу (upsert)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Проверяем, существует ли формула
    const [existing] = await db
      .select()
      .from(calculatorFormulas)
      .where(eq(calculatorFormulas.categoryId, parseInt(id)));

    let result;
    if (existing) {
      // Обновляем
      [result] = await db
        .update(calculatorFormulas)
        .set({
          formulaType: body.formulaType,
          formulaParams: body.formulaParams || {},
          resultUnit: body.resultUnit,
          resultUnitTemplate: body.resultUnitTemplate || null,
          recommendationsTemplate: body.recommendationsTemplate || null,
          updatedAt: new Date(),
        })
        .where(eq(calculatorFormulas.categoryId, parseInt(id)))
        .returning();
    } else {
      // Создаем
      [result] = await db
        .insert(calculatorFormulas)
        .values({
          categoryId: parseInt(id),
          formulaType: body.formulaType,
          formulaParams: body.formulaParams || {},
          resultUnit: body.resultUnit,
          resultUnitTemplate: body.resultUnitTemplate || null,
          recommendationsTemplate: body.recommendationsTemplate || null,
        })
        .returning();
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving formula:', error);
    return NextResponse.json(
      { error: 'Failed to save formula' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить формулу
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db
      .delete(calculatorFormulas)
      .where(eq(calculatorFormulas.categoryId, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { error: 'Failed to delete formula' },
      { status: 500 }
    );
  }
}
