import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCube, FaPaintBrush, FaSquare, FaTint, FaWrench, 
  FaRuler, FaLayerGroup, FaBoxOpen, FaChevronRight 
} from 'react-icons/fa';
import { getCategoryBySlug, getAllCategories } from '@/lib/db/queries';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Генерация метаданных
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Категория не найдена | Строй Дом',
    };
  }

  return {
    title: `${category.name} — купить в Астрахани | Строй Дом`,
    description: `${category.name} по низким ценам в Астрахани. Широкий ассортимент, доставка по городу и области. Магазин строительных материалов Строй Дом.`,
    keywords: [category.name, 'Астрахань', 'купить', 'цена', 'строительные материалы'],
    openGraph: {
      title: `${category.name} | Строй Дом`,
      description: `${category.name} по низким ценам в Астрахани`,
      url: `https://stroydom30.ru/catalog/${categorySlug}`,
    },
  };
}

// Генерация статических путей (для ISR)
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories();
    return categories.map((category) => ({
      category: category.slug,
    }));
  } catch {
    return [];
  }
}

// Иконки и цвета для подкатегорий
const subcategoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
  'shtukaturka': { icon: FaCube, color: 'bg-orange-100 text-orange-600' },
  'shpatlevka': { icon: FaPaintBrush, color: 'bg-pink-100 text-pink-600' },
  'plitochnyj-klej': { icon: FaSquare, color: 'bg-blue-100 text-blue-600' },
  'zatirka': { icon: FaTint, color: 'bg-cyan-100 text-cyan-600' },
  'montazhnaya-smes': { icon: FaWrench, color: 'bg-slate-100 text-slate-600' },
  'styazhka-pola': { icon: FaRuler, color: 'bg-emerald-100 text-emerald-600' },
  'kladochnye-smesi': { icon: FaLayerGroup, color: 'bg-amber-100 text-amber-600' },
};

const defaultIcon = { icon: FaBoxOpen, color: 'bg-sky-100 text-sky-600' };

// Принудительно динамический рендеринг для получения данных из БД
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Ревалидация каждые 60 секунд

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Хлебные крошки */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            <li>
              <Link href="/" className="text-gray-500 hover:text-sky-600 transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/catalog" className="text-gray-500 hover:text-sky-600 transition-colors">
                Каталог
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium">{category.name}</li>
          </ol>
        </div>
      </nav>

      {/* Заголовок */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            {category.name}
          </h1>
          {category.subcategories.length > 0 && (
            <p className="text-slate-300 text-lg">
              {category.subcategories.length} подкатегорий товаров
            </p>
          )}
        </div>
      </section>

      {/* Подкатегории или товары */}
      <section className="container mx-auto px-4 py-10">
        {category.subcategories.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Выберите подкатегорию
              </h2>
              <span className="text-sm text-gray-500">
                {category.subcategories.length} шт.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories.map((subcategory) => {
                const iconConfig = subcategoryIcons[subcategory.slug] || defaultIcon;
                const IconComponent = iconConfig.icon;
                
                return (
                  <Link
                    key={subcategory.slug}
                    href={`/catalog/${categorySlug}/${subcategory.slug}`}
                    className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-sky-200 transition-all hover:-translate-y-0.5"
                  >
                    <div className={`w-14 h-14 ${iconConfig.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="text-xl" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {subcategory.name}
                      </h3>
                      <p className="text-sm text-gray-500">Смотреть товары →</p>
                    </div>
                    <FaChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          // Если нет подкатегорий, показываем заглушку для товаров
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Товары скоро появятся
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Мы работаем над наполнением каталога. Позвоните нам, и мы поможем найти нужный товар!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                ← Вернуться в каталог
              </Link>
              <a
                href="tel:+79371333366"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30"
              >
                Позвонить нам
              </a>
            </div>
          </div>
        )}
      </section>

      {/* SEO текст */}
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              {category.name} в Астрахани
            </h2>
            <div className="prose prose-gray prose-lg">
              <p>
                В магазине «Строй Дом» вы можете приобрести {category.name.toLowerCase()} по
                выгодным ценам. Мы предлагаем продукцию от проверенных производителей с
                гарантией качества.
              </p>
              <p>
                Наши преимущества: широкий ассортимент, консультации специалистов, доставка
                по Астрахани и области, удобные способы оплаты.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
