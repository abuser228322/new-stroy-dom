import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить все акции (включая неактивные)
export async function GET(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const promos = await db
      .select()
      .from(promotions)
      .orderBy(asc(promotions.sortOrder));

    return NextResponse.json(promos);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

// POST - Создать новую акцию
export async function POST(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { title, description, discount, validUntil, image, icon, color, link, sortOrder, isActive } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const [newPromo] = await db
      .insert(promotions)
      .values({
        title,
        description: description || null,
        discount: discount || null,
        validUntil: validUntil || null,
        image: image || null,
        icon: icon || 'percent',
        color: color || 'red',
        link: link || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(newPromo, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}
