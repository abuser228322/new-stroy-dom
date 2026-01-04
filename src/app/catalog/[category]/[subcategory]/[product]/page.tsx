import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByUrlId, getProducts, getCategoryBySlug, getSubcategoryBySlug } from '@/lib/db/queries';
import ProductPage from './ProductPage';

interface PageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    product: string;
  }>;
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory, product: productSlug } = await params;
  
  const product = await getProductByUrlId(productSlug);
  
  if (!product) {
    return {
      title: 'Товар не найден | Строй Дом',
    };
  }

  const categoryData = await getCategoryBySlug(category);
  const subcategoryData = await getSubcategoryBySlug(category, subcategory);

  // Формируем цену для мета-тегов
  const priceText = product.price 
    ? `${product.price.toLocaleString('ru-RU')} ₽` 
    : product.pricesBySize 
      ? `от ${Math.min(...Object.values(product.pricesBySize)).toLocaleString('ru-RU')} ₽`
      : '';

  const title = `${product.title} купить в Астрахани ${priceText} | Строй Дом`;
  const description = product.description 
    ? `${product.description.slice(0, 150)}... Купить ${product.title} в магазине Строй Дом. Доставка по Астрахани. ☎ 8-937-133-33-66`
    : `Купить ${product.title} ${priceText} в магазине стройматериалов Строй Дом. ${categoryData?.name || ''} ${subcategoryData?.name || ''}. Доставка по Астрахани. ☎ 8-937-133-33-66`;

  const canonicalUrl = `https://stroydom30.ru/catalog/${category}/${subcategory}/${productSlug}`;

  return {
    title,
    description,
    keywords: `${product.title}, ${product.mainCategory}, ${product.subCategory}, купить, Астрахань, стройматериалы, цена`,
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Строй Дом - Стройматериалы в Астрахани',
      locale: 'ru_RU',
      images: product.image ? [
        {
          url: product.image.startsWith('http') ? product.image : `https://stroydom30.ru${product.image}`,
          width: 800,
          height: 600,
          alt: product.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.image ? [product.image.startsWith('http') ? product.image : `https://stroydom30.ru${product.image}`] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { category, subcategory, product: productSlug } = await params;
  
  // Загружаем данные параллельно
  const [product, categoryData, subcategoryData] = await Promise.all([
    getProductByUrlId(productSlug),
    getCategoryBySlug(category),
    getSubcategoryBySlug(category, subcategory),
  ]);

  if (!product || !categoryData || !subcategoryData) {
    notFound();
  }

  // Получаем похожие товары (из той же подкатегории)
  const { products: relatedProducts } = await getProducts({
    categorySlug: category,
    subcategorySlug: subcategory,
    limit: 8,
  });

  // Фильтруем текущий товар из похожих
  const filteredRelated = relatedProducts.filter(p => p.urlId !== product.urlId).slice(0, 4);

  // JSON-LD разметка для SEO (Schema.org Product)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} - ${product.mainCategory}, ${product.subCategory}`,
    image: product.image ? (product.image.startsWith('http') ? product.image : `https://stroydom30.ru${product.image}`) : undefined,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    category: `${product.mainCategory} > ${product.subCategory}`,
    sku: product.urlId,
    offers: {
      '@type': 'Offer',
      url: `https://stroydom30.ru/catalog/${category}/${subcategory}/${productSlug}`,
      priceCurrency: 'RUB',
      price: product.price || (product.pricesBySize ? Math.min(...Object.values(product.pricesBySize)) : undefined),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Строй Дом',
      },
    },
  };

  // BreadcrumbList для хлебных крошек
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: 'https://stroydom30.ru',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Каталог',
        item: 'https://stroydom30.ru/catalog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryData.name,
        item: `https://stroydom30.ru/catalog/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: subcategoryData.name,
        item: `https://stroydom30.ru/catalog/${category}/${subcategory}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: product.title,
        item: `https://stroydom30.ru/catalog/${category}/${subcategory}/${productSlug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD для поисковиков */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <ProductPage
        product={product}
        category={categoryData}
        subcategory={subcategoryData}
        relatedProducts={filteredRelated}
      />
    </>
  );
}
