import { Metadata } from 'next';
import MaterialCalculator from '../components/MaterialCalculator';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Калькулятор материалов - Строй Дом',
  description: 'Онлайн калькулятор расчёта строительных материалов: штукатурка, шпатлёвка, плиточный клей, краска, грунтовка, профнастил, ГКЛ. Точные формулы по TDS производителей.',
  keywords: 'калькулятор материалов, расчёт штукатурки, расчёт краски, расход плиточного клея, калькулятор строительных материалов',
  openGraph: {
    title: 'Калькулятор материалов - Строй Дом',
    description: 'Онлайн калькулятор расчёта строительных материалов с возможностью добавления в корзину',
    url: 'https://stroydom30.ru/calculator',
    type: 'website',
  },
};

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Хлебные крошки */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-gray-900">Калькулятор материалов</span>
        </nav>
      </div>

      {/* Калькулятор в развёрнутом виде */}
      <MaterialCalculator alwaysExpanded className="!py-0" />

      {/* Информационный блок */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Как пользоваться калькулятором
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Выберите материал</h3>
                <p className="text-sm text-gray-600">
                  Укажите тип материала: штукатурка, шпатлёвка, плиточный клей, краска и др.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Выберите продукт</h3>
                <p className="text-sm text-gray-600">
                  Укажите конкретный продукт — расход рассчитывается по официальным TDS производителя.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Укажите параметры</h3>
                <p className="text-sm text-gray-600">
                  Введите площадь, толщину слоя и другие параметры для точного расчёта.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>💡 Совет:</strong> После расчёта вы можете сразу добавить нужное количество материала в корзину одним нажатием кнопки.
            </p>
          </div>
        </div>
      </section>

      {/* SEO текст */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Онлайн калькулятор строительных материалов
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              Наш калькулятор поможет точно рассчитать количество материалов для ремонта и строительства. 
              Все формулы основаны на официальных технических данных производителей (TDS): Волма, Knauf, 
              Ceresit, Литокс, Vetonit и других.
            </p>
            <p className="mt-3">
              <strong>Что можно рассчитать:</strong>
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong>Штукатурка</strong> — гипсовые и цементные смеси (Волма Слой, Knauf MP 75, Power Fasad)</li>
              <li><strong>Шпатлёвка</strong> — финишные и стартовые составы (Vetonit LR+, Волма Финиш)</li>
              <li><strong>Плиточный клей</strong> — для плитки и керамогранита (Ceresit CM11-17, Волма Керамик)</li>
              <li><strong>Смеси для пола</strong> — наливные полы и стяжки (Волма Нивелир, Пескобетон М300)</li>
              <li><strong>Краска и грунтовка</strong> — для внутренних и фасадных работ</li>
              <li><strong>Профнастил</strong> — МП-20 и С-8 для заборов и кровли</li>
              <li><strong>Гипсокартон</strong> — ГКЛ и ГКЛВ с расчётом комплектующих</li>
              <li><strong>Утеплитель</strong> — минеральная вата Isover, Rockwool, Тисма</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
