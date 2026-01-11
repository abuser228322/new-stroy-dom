import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin, authErrorResponse } from '@/lib/auth-utils';

// GET - Получить все статьи (включая черновики)
export async function GET(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Создать новую статью
export async function POST(request: NextRequest) {
  // Проверяем права администратора
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { slug, title, excerpt, content, image, category, tags, authorId, isPublished, relatedProductIds } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'Slug, title and content are required' },
        { status: 400 }
      );
    }

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        slug,
        title,
        excerpt: excerpt || null,
        content,
        image: image || null,
        category: category || null,
        tags: tags || null,
        relatedProductIds: relatedProductIds || null,
        authorId: authorId || null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
