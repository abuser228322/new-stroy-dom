import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc, eq, desc } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить все слайды (включая неактивные)
export async function GET(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .orderBy(asc(heroSlides.sortOrder));

    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
}

// POST - Создать новый слайд
export async function POST(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { title, description, buttonText, buttonLink, emoji, sortOrder, isActive } = body;

    if (!title || !emoji) {
      return NextResponse.json(
        { error: 'Title and emoji are required' },
        { status: 400 }
      );
    }

    const [newSlide] = await db
      .insert(heroSlides)
      .values({
        title,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        emoji,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json(
      { error: 'Failed to create slide' },
      { status: 500 }
    );
  }
}
