import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { blogPosts, products, categories, subcategories } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { FaCalendar, FaArrowLeft, FaTag, FaShoppingCart } from 'react-icons/fa';
import { ArticleSchema } from '../../components/SchemaOrg';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    
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
    
    // Fetch products with category and subcategory info
    const relatedProducts = await db
      .select({
        id: products.id,
        urlId: products.urlId,
        title: products.title,
        image: products.image,
        price: products.price,
        pricesBySize: products.pricesBySize,
        unit: products.unit,
        categorySlug: categories.slug,
        subcategorySlug: subcategories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
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
    openGraph: {
      title: `${post.title} | Блог Строй Дом`,
      description: post.excerpt || post.title,
      type: 'article',
      url: `https://stroydom30.ru/blog/${slug}`,
      ...(post.image && { images: [{ url: post.image }] }),
    },
    alternates: {
      canonical: `https://stroydom30.ru/blog/${slug}`,
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'советы': '💡 Советы',
  'новости': '📰 Новости',
  'обзоры': '🔍 Обзоры',
  'инструкции': '📋 Инструкции',
};

// Форматирование inline элементов (жирный, курсив)
function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++} className="font-semibold text-gray-900">{match[1]}</strong>);
    } else if (match[2]) {
      parts.push(<em key={key++} className="italic">{match[2]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Рендер таблицы
function renderTable(lines: string[], key: number) {
  const rows = lines
    .map(line => line.split('|').map(cell => cell.trim()).filter(cell => cell && !cell.match(/^-+$/)))
    .filter(row => row.length > 0 && !row.every(cell => cell.match(/^-+$/)));

  if (rows.length === 0) return null;

  const header = rows[0];
  const body = rows.slice(1).filter(row => !row.every(cell => cell.match(/^-+$/)));

  return (
    <div key={key} className="my-6 overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-purple-50">
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-purple-100">
                {formatInlineText(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  {formatInlineText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Улучшенный рендеринг Markdown
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    if (line.trim() === '') { i++; continue; }

    // Заголовки
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-xl font-bold text-gray-900 mt-8 mb-4">{formatInlineText(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-2xl font-bold text-gray-900 mt-10 mb-4">{formatInlineText(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-3xl font-bold text-gray-900 mt-10 mb-4">{formatInlineText(line.slice(2))}</h1>);
      i++; continue;
    }

    // Горизонтальная линия
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={key++} className="my-8 border-gray-200" />);
      i++; continue;
    }

    // Таблицы
    if (line.includes('|') && lines[i + 1]?.includes('|') && lines[i + 1]?.includes('-')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(renderTable(tableLines, key++));
      continue;
    }

    // Нумерованные списки
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-2 my-4 text-gray-700">
          {listItems.map((item, j) => <li key={j} className="leading-relaxed">{formatInlineText(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Маркированные списки
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-2 my-4 text-gray-700">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 leading-relaxed">
              <span className="text-purple-500 mt-1.5">•</span>
              <span>{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Обычный параграф
    let paragraph = line;
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('-') && !lines[i].startsWith('*') && !/^\d+\.\s/.test(lines[i]) && !lines[i].includes('|')) {
      paragraph += ' ' + lines[i];
      i++;
    }
    elements.push(<p key={key++} className="my-4 text-gray-700 leading-relaxed">{formatInlineText(paragraph)}</p>);
  }

  return elements;
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
      {/* SEO Schema.org разметка */}
      <ArticleSchema
        title={post.title}
        description={post.excerpt || post.title}
        image={post.image || undefined}
        datePublished={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        dateModified={post.updatedAt?.toISOString()}
        url={`https://stroydom30.ru/blog/${slug}`}
      />

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
          {post.publishedAt && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FaCalendar />
              {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
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
                {relatedProducts.map((product) => {
                  // Вычисляем цену и наличие вариантов
                  const pricesBySize = product.pricesBySize as Record<string, number> | null;
                  const hasVariants = pricesBySize && Object.keys(pricesBySize).length > 0;
                  const minPrice = hasVariants 
                    ? Math.min(...Object.values(pricesBySize)) 
                    : Number(product.price || 0);
                  
                  // Формируем ссылку с подкатегорией
                  const productUrl = product.subcategorySlug 
                    ? `/catalog/${product.categorySlug}/${product.subcategorySlug}/${product.urlId}`
                    : `/catalog/${product.categorySlug || 'products'}/${product.urlId}`;
                  
                  return (
                    <Link
                      key={product.id}
                      href={productUrl}
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
                        {hasVariants ? (
                          <span className="text-lg font-bold text-purple-600">
                            от {minPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-purple-600">
                            {minPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                        {product.unit && (
                          <span className="text-sm text-gray-500">/ {product.unit}</span>
                        )}
                      </div>
                      {/* Кнопка */}
                      <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                        {hasVariants ? 'Выбрать размер' : 'Подробнее'}
                      </button>
                    </Link>
                  );
                })}
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
