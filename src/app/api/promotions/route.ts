import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

// GET - Получить все активные акции
export async function GET() {
  try {
    const promos = await db
      .select()
      .from(promotions)
      .where(eq(promotions.isActive, true))
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
