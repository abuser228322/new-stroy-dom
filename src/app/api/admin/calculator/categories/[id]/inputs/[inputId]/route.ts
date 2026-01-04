import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorInputs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Получить input
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; inputId: string }> }
) {
  try {
    const { inputId } = await params;
    
    const [input] = await db
      .select()
      .from(calculatorInputs)
      .where(eq(calculatorInputs.id, parseInt(inputId)));

    if (!input) {
      return NextResponse.json(
        { error: 'Input not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(input);
  } catch (error) {
    console.error('Error fetching input:', error);
    return NextResponse.json(
      { error: 'Failed to fetch input' },
      { status: 500 }
    );
  }
}

// PUT - Обновить input
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; inputId: string }> }
) {
  try {
    const { inputId } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(calculatorInputs)
      .set({
        key: body.key,
        label: body.label,
        unit: body.unit || '',
        defaultValue: body.defaultValue || 0,
        minValue: body.minValue || 0,
        maxValue: body.maxValue || null,
        step: body.step || 1,
        tooltip: body.tooltip || null,
        updatedAt: new Date(),
      })
      .where(eq(calculatorInputs.id, parseInt(inputId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating input:', error);
    return NextResponse.json(
      { error: 'Failed to update input' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить input
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; inputId: string }> }
) {
  try {
    const { inputId } = await params;
    
    await db
      .delete(calculatorInputs)
      .where(eq(calculatorInputs.id, parseInt(inputId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting input:', error);
    return NextResponse.json(
      { error: 'Failed to delete input' },
      { status: 500 }
    );
  }
}
