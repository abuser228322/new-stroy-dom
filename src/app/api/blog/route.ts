import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';

// GET - Получить все опубликованные статьи
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));

    if (category) {
      query = db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.isPublished, true), eq(blogPosts.category, category)))
        .orderBy(desc(blogPosts.publishedAt));
    }

    const posts = await query;

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
