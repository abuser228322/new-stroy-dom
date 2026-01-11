// Реэкспорт компонента из новой модульной структуры
// Оригинальный код разбит на:
// - calculator/types.ts - типы и интерфейсы
// - calculator/config.ts - конфигурация материалов и иконки
// - calculator/utils.ts - функции расчёта
// - calculator/CategorySelector.tsx - выбор категории
// - calculator/ProductSelector.tsx - выбор продукта
// - calculator/InputFields.tsx - поля ввода
// - calculator/ResultCard.tsx - результат расчёта
// - calculator/index.tsx - основной компонент

export { default } from './calculator';
export * from './calculator/types';
export { CALCULATOR_CATEGORY_ICONS, MATERIALS_CONFIG } from './calculator/config';
