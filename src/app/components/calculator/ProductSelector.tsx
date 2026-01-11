'use client';

import type { ProductSelectorProps } from './types';

export default function ProductSelector({
  products,
  selectedProduct,
  productSizes,
  selectedSize,
  onProductChange,
  onSizeChange,
}: ProductSelectorProps) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Выберите продукт
      </label>
      <select
        value={selectedProduct.id}
        onChange={(e) => onProductChange(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none bg-white text-gray-800"
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} — {product.consumption} {product.consumptionUnit}
          </option>
        ))}
      </select>
      
      {selectedProduct.tooltip && (
        <p className="mt-1 text-xs text-gray-500">💡 {selectedProduct.tooltip}</p>
      )}

      {/* Варианты (объём/цвет/размер) */}
      {productSizes.length > 0 && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {(selectedProduct as any).sizeText || 'Вариант'}
          </label>
          <div className="flex flex-wrap gap-2">
            {productSizes.map(({ size, price }) => {
              const isActive = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeChange(size)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-sky-500'
                  }`}
                  aria-pressed={isActive}
                >
                  {size}
                  {isActive && price != null ? (
                    <span className="ml-2 text-xs opacity-90">
                      {Number(price).toLocaleString('ru-RU')} ₽
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
