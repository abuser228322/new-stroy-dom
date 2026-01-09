import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { FaCalendar, FaEye, FaArrowLeft, FaTag } from 'react-icons/fa';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    
    if (post && post.isPublished) {
      // Увеличиваем счётчик просмотров
      await db
        .update(blogPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(blogPosts.id, post.id));
    }
    
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post || !post.isPublished) {
    return { title: 'Статья не найдена' };
  }

  return {
    title: `${post.title} | Блог Строй Дом`,
    description: post.excerpt || post.title,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'советы': '💡 Советы',
  'новости': '📰 Новости',
  'обзоры': '🔍 Обзоры',
  'инструкции': '📋 Инструкции',
};

// Простой рендеринг Markdown (базовый)
function renderMarkdown(content: string) {
  return content
    .split('\n\n')
    .map((paragraph, i) => {
      // Заголовки
      if (paragraph.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
      }
      // Списки
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 my-4">
            {items.map((item, j) => (
              <li key={j}>{item.slice(2)}</li>
            ))}
          </ul>
        );
      }
      // Обычный параграф
      return <p key={i} className="my-4 leading-relaxed">{paragraph}</p>;
    });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  const tags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <FaArrowLeft />
            Вернуться в блог
          </Link>
        </div>
      </div>

      {/* Статья */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Изображение */}
        {post.image && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Заголовок и мета */}
        <div className="mb-8">
          {post.category && (
            <span className="inline-block bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full mb-4">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <FaCalendar />
                {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaEye />
              {post.viewCount} просмотров
            </span>
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <div className="prose prose-lg max-w-none text-gray-700">
            {renderMarkdown(post.content)}
          </div>
        </div>

        {/* Теги */}
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
              >
                <FaTag className="text-xs" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Навигация снизу */}
        <div className="mt-12 pt-8 border-t">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <FaArrowLeft />
            Все статьи блога
          </Link>
        </div>
      </article>
    </div>
  );
}
