import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { blogPosts, categories, subcategories, products } from '@/lib/db/schema';
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

  // 2. Страницы категорий (из БД)
  let categoryUrls: MetadataRoute.Sitemap = [];
  let subcategoryUrls: MetadataRoute.Sitemap = [];
  let productUrls: MetadataRoute.Sitemap = [];
  
  try {
    const allCategories = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true));
    
    categoryUrls = allCategories.map(category => ({
      url: `${BASE_URL}/catalog/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // 3. Страницы подкатегорий (из БД)
    const allSubcategories = await db
      .select({ 
        slug: subcategories.slug,
        categorySlug: categories.slug 
      })
      .from(subcategories)
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(eq(subcategories.isActive, true));
    
    subcategoryUrls = allSubcategories.map(sub => ({
      url: `${BASE_URL}/catalog/${sub.categorySlug}/${sub.slug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // 4. Страницы товаров (из БД)
    const allProducts = await db
      .select({ 
        urlId: products.urlId,
        categorySlug: categories.slug,
        subcategorySlug: subcategories.slug
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(eq(products.isActive, true));
    
    productUrls = allProducts.map(product => ({
      url: `${BASE_URL}/catalog/${product.categorySlug}/${product.subcategorySlug}/${product.urlId}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching categories/products for sitemap:', error);
  }

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
