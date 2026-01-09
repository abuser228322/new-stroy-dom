import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  BrickWall, Paintbrush, Blocks, Droplet, Wrench, 
  Ruler, Layers, Box, ChevronRight,
  Flame, Shield, Droplets,
  Hammer, Grid3x3, Cylinder, TreePine, TreeDeciduous,
  Sparkles, ScrollText, Square, RailSymbol,
  LucideIcon, PaintBucket, CircleDot, Disc,
} from 'lucide-react';
import { getCategoryBySlug, getAllCategories } from '@/lib/db/queries';
import { ItemListSchema } from '../../components/SchemaOrg';

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
    alternates: {
      canonical: `https://stroydom30.ru/catalog/${categorySlug}`,
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

// Иконки и цвета для подкатегорий - расширенный список
const subcategoryIcons: Record<string, { icon: LucideIcon; color: string }> = {
  // Сухие смеси
  'shtukaturka': { icon: BrickWall, color: 'bg-orange-100 text-orange-600' },
  'shpatlevka': { icon: Paintbrush, color: 'bg-pink-100 text-pink-600' },
  'plitochnyy-kley': { icon: Blocks, color: 'bg-blue-100 text-blue-600' },
  'zatirka': { icon: Droplet, color: 'bg-cyan-100 text-cyan-600' },
  'montazhnyy-kley': { icon: Blocks, color: 'bg-slate-100 text-slate-600' },
  'smesi-dlya-pola': { icon: Layers, color: 'bg-emerald-100 text-emerald-600' },
  'kley-dlya-blokov': { icon: Blocks, color: 'bg-amber-100 text-amber-600' },
  'shtukaturno-kleevaya-smes': { icon: BrickWall, color: 'bg-orange-100 text-orange-600' },
  'dekorativnaya-shtukaturka': { icon: Sparkles, color: 'bg-violet-100 text-violet-600' },
  'cement': { icon: BrickWall, color: 'bg-gray-200 text-gray-700' },
  
  // Утеплители
  'penopolistirol': { icon: Square, color: 'bg-violet-100 text-violet-600' },
  'penoplast': { icon: Square, color: 'bg-blue-100 text-blue-600' },
  'kamennaya-i-mineralnaya-vata': { icon: Flame, color: 'bg-yellow-100 text-yellow-600' },
  
  // Гидроизоляция
  'suhaya-smes': { icon: BrickWall, color: 'bg-blue-100 text-blue-600' },
  'zhidkaya-gidroizolyaciya': { icon: Droplets, color: 'bg-cyan-100 text-cyan-600' },
  'lenta-gidroizolyacionnaya': { icon: ScrollText, color: 'bg-teal-100 text-teal-600' },
  
  // Изоляция
  'otrazhayuschaya-teploizolyaciya': { icon: Shield, color: 'bg-amber-100 text-amber-600' },
  'paroizolyaciya': { icon: Shield, color: 'bg-slate-100 text-slate-600' },
  'gidro-paroizolyaciya': { icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  'podlozhka': { icon: Layers, color: 'bg-green-100 text-green-600' },
  
  // Крепёж
  'samorezy-dlya-gipsokartona': { icon: Hammer, color: 'bg-rose-100 text-rose-600' },
  'krovelnye-samorezy': { icon: Hammer, color: 'bg-red-100 text-red-600' },
  'gvozdi': { icon: Hammer, color: 'bg-slate-100 text-slate-600' },
  'dyubeli': { icon: CircleDot, color: 'bg-gray-100 text-gray-600' },
  'bolty-gayky': { icon: Wrench, color: 'bg-zinc-100 text-zinc-600' },
  'krovelnyy-krepezh': { icon: Hammer, color: 'bg-orange-100 text-orange-600' },
  'profileobzhimatel': { icon: Ruler, color: 'bg-indigo-100 text-indigo-600' },
  
  // Профнастил
  'mp-20': { icon: Layers, color: 'bg-sky-100 text-sky-600' },
  's-8': { icon: Layers, color: 'bg-blue-100 text-blue-600' },
  
  // Гипсокартон
  'dlya-suhih-pomescheniy': { icon: Square, color: 'bg-emerald-100 text-emerald-600' },
  'vlagostoykiy': { icon: Droplets, color: 'bg-teal-100 text-teal-600' },
  
  // Профиля
  'stenovye': { icon: RailSymbol, color: 'bg-slate-100 text-slate-600' },
  'peregorodochnye': { icon: RailSymbol, color: 'bg-gray-100 text-gray-600' },
  
  // Маяки
  'mayaki': { icon: Ruler, color: 'bg-teal-100 text-teal-600' },
  'perforirovannye-ugly': { icon: Ruler, color: 'bg-slate-100 text-slate-600' },
  
  // Профтрубы
  'proftruby': { icon: Cylinder, color: 'bg-zinc-100 text-zinc-600' },
  'metallicheskie-ugly': { icon: Ruler, color: 'bg-gray-100 text-gray-600' },
  
  // Плиты
  'osp': { icon: TreeDeciduous, color: 'bg-amber-100 text-amber-600' },
  'dsp': { icon: TreeDeciduous, color: 'bg-yellow-100 text-yellow-600' },
  'dvp': { icon: TreeDeciduous, color: 'bg-orange-100 text-orange-600' },
  'fanera': { icon: Layers, color: 'bg-lime-100 text-lime-600' },
  
  // Вагонка и брус
  'vagonka': { icon: TreePine, color: 'bg-green-100 text-green-600' },
  'bruski': { icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
  
  // Арматура
  'stekloplastikovaya-armatura': { icon: Grid3x3, color: 'bg-blue-100 text-blue-600' },
  'kladochnaya-setka': { icon: Grid3x3, color: 'bg-slate-100 text-slate-600' },
  
  // Лакокрасочные
  'vodoemulsionnye-kraski': { icon: PaintBucket, color: 'bg-sky-100 text-sky-600' },
  'emali': { icon: PaintBucket, color: 'bg-rose-100 text-rose-600' },
  'laki-i-propitki': { icon: Droplet, color: 'bg-amber-100 text-amber-600' },
  
  // Отделка
  'gruntovka': { icon: Droplets, color: 'bg-cyan-100 text-cyan-600' },
  'betonokontakt': { icon: Droplets, color: 'bg-pink-100 text-pink-600' },
  'gotovye-shpatlevki': { icon: Paintbrush, color: 'bg-violet-100 text-violet-600' },
  'klej': { icon: Droplet, color: 'bg-blue-100 text-blue-600' },
  'pena-montazhnaya': { icon: Cylinder, color: 'bg-yellow-100 text-yellow-600' },
  'steklotkan': { icon: Layers, color: 'bg-gray-100 text-gray-600' },
  
  // Инструменты
  'valiki': { icon: Paintbrush, color: 'bg-orange-100 text-orange-600' },
  'shpateli': { icon: Paintbrush, color: 'bg-slate-100 text-slate-600' },
  'kisti': { icon: Paintbrush, color: 'bg-amber-100 text-amber-600' },
  'svp': { icon: Ruler, color: 'bg-blue-100 text-blue-600' },
  'diski': { icon: Disc, color: 'bg-red-100 text-red-600' },
  'bity': { icon: Wrench, color: 'bg-zinc-100 text-zinc-600' },
};

const defaultIcon = { icon: Box, color: 'bg-sky-100 text-sky-600' };

// Принудительно динамический рендеринг для получения данных из БД
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Ревалидация каждые 60 секунд

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Подготавливаем данные для ItemListSchema
  const itemListItems = category.subcategories.map((sub) => ({
    name: sub.name,
    url: `https://stroydom30.ru/catalog/${categorySlug}/${sub.slug}`,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* SEO Schema.org разметка */}
      {category.subcategories.length > 0 && (
        <ItemListSchema
          items={itemListItems}
          name={`${category.name} - подкатегории`}
          url={`https://stroydom30.ru/catalog/${categorySlug}`}
        />
      )}

      {/* Хлебные крошки */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
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
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 lg:py-14">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            {category.name}
          </h1>
          {category.subcategories.length > 0 && (
            <p className="text-slate-300 text-sm sm:text-lg">
              {category.subcategories.length} подкатегорий товаров
            </p>
          )}
        </div>
      </section>

      {/* Подкатегории или товары */}
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {category.subcategories.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                Выберите подкатегорию
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">
                {category.subcategories.length} шт.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {category.subcategories.map((subcategory) => {
                const iconConfig = subcategoryIcons[subcategory.slug] || defaultIcon;
                const IconComponent = iconConfig.icon;
                
                return (
                  <Link
                    key={subcategory.slug}
                    href={`/catalog/${categorySlug}/${subcategory.slug}`}
                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-sky-200 transition-all hover:-translate-y-0.5"
                  >
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 ${iconConfig.color} rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    </div>
                    <div className="grow min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors text-sm sm:text-base">
                        {subcategory.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">Смотреть товары →</p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          // Если нет подкатегорий, показываем заглушку для товаров
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Box className="w-10 h-10 text-gray-400" />
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
