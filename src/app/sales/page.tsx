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
      <section className="bg-gradient-to-r from-accent to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Акции и спецпредложения</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Выгодные условия на покупку строительных материалов в магазине «Строй Дом»
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Promotions Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {promotions.map((promo) => (
            <Link
              href={promo.link}
              key={promo.id}
              className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300"
              onMouseEnter={() => setHoveredId(promo.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <div className={`absolute inset-0 ${promo.color} opacity-80 flex items-center justify-center`}>
                  <span className="text-white text-6xl opacity-20">
                    {promo.icon}
                  </span>
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full font-bold shadow-lg">
                  {promo.discount}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${promo.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                    {promo.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{promo.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendar />
                    <span>{promo.validUntil}</span>
                  </div>
                  <span className={`text-primary font-semibold group-hover:translate-x-1 transition-transform`}>
                    Подробнее →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Хотите узнать о новых акциях первыми?
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Звоните нам или следите за обновлениями на сайте. 
              Мы регулярно проводим распродажи и предлагаем специальные условия для наших клиентов.
            </p>
            <a
              href="tel:+79371333366"
              className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              Позвонить: 8-937-133-33-66
            </a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPercent className="text-success text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Постоянные скидки</h3>
            <p className="text-gray-600 text-sm">
              Для постоянных клиентов и оптовых покупателей действуют специальные цены
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-primary text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Выгодная доставка</h3>
            <p className="text-gray-600 text-sm">
              Бесплатная доставка при крупных заказах, скидки на транспорт
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGift className="text-accent text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Бонусы и подарки</h3>
            <p className="text-gray-600 text-sm">
              Приятные бонусы при покупке, накопительная система скидок
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
