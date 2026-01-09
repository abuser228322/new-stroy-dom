import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

// GET - Получить все активные слайды
export async function GET() {
  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
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
