import { Metadata } from 'next';
import Link from 'next/link';
import { 
  FaLayerGroup, 
  FaCube, 
  FaSquare, 
  FaTemperatureHigh, 
  FaScrewdriver, 
  FaPaintRoller, 
  FaTh,
  FaTools,
  FaRuler,
  FaTint,
  FaPlug,
  FaWrench,
  FaHome,
  FaIndustry,
  FaRulerCombined,
  FaBoxOpen
} from 'react-icons/fa';
import { menuCategories } from '../mock/menuCategories';

export const metadata: Metadata = {
  title: 'Каталог строительных материалов | Строй Дом Астрахань',
  description:
    'Полный каталог строительных и отделочных материалов в Астрахани. Сухие смеси, профили, крепёж, утеплители, гидроизоляция, инструменты и многое другое. Низкие цены, доставка.',
  keywords: [
    'строительные материалы',
    'каталог',
    'Астрахань',
    'сухие смеси',
    'профили',
    'крепёж',
    'утеплитель',
  ],
  openGraph: {
    title: 'Каталог строительных материалов | Строй Дом',
    description: 'Полный каталог строительных и отделочных материалов в Астрахани',
    url: 'https://stroydom30.ru/catalog',
  },
};

// Иконки и цвета для категорий
const categoryStyles: Record<string, { icon: React.ElementType; gradient: string; bgColor: string }> = {
  'suhie-smesi': { icon: FaCube, gradient: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50' },
  'profili': { icon: FaRuler, gradient: 'from-slate-400 to-slate-600', bgColor: 'bg-slate-50' },
  'profnastil': { icon: FaLayerGroup, gradient: 'from-sky-400 to-sky-600', bgColor: 'bg-sky-50' },
  'gipsokarton': { icon: FaSquare, gradient: 'from-emerald-400 to-emerald-600', bgColor: 'bg-emerald-50' },
  'utepliteli': { icon: FaTemperatureHigh, gradient: 'from-violet-400 to-violet-600', bgColor: 'bg-violet-50' },
  'gidroizolyaciya': { icon: FaTint, gradient: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50' },
  'krepezh': { icon: FaScrewdriver, gradient: 'from-rose-400 to-rose-600', bgColor: 'bg-rose-50' },
  'instrumenty-i-rashodnye-materialy': { icon: FaTools, gradient: 'from-amber-400 to-amber-600', bgColor: 'bg-amber-50' },
  'otdelka': { icon: FaTh, gradient: 'from-cyan-400 to-cyan-600', bgColor: 'bg-cyan-50' },
  'lakokrasochnye-materialy': { icon: FaPaintRoller, gradient: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50' },
  'plity': { icon: FaBoxOpen, gradient: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-50' },
  'proftruby': { icon: FaIndustry, gradient: 'from-zinc-400 to-zinc-600', bgColor: 'bg-zinc-50' },
  'armatura': { icon: FaWrench, gradient: 'from-red-400 to-red-600', bgColor: 'bg-red-50' },
  'brus': { icon: FaHome, gradient: 'from-yellow-500 to-yellow-700', bgColor: 'bg-yellow-50' },
  'mayaki': { icon: FaRulerCombined, gradient: 'from-teal-400 to-teal-600', bgColor: 'bg-teal-50' },
  'izolyaciya': { icon: FaPlug, gradient: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50' },
};

const defaultStyle = { icon: FaBoxOpen, gradient: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50' };

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Хлебные крошки */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-sky-600 transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium">Каталог</li>
          </ol>
        </div>
      </nav>

      {/* Заголовок */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            Каталог товаров
          </h1>
          <p className="text-slate-300 max-w-2xl text-lg">
            Строительные и отделочные материалы для любых задач. Выберите категорию для
            просмотра товаров.
          </p>
          <div className="flex gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{menuCategories.length}</div>
              <div className="text-sm text-slate-400">категорий</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-slate-400">товаров</div>
            </div>
          </div>
        </div>
      </section>

      {/* Сетка категорий */}
      <section className="container mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuCategories.map((category) => {
            const style = categoryStyles[category.slug] || defaultStyle;
            const IconComponent = style.icon;
            
            return (
              <Link
                key={category.slug}
                href={`/catalog/${category.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-sky-200 hover:-translate-y-1"
              >
                {/* Иконка категории */}
                <div className={`relative h-44 ${style.bgColor} flex items-center justify-center overflow-hidden`}>
                  {/* Декоративные элементы */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white text-3xl" />
                  </div>
                  
                  {/* Количество подкатегорий */}
                  {category.subcategories.length > 0 && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {category.subcategories.length} подкатег.
                    </div>
                  )}
                </div>

                {/* Название и описание */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors mb-3">
                    {category.name}
                  </h2>
                  
                  {/* Список подкатегорий */}
                  {category.subcategories.length > 0 && (
                    <ul className="text-sm text-gray-500 space-y-1.5">
                      {category.subcategories.slice(0, 3).map((sub) => (
                        <li key={sub.slug} className="truncate flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full flex-shrink-0" />
                          {sub.name}
                        </li>
                      ))}
                      {category.subcategories.length > 3 && (
                        <li className="text-sky-600 font-medium">
                          + ещё {category.subcategories.length - 3}
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Кнопка */}
                <div className="px-5 pb-5">
                  <span className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-cyan-500 text-gray-700 group-hover:text-white font-semibold rounded-xl transition-all">
                    Смотреть товары
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SEO блок */}
      <section className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Строительные материалы в Астрахани
            </h2>
            <div className="prose prose-gray prose-lg">
              <p>
                Магазин «Строй Дом» предлагает широкий ассортимент строительных и отделочных
                материалов по доступным ценам. В нашем каталоге вы найдёте всё необходимое
                для строительства, ремонта и отделки помещений.
              </p>
              <p>
                Мы работаем напрямую с производителями и крупными поставщиками, что
                позволяет нам предлагать качественные материалы по конкурентным ценам.
                Осуществляем доставку по Астрахани и области.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
