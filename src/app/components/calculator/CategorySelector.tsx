'use client';

import type { CategorySelectorProps, MaterialCategory } from './types';

export default function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  getCategoryInfo,
}: CategorySelectorProps) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Тип материала
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {categories.map((cat) => {
          const info = getCategoryInfo(cat);
          const IconComponent = info.Icon;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat as MaterialCategory)}
              className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-md scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-center mb-1">
                <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium leading-tight block">
                {info.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
