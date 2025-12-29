"use client";

import { useState } from "react";
import Link from "next/link";
import { FaPercent, FaTruck, FaGift, FaCalendar, FaTag } from "react-icons/fa";

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  image: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: "Скидка 10% на сухие смеси",
    description: "При покупке от 10 мешков любых сухих смесей действует скидка 10%",
    discount: "-10%",
    validUntil: "До конца месяца",
    image: "/images/смеси/штук/promo.jpg",
    icon: <FaPercent />,
    color: "bg-red-500",
    link: "/catalog/suhie-smesi",
  },
  {
    id: 2,
    title: "Бесплатная доставка",
    description: "При заказе от 50 000 ₽ — бесплатная доставка по городу Астрахань",
    discount: "Бесплатно",
    validUntil: "Постоянная акция",
    image: "/images/delivery.jpg",
    icon: <FaTruck />,
    color: "bg-green-500",
    link: "/payment",
  },
  {
    id: 3,
    title: "Профнастил — хит продаж!",
    description: "Специальные цены на профнастил С-8 и МП-20. Выгодно для кровли и забора",
    discount: "Низкие цены",
    validUntil: "Пока есть на складе",
    image: "/images/профнастил/promo.jpg",
    icon: <FaTag />,
    color: "bg-blue-500",
    link: "/catalog/profnastil",
  },
  {
    id: 4,
    title: "Подарок за отзыв",
    description: "Оставьте отзыв о покупке и получите скидку 5% на следующий заказ",
    discount: "+5%",
    validUntil: "Постоянная акция",
    image: "/images/gift.jpg",
    icon: <FaGift />,
    color: "bg-purple-500",
    link: "/contacts",
  },
];

export default function SalesPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent to-orange-600 text-white py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Акции и спецпредложения</h1>
          <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto">
            Выгодные условия на покупку строительных материалов в магазине «Строй Дом»
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Promotions Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
          {promotions.map((promo) => (
            <Link
              href={promo.link}
              key={promo.id}
              className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300"
              onMouseEnter={() => setHoveredId(promo.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image placeholder */}
              <div className="relative h-32 sm:h-48 bg-gray-100 overflow-hidden">
                <div className={`absolute inset-0 ${promo.color} opacity-80 flex items-center justify-center`}>
                  <span className="text-white text-4xl sm:text-6xl opacity-20">
                    {promo.icon}
                  </span>
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-gray-800 px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg text-sm sm:text-base">
                  {promo.discount}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${promo.color} rounded-full flex items-center justify-center text-white shrink-0`}>
                    {promo.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{promo.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                    <FaCalendar className="shrink-0" />
                    <span className="truncate">{promo.validUntil}</span>
                  </div>
                  <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform text-xs sm:text-sm whitespace-nowrap ml-2">
                    Подробнее →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-8 sm:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 sm:p-8 md:p-12 text-white">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">
              Хотите узнать о новых акциях первыми?
            </h2>
            <p className="text-sm sm:text-lg opacity-90 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Звоните нам или следите за обновлениями на сайте. 
              Мы регулярно проводим распродажи и предлагаем специальные условия для наших клиентов.
            </p>
            <a
              href="tel:+79371333366"
              className="inline-block bg-white text-primary hover:bg-gray-100 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-lg transition-colors"
            >
              Позвонить: 8-937-133-33-66
            </a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 sm:mt-12 grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaPercent className="text-success text-xl sm:text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Постоянные скидки</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Для постоянных клиентов и оптовых покупателей действуют специальные цены
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaTruck className="text-primary text-xl sm:text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Выгодная доставка</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Бесплатная доставка при крупных заказах, скидки на транспорт
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaGift className="text-accent text-xl sm:text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Бонусы и подарки</h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Приятные бонусы при покупке, накопительная система скидок
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
