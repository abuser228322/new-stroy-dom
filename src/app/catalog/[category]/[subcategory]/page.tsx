import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  getAllCategories,
  getProducts,
} from '@/lib/db/queries';
import ProductCard from '../../../components/ProductCard';
import { ItemListSchema, BreadcrumbSchema } from '../../../components/SchemaOrg';

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

// Генерация метаданных
export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  const subcategory = await getSubcategoryBySlug(categorySlug, subcategorySlug);

  if (!category || !subcategory) {
    return {
      title: 'Подкатегория не найдена | Строй Дом',
    };
  }

  return {
    title: `${subcategory.name} — купить в Астрахани | Строй Дом`,
    description: `${subcategory.name} по низким ценам в Астрахани. ${category.name} от ведущих производителей. Доставка по городу и области.`,
    keywords: [subcategory.name, category.name, 'Астрахань', 'купить', 'цена'],
    openGraph: {
      title: `${subcategory.name} | Строй Дом`,
      description: `${subcategory.name} по низким ценам в Астрахани`,
      url: `https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}`,
    },
    alternates: {
      canonical: `https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}`,
    },
  };
}

// Генерация статических путей
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    const paths: { category: string; subcategory: string }[] = [];

    categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        paths.push({
          category: category.slug,
          subcategory: subcategory.slug,
        });
      });
    });

    return paths;
  } catch {
    return [];
  }
}

// Принудительно динамический рендеринг для получения данных из БД
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Ревалидация каждые 60 секунд

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  const category = await getCategoryBySlug(categorySlug);
  const subcategory = await getSubcategoryBySlug(categorySlug, subcategorySlug);

  if (!category || !subcategory) {
    notFound();
  }

  // Получаем товары из БД
  const { products } = await getProducts({ 
    categorySlug, 
    subcategorySlug 
  });

  // Подготавливаем данные для ItemListSchema
  const itemListItems = products.map((product) => ({
    name: product.title,
    url: `https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}/${product.urlId}`,
    image: product.image ? `https://stroydom30.ru${product.image}` : undefined,
    price: product.price || undefined,
  }));

  // Breadcrumb для SEO
  const breadcrumbItems = [
    { name: 'Главная', url: 'https://stroydom30.ru/' },
    { name: 'Каталог', url: 'https://stroydom30.ru/catalog' },
    { name: category.name, url: `https://stroydom30.ru/catalog/${categorySlug}` },
    { name: subcategory.name, url: `https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}` },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SEO Schema.org разметка */}
      <BreadcrumbSchema items={breadcrumbItems} />
      {products.length > 0 && (
        <ItemListSchema
          items={itemListItems}
          name={`${subcategory.name} - ${category.name}`}
          url={`https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}`}
        />
      )}

      {/* Тёмный заголовок */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Хлебные крошки */}
          <nav className="mb-3 sm:mb-6">
            <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li>
                <Link href="/catalog" className="text-gray-400 hover:text-white transition-colors">
                  Каталог
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li>
                <Link href={`/catalog/${categorySlug}`} className="text-gray-400 hover:text-white transition-colors">
                  {category.name}
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-white font-medium">{subcategory.name}</li>
            </ol>
          </nav>
          
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            {subcategory.name}
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full"></span>
              {products.length > 0 ? `${products.length} товаров` : 'Ожидается поступление'}
            </span>
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Боковая панель с фильтрами - скрыта на мобильных */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Другие подкатегории
              </h2>
              <ul className="space-y-1">
                {category.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/catalog/${categorySlug}/${sub.slug}`}
                      className={`block py-2.5 px-4 rounded-xl transition-all ${
                        sub.slug === subcategorySlug
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/30'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  href={`/catalog/${categorySlug}`}
                  className="flex items-center gap-2 text-sky-600 font-medium hover:text-sky-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Назад к категории
                </Link>
              </div>
            </div>
          </aside>

          {/* Сетка товаров */}
          <div className="grow">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categorySlug={categorySlug}
                    subcategorySlug={subcategorySlug}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Товары скоро появятся
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Мы активно работаем над наполнением каталога. Свяжитесь с нами для уточнения наличия товаров.
                </p>
                <Link
                  href="/contacts"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-sky-500/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Связаться с нами
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO текст */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              {subcategory.name} в Астрахани
            </h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Купить {subcategory.name.toLowerCase()} в Астрахани по выгодной цене вы можете
                в магазине «Строй Дом». Мы предлагаем продукцию от ведущих производителей:
                Knauf, Ceresit, Волма и других.
              </p>
              <p>
                Наши специалисты помогут подобрать оптимальные материалы для вашего проекта.
                Осуществляем доставку по Астрахани и области.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm text-white">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Доставка по городу
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm text-white">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Гарантия качества
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm text-white">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Консультация специалиста
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
