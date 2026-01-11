import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить одну акцию
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
    const [promo] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, parseInt(id)));

    if (!promo) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(promo);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion' },
      { status: 500 }
    );
  }
}

// PUT - Обновить акцию
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
    const { title, description, discount, validUntil, image, icon, color, link, sortOrder, isActive } = body;

    const [updatedPromo] = await db
      .update(promotions)
      .set({
        title,
        description,
        discount,
        validUntil,
        image,
        icon,
        color,
        link,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(promotions.id, parseInt(id)))
      .returning();

    if (!updatedPromo) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPromo);
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить акцию
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
    const [deletedPromo] = await db
      .delete(promotions)
      .where(eq(promotions.id, parseInt(id)))
      .returning();

    if (!deletedPromo) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
