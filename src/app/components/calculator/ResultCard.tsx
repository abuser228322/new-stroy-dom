'use client';

import type { ResultCardProps } from './types';

export default function ResultCard({
  result,
  canAddToCart,
  addedToCart,
  onAddToCart,
  amount,
  unit,
}: ResultCardProps) {
  return (
    <div className="bg-linear-to-br from-sky-50 to-cyan-50 rounded-xl p-4 sm:p-5 border border-sky-100">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Вам понадобится:</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {result.amount} <span className="text-base sm:text-lg font-normal text-gray-500">{result.unit}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{result.details}</p>
        </div>
        {result.estimatedPrice && (
          <div className="bg-white rounded-xl px-4 py-3 border border-sky-200 text-center sm:text-right shrink-0">
            <p className="text-xs text-gray-500">Ориентировочная стоимость</p>
            <p className="text-xl font-bold text-sky-600">
              {result.estimatedPrice.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}
      </div>
      
      {/* Кнопка добавления в корзину */}
      {canAddToCart && (
        <div className="pt-3 border-t border-sky-200/50 mb-3">
          <button
            onClick={onAddToCart}
            disabled={addedToCart}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              addedToCart 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {addedToCart ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Добавлено в корзину!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Добавить {amount} {unit} в корзину
              </>
            )}
          </button>
        </div>
      )}
      
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="pt-3 border-t border-sky-200/50">
          <p className="text-xs font-medium text-sky-700 mb-1.5">💡 Рекомендации:</p>
          <ul className="space-y-1">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-sky-500 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
