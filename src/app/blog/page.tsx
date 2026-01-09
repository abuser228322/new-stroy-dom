import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { FaCalendar, FaTag } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Блог | Строй Дом - Статьи о строительстве и ремонте',
  description: 'Полезные советы, новости и обзоры строительных материалов. Читайте статьи экспертов о ремонте и строительстве.',
};

const CATEGORY_LABELS: Record<string, string> = {
  'советы': '💡 Советы',
  'новости': '📰 Новости',
  'обзоры': '🔍 Обзоры',
  'инструкции': '📋 Инструкции',
};

async function getBlogPosts() {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Блог</h1>
          <p className="text-lg text-purple-100">
            Полезные статьи о строительстве, ремонте и выборе материалов
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-4">📝</p>
            <p className="text-gray-500">Статей пока нет. Скоро здесь появятся интересные материалы!</p>
            <Link href="/" className="inline-block mt-4 text-purple-600 hover:underline">
              ← Вернуться на главную
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Изображение */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-50 relative overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-purple-300">
                      📄
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  )}
                </div>

                {/* Контент */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Мета */}
                  {post.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FaCalendar />
                      {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
