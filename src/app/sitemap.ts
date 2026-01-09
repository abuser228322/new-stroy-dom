import { MetadataRoute } from 'next';
import { menuCategories } from './mock/menuCategories';
import products, { getCategorySlug, getSubcategorySlug } from './mock/products';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://stroydom30.ru';

// Статические страницы магазина
const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' as const },
  { url: '/catalog', priority: 0.9, changefreq: 'daily' as const },
  { url: '/sales', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/contacts', priority: 0.7, changefreq: 'monthly' as const },
  { url: '/payment', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/policy', priority: 0.3, changefreq: 'yearly' as const },
];

export const revalidate = 3600; // Перегенерируем каждый час

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // 1. Статические страницы
  const staticUrls: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: currentDate,
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));

  // 2. Страницы категорий
  const categoryUrls: MetadataRoute.Sitemap = menuCategories.map(category => ({
    url: `${BASE_URL}/catalog/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 3. Страницы подкатегорий
  const subcategoryUrls: MetadataRoute.Sitemap = menuCategories.flatMap(category =>
    category.subcategories.map(sub => ({
      url: `${BASE_URL}/catalog/${category.slug}/${sub.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  );

  // 4. Страницы товаров
  const productUrls: MetadataRoute.Sitemap = products.map(product => {
    const categorySlug = getCategorySlug(product.mainCategory);
    const subcategorySlug = getSubcategorySlug(product.subCategory);
    
    return {
      url: `${BASE_URL}/catalog/${categorySlug}/${subcategorySlug}/${product.urlId}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  // 5. Страницы блога
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));
    
    blogUrls = posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt?.toISOString() || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [
    ...staticUrls,
    ...categoryUrls,
    ...subcategoryUrls,
    ...productUrls,
    ...blogUrls,
  ];
}
