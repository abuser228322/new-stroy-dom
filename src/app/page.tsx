import { Metadata } from 'next';
import Link from 'next/link';
import { FaCheckCircle, FaRubleSign, FaTruck, FaHeadset, FaTools, FaHardHat, FaWarehouse, FaShieldAlt } from 'react-icons/fa';
import HeroSlider from './components/HeroSlider';
import PopularCategories from './components/PopularCategories';
import StoreInfo from './components/StoreInfo';
import ContactForm from './components/ContactForm';
import MaterialCalculator from './components/MaterialCalculator';

export const metadata: Metadata = {
  title: 'Строй Дом - Магазин строительных материалов в Астрахани',
  description:
    'Строительные материалы по низким ценам: профнастил, сухие смеси, гипсокартон, утеплители, крепёж, инструменты. Доставка по Астрахани.',
  openGraph: {
    title: 'Строй Дом - Магазин строительных материалов в Астрахани',
    description:
      'Строительные материалы по низким ценам: профнастил, сухие смеси, гипсокартон, утеплители, крепёж, инструменты.',
    url: 'https://stroydom30.ru',
    type: 'website',
    images: [
      {
        url: 'https://stroydom30.ru/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Строй Дом - Магазин строительных материалов',
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      {/* Слайдер */}
      <HeroSlider />

      {/* Hero секция */}
      <section className="relative overflow-hidden">
        {/* Градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Паттерн */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Цветовые акценты */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Текстовый блок */}
            <div className="text-white text-center lg:text-left">
              {/* Бейдж */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-medium">Пн-Сб 08:00-16:00, Вск 08:00-14:00</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Строительные
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                  материалы
                </span>
                в Астрахани
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Качественные материалы для строительства и ремонта по доступным ценам. 
                Профнастил, сухие смеси, гипсокартон и утеплители.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10 justify-center lg:justify-start">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <FaWarehouse className="text-lg" />
                  Перейти в каталог
                </Link>
                <a
                  href="tel:+79371333366"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  8-937-133-33-66
                </a>
              </div>
              
              {/* Мини-статистика */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div>
                  <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">16+</div>
                  <div className="text-xs sm:text-sm text-slate-400">категорий</div>
                </div>
                <div>
                  <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">1000+</div>
                  <div className="text-xs sm:text-sm text-slate-400">товаров</div>
                </div>
                <div>
                  <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white">10+</div>
                  <div className="text-xs sm:text-sm text-slate-400">лет опыта</div>
                </div>
              </div>
            </div>
            
            {/* Карточки товаров */}
            <div className="hidden lg:block relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Карточка 1 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <FaTools className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Инструменты</h3>
                  <p className="text-sm text-slate-400">Всё для строительства</p>
                </div>
                
                {/* Карточка 2 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mt-8 hover:bg-white/15 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-4">
                    <FaHardHat className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Профнастил</h3>
                  <p className="text-sm text-slate-400">Кровля и ограждения</p>
                </div>
                
                {/* Карточка 3 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <FaShieldAlt className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Утеплители</h3>
                  <p className="text-sm text-slate-400">Теплоизоляция</p>
                </div>
                
                {/* Карточка 4 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mt-8 hover:bg-white/15 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                    <FaWarehouse className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Сухие смеси</h3>
                  <p className="text-sm text-slate-400">Штукатурки, клеи</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-4 sm:py-6 lg:py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors text-center sm:text-left">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-sky-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-base">Качество</p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">От проверенных брендов</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors text-center sm:text-left">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shrink-0">
                <FaRubleSign className="text-emerald-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-base">Низкие цены</p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Без посредников</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors text-center sm:text-left">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shrink-0">
                <FaTruck className="text-orange-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-base">Доставка</p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">По Астрахани</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors text-center sm:text-left">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center shrink-0">
                <FaHeadset className="text-violet-600 text-lg sm:text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-base">Консультации</p>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Поможем выбрать</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные категории */}
      <PopularCategories />
      
      {/* Почему выбирают нас */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Почему выбирают «Строй Дом»
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем широкий ассортимент строительных материалов для любых задач — от небольшого ремонта до масштабного строительства
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Карточка 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-sky-100 transition-all group">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
                <FaWarehouse className="text-sky-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Широкий ассортимент</h3>
              <p className="text-gray-600 text-sm">
                Более 1000 наименований товаров в 16 категориях. Всё необходимое для строительства и ремонта в одном месте.
              </p>
            </div>
            
            {/* Карточка 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 transition-all group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <FaTruck className="text-orange-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Доставка по городу</h3>
              <p className="text-gray-600 text-sm">
                Оперативная доставка строительных материалов по Астрахани и области. Бесплатно при заказе от 50 000 ₽.
              </p>
            </div>
            
            {/* Карточка 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                <FaRubleSign className="text-emerald-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Конкурентные цены</h3>
              <p className="text-gray-600 text-sm">
                Работаем напрямую с производителями. Специальные условия для оптовых покупателей и постоянных клиентов.
              </p>
            </div>
            
            {/* Карточка 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-100 transition-all group">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500 transition-colors">
                <FaHeadset className="text-violet-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Экспертная помощь</h3>
              <p className="text-gray-600 text-sm">
                Наши специалисты помогут подобрать материалы под ваш проект и рассчитать необходимое количество.
              </p>
            </div>
            
            {/* Карточка 5 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-rose-100 transition-all group">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 transition-colors">
                <FaShieldAlt className="text-rose-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Гарантия качества</h3>
              <p className="text-gray-600 text-sm">
                Все товары имеют сертификаты качества. Работаем только с проверенными поставщиками и производителями.
              </p>
            </div>
            
            {/* Карточка 6 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-100 transition-all group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                <FaTools className="text-amber-600 text-xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Для профессионалов</h3>
              <p className="text-gray-600 text-sm">
                Работаем с юридическими лицами. Безналичный расчёт, все документы для бухгалтерии, отсрочка платежа.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Калькулятор материалов */}
      <MaterialCalculator useDatabase />

      {/* Информация о магазине */}
      <section className="container mx-auto px-4 py-12">
        <StoreInfo />
      </section>

      {/* CTA секция перед формой */}
      <section className="py-12 bg-gradient-to-r from-sky-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Нужна консультация?
          </h2>
          <p className="text-sky-100 mb-8 max-w-xl mx-auto">
            Позвоните нам или оставьте заявку — мы поможем подобрать материалы и рассчитаем стоимость вашего проекта
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+79371333366"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              8-937-133-33-66
            </a>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Оставить заявку
            </Link>
          </div>
        </div>
      </section>

      {/* Контактная форма */}
      <ContactForm />
    </>
  );
}
