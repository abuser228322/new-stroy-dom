import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorCategories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить категорию
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    const [category] = await db
      .select()
      .from(calculatorCategories)
      .where(eq(calculatorCategories.id, parseInt(id)));

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(calculatorCategories)
      .set({
        slug: body.slug,
        name: body.name,
        description: body.description || null,
        icon: body.icon,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(calculatorCategories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    
    await db
      .delete(calculatorCategories)
      .where(eq(calculatorCategories.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
