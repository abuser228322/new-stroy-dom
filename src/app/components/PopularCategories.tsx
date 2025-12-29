'use client';

import React from "react";
import Link from "next/link";
import { 
  FaLayerGroup, 
  FaCube, 
  FaSquare, 
  FaTemperatureHigh, 
  FaScrewdriver, 
  FaPaintRoller, 
  FaTh,
  FaTools 
} from "react-icons/fa";
import { useCategories } from "@/hooks/useCategories";

// Маппинг иконок для категорий
const categoryIcons: Record<string, { icon: React.ElementType; gradient: string }> = {
  "profnastil": { icon: FaLayerGroup, gradient: "from-sky-400 to-sky-600" },
  "suhie-smesi": { icon: FaCube, gradient: "from-orange-400 to-orange-600" },
  "gipsokarton": { icon: FaSquare, gradient: "from-emerald-400 to-emerald-600" },
  "utepliteli": { icon: FaTemperatureHigh, gradient: "from-violet-400 to-violet-600" },
  "krepezh": { icon: FaScrewdriver, gradient: "from-rose-400 to-rose-600" },
  "lakokrasochnye-materialy": { icon: FaPaintRoller, gradient: "from-amber-400 to-amber-600" },
  "otdelka": { icon: FaTh, gradient: "from-cyan-400 to-cyan-600" },
  "instrumenty-i-rashodnye-materialy": { icon: FaTools, gradient: "from-slate-500 to-slate-700" },
};

// Выбираем 8 популярных категорий для отображения на главной
const popularCategorySlugs = [
  "profnastil",
  "suhie-smesi",
  "gipsokarton",
  "utepliteli",
  "krepezh",
  "lakokrasochnye-materialy",
  "otdelka",
  "instrumenty-i-rashodnye-materialy",
];

export default function PopularCategories() {
  const { categories, loading } = useCategories();
  
  // Выбираем популярные категории (первые 8 или по slugs)
  const popularCategories = categories
    .filter((cat) => popularCategorySlugs.includes(cat.slug))
    .slice(0, 8);

  // Показываем загрузку
  if (loading && categories.length === 0) {
    return (
      <section className="py-10 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-10 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-8 lg:mb-10">
          <div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Популярные категории
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base hidden sm:block">Выберите нужный раздел каталога</p>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 rounded-xl font-medium hover:bg-sky-100 transition-colors"
          >
            Все категории
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {popularCategories.map((category) => {
            const iconConfig = categoryIcons[category.slug] || { icon: FaCube, gradient: "from-gray-400 to-gray-600" };
            const IconComponent = iconConfig.icon;
            
            return (
              <Link
                key={category.slug}
                href={`/catalog/${category.slug}`}
                className="group bg-white hover:shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 transition-all duration-300 border border-gray-100 hover:border-sky-200 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Иконка категории */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-2 sm:mb-4 flex items-center justify-center bg-gradient-to-br ${iconConfig.gradient} rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white text-lg sm:text-2xl lg:text-3xl" />
                  </div>

                  {/* Название категории */}
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 group-hover:text-sky-600 transition-colors line-clamp-2 mb-1 sm:mb-2">
                    {category.name}
                  </h3>

                  {/* Количество подкатегорий */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                    {category.subcategories.length} подкатегор
                    {category.subcategories.length === 1
                      ? "ия"
                      : category.subcategories.length > 1 &&
                        category.subcategories.length < 5
                      ? "ии"
                      : "ий"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Показать все категории на мобильных */}
        <div className="mt-8 lg:hidden">
          <Link
            href="/catalog"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/30"
          >
            Смотреть все категории
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
