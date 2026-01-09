import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { blogPosts, products, categories } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { FaCalendar, FaEye, FaArrowLeft, FaTag, FaShoppingCart } from 'react-icons/fa';

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

// Получаем рекомендуемые товары по urlId из related_product_ids
async function getRelatedProducts(relatedProductIds: string | null) {
  if (!relatedProductIds) return [];
  
  try {
    // Parse JSON array of product urlIds
    const urlIds = JSON.parse(relatedProductIds) as string[];
    if (!Array.isArray(urlIds) || urlIds.length === 0) return [];
    
    // Fetch products with category info
    const relatedProducts = await db
      .select({
        id: products.id,
        urlId: products.urlId,
        title: products.title,
        image: products.image,
        price: products.price,
        unit: products.unit,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(inArray(products.urlId, urlIds))
      .limit(6);
    
    return relatedProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
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
  const relatedProducts = await getRelatedProducts(post.relatedProductIds);

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

        {/* Рекомендуемые товары */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Рекомендуемые товары</h3>
                  <p className="text-sm text-gray-500">Всё необходимое для реализации проекта</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/catalog/${product.categorySlug || 'products'}/${product.urlId}`}
                    className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Изображение */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Название */}
                    <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 flex-grow">
                      {product.title}
                    </h4>
                    {/* Цена */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-purple-600">
                        {Number(product.price || 0).toLocaleString('ru-RU')} ₽
                      </span>
                      {product.unit && (
                        <span className="text-sm text-gray-500">/ {product.unit}</span>
                      )}
                    </div>
                    {/* Кнопка */}
                    <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      Подробнее
                    </button>
                  </Link>
                ))}
              </div>
              {/* Ссылка на каталог */}
              <div className="mt-6 text-center">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Смотреть весь каталог
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

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
