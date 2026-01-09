import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Получить статью по slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (!post || !post.isPublished) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счётчик просмотров
    await db
      .update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, post.id));

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
