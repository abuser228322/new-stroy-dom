import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { heroSlides } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Получить слайд по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slideId = parseInt(id);

    const [slide] = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.id, slideId));

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error fetching slide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slide' },
      { status: 500 }
    );
  }
}

// PUT - Обновить слайд
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slideId = parseInt(id);
    const body = await request.json();
    const { title, description, buttonText, buttonLink, emoji, sortOrder, isActive } = body;

    const [updatedSlide] = await db
      .update(heroSlides)
      .set({
        title,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        emoji,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(heroSlides.id, slideId))
      .returning();

    if (!updatedSlide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить слайд
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slideId = parseInt(id);

    const [deletedSlide] = await db
      .delete(heroSlides)
      .where(eq(heroSlides.id, slideId))
      .returning();

    if (!deletedSlide) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
}
