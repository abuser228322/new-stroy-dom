'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';

// Типы материалов
type MaterialCategory = 
  | 'plaster'      // Штукатурка
  | 'putty'        // Шпатлёвка
  | 'tile_glue'    // Плиточный клей
  | 'floor_mix'    // Смеси для пола
  | 'paint'        // Краска
  | 'primer'       // Грунтовка
  | 'profnastil'   // Профнастил
  | 'gkl'          // Гипсокартон
  | 'insulation';  // Утеплитель

// Конкретные продукты с реальным расходом
interface ProductOption {
  id: string;
  catalogProductId?: number; // ID товара в каталоге для связи с корзиной
  name: string;
  consumption: number;      // Расход на единицу
  consumptionUnit: string;  // Единица расхода (кг/м² при 10мм, л/м² и т.д.)
  bagWeight?: number;       // Вес мешка/объём упаковки
  price?: number;           // Цена за упаковку
  tooltip?: string;         // Подсказка
  productUrlId?: string;    // URL товара в каталоге для добавления в корзину
}

interface MaterialConfig {
  name: string;
  description: string;
  icon: string;
  products: ProductOption[];
  inputs: InputConfig[];
  calculate: (values: Record<string, number>, product: ProductOption) => CalculationResult;
}

interface InputConfig {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

interface CalculationResult {
  amount: number;
  unit: string;
  totalWeight?: number;
  details: string;
  estimatedPrice?: number;
  recommendations?: string[];
}

// ================== ДАННЫЕ О РАСХОДЕ МАТЕРИАЛОВ ==================
// Источники: официальные TDS производителей (Волма, Knauf, Ceresit, Литокс)

const MATERIALS_CONFIG: Record<MaterialCategory, MaterialConfig> = {
  plaster: {
    name: 'Штукатурка',
    description: 'Расчёт гипсовой или цементной штукатурки',
    icon: '🧱',
    products: [
      // Гипсовые штукатурки
      { id: 'volma-sloy', name: 'Волма Слой 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 430, tooltip: 'Расход 8-9 кг/м² при слое 10мм (по TDS)', productUrlId: 'volma-sloy' },
      { id: 'volma-start', name: 'Волма Старт 30кг', consumption: 9, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 300, tooltip: 'Расход ~9 кг/м² при слое 10мм', productUrlId: 'volma-start' },
      { id: 'volma-gips-aktiv', name: 'Волма Гипс-актив 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 350, tooltip: 'Расход 8-9 кг/м² при слое 10мм', productUrlId: 'volma-gips-aktiv' },
      { id: 'knauf-mp75', name: 'Knauf MP 75 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 380, tooltip: 'Машинное нанесение. Расход 8.5 кг/м² при 10мм', productUrlId: 'knauf-mp-75' },
      { id: 'litoks-start', name: 'Литокс Start 30кг', consumption: 9, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 300, tooltip: 'Расход ~9 кг/м² при слое 10мм', productUrlId: 'litoks-start' },
      { id: 'volma-akvaplast', name: 'Волма Аквапласт 25кг', consumption: 9.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 400, tooltip: 'Влагостойкая. Расход 9-10 кг/м²', productUrlId: 'volma-akvaplast' },
      { id: 'litoks-aquaplast', name: 'Литокс AquaPlast 25кг', consumption: 9.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 500, tooltip: 'Влагостойкая. Расход 9-10 кг/м²', productUrlId: 'litoks-aquaplast' },
      // Цементные штукатурки
      { id: 'litoks-cemplast', name: 'Литокс CemPlast 25кг', consumption: 16, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 370, tooltip: 'Цементная. Расход 15-17 кг/м² при 10мм', productUrlId: 'litoks-cemplast' },
      { id: 'power-fasad', name: 'Power Fasad 25кг', consumption: 17, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 300, tooltip: 'Фасадная цементная. Расход 16-18 кг/м²', productUrlId: 'power-fasad' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь поверхности', unit: 'м²', defaultValue: 20, min: 1, max: 1000, step: 1 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 10, min: 5, max: 50, step: 1, tooltip: 'Рекомендуемая толщина: 5-30мм' },
    ],
    calculate: (v, product) => {
      // Формула: (площадь × расход × толщина / 10) / вес_мешка
      const totalKg = v.area * product.consumption * (v.thickness / 10);
      const bags = Math.ceil(totalKg / (product.bagWeight || 30));
      const price = product.price ? bags * product.price : undefined;
      return {
        amount: bags,
        unit: `мешков (${product.bagWeight}кг)`,
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: price,
        recommendations: [
          'Добавьте 10-15% на неровности основания',
          v.thickness > 30 ? 'При толщине >30мм наносите в несколько слоёв с армирующей сеткой' : '',
        ].filter(Boolean),
      };
    },
  },

  putty: {
    name: 'Шпатлёвка',
    description: 'Расчёт финишной или стартовой шпатлёвки',
    icon: '🎨',
    products: [
      // Гипсовые шпатлёвки
      { id: 'volma-shov', name: 'Волма Шов 20кг', consumption: 0.25, consumptionUnit: 'кг/м.п. шва', bagWeight: 20, price: 430, tooltip: 'Для заделки швов ГКЛ. Расход ~0.25 кг/м.п.', productUrlId: 'volma-shov' },
      { id: 'volma-finish', name: 'Волма Финиш 20кг', consumption: 1.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 420, tooltip: 'Финишная. Расход 0.9-1.1 кг/м² при 1мм', productUrlId: 'volma-finish' },
      { id: 'volma-akvastandart', name: 'Волма Аквастандарт 20кг', consumption: 1.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 400, tooltip: 'Влагостойкая. Расход ~1 кг/м² при 1мм', productUrlId: 'volma-akvastandart' },
      { id: 'volma-akvastandart-sv', name: 'Волма Аквастандарт Светлый 20кг', consumption: 1.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 570, tooltip: 'Светлая влагостойкая. Расход ~1 кг/м²', productUrlId: 'volma-akvastandart-svetlyy' },
      // Полимерные шпатлёвки
      { id: 'vetonit-lr', name: 'Vetonit LR+ 20кг', consumption: 1.2, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 1050, tooltip: 'Полимерная суперфинишная. Расход 1.2 кг/м² при 1мм', productUrlId: 'vetonit-lr' },
      { id: 'starateli-kr', name: 'Старатели КР 20кг', consumption: 1.1, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 650, tooltip: 'Полимерная финишная. Расход ~1.1 кг/м²', productUrlId: 'starateli-kr' },
      { id: 'litoks-satenlux', name: 'Литокс SatenLux 20кг', consumption: 1.1, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 500, tooltip: 'Акриловая финишная. Расход ~1.1 кг/м²', productUrlId: 'litoks-satenlux' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь поверхности', unit: 'м²', defaultValue: 20, min: 1, max: 1000, step: 1 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 1, min: 0.5, max: 5, step: 0.5, tooltip: 'Финишная: 0.5-2мм, Стартовая: 2-5мм' },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 2, min: 1, max: 3, step: 1 },
    ],
    calculate: (v, product) => {
      const totalKg = v.area * product.consumption * v.thickness * v.layers;
      const bags = Math.ceil(totalKg / (product.bagWeight || 20));
      const price = product.price ? bags * product.price : undefined;
      return {
        amount: bags,
        unit: `упаковок (${product.bagWeight}кг)`,
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг (${v.layers} слоя по ${v.thickness}мм)`,
        estimatedPrice: price,
        recommendations: [
          'Каждый слой должен высохнуть перед нанесением следующего',
          'После высыхания зашлифуйте поверхность',
        ],
      };
    },
  },

  tile_glue: {
    name: 'Плиточный клей',
    description: 'Расчёт клея для плитки и керамогранита',
    icon: '🔲',
    products: [
      // Стандартные клеи
      { id: 'volma-keramik', name: 'Волма Керамик+ 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 400, tooltip: 'Универсальный. Расход 3-5 кг/м² в зависимости от гребёнки', productUrlId: 'volma-keramik-plyus' },
      { id: 'volma-multikley', name: 'Волма Мультиклей 25кг', consumption: 4.0, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 500, tooltip: 'Универсальный. Расход 3.5-4.5 кг/м²', productUrlId: 'volma-multikley' },
      { id: 'ceresit-cm11', name: 'Ceresit СМ 11 25кг', consumption: 4.2, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 530, tooltip: 'Стандартный. Расход 3.5-4.5 кг/м² (зуб 8мм)', productUrlId: 'ceresit-sm-11' },
      { id: 'ceresit-cm14', name: 'Ceresit СМ 14 25кг', consumption: 4.0, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 800, tooltip: 'Улучшенный. Расход 3.5-4.5 кг/м²', productUrlId: 'ceresit-sm-14' },
      { id: 'mega-standart', name: 'Мега Стандарт 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 300, tooltip: 'Универсальный. Расход 4-5 кг/м²', productUrlId: 'mega-standart' },
      { id: 'habez-standart', name: 'Хабез Стандарт 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 300, tooltip: 'Стандартный. Расход 4-5 кг/м²', productUrlId: 'habez-standart' },
      { id: 'power-ceramic', name: 'Power Ceramic 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 300, tooltip: 'Универсальный. Расход 4-5 кг/м²', productUrlId: 'power-ceramic' },
      // Усиленные клеи для керамогранита
      { id: 'ceresit-cm16', name: 'Ceresit СМ 16 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 10мм)', bagWeight: 25, price: 1350, tooltip: 'Для керамогранита. Расход 4-5 кг/м² (зуб 10мм)', productUrlId: 'ceresit-sm-16' },
      { id: 'ceresit-cm17', name: 'Ceresit СМ 17 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 10мм)', bagWeight: 25, price: 2000, tooltip: 'Эластичный. Расход 4-5 кг/м² (зуб 10мм)', productUrlId: 'ceresit-sm-17' },
      { id: 'mega-keramogranit', name: 'Мега Керамогранит 25кг', consumption: 5.0, consumptionUnit: 'кг/м² (зуб 10мм)', bagWeight: 25, price: 370, tooltip: 'Для керамогранита. Расход 4.5-5.5 кг/м²', productUrlId: 'mega-keramogranit' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь укладки', unit: 'м²', defaultValue: 20, min: 1, max: 500, step: 1 },
      { key: 'toothSize', label: 'Размер зуба гребёнки', unit: 'мм', defaultValue: 8, min: 4, max: 12, step: 2, tooltip: '4-6мм мозаика, 6-8мм плитка, 10-12мм керамогранит' },
    ],
    calculate: (v, product) => {
      // Коррекция расхода в зависимости от размера зуба (базовый расход указан для 8мм)
      const correctionFactor = v.toothSize / 8;
      const consumptionCorrected = product.consumption * correctionFactor;
      const totalKg = v.area * consumptionCorrected;
      const bags = Math.ceil(totalKg / (product.bagWeight || 25));
      const price = product.price ? bags * product.price : undefined;
      return {
        amount: bags,
        unit: `мешков (${product.bagWeight}кг)`,
        totalWeight: totalKg,
        details: `Расход ${consumptionCorrected.toFixed(1)} кг/м², всего: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: price,
        recommendations: [
          'При неровном основании расход увеличивается на 15-25%',
          v.toothSize >= 10 ? 'Для крупноформатной плитки наносите клей и на плитку' : '',
        ].filter(Boolean),
      };
    },
  },

  floor_mix: {
    name: 'Смеси для пола',
    description: 'Расчёт наливного пола или стяжки',
    icon: '🏠',
    products: [
      // Наливные полы (тонкослойные)
      { id: 'volma-nivelir-20', name: 'Волма Нивелир 20кг', consumption: 1.6, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 300, tooltip: 'Самовыравнивающийся. Расход 1.5-1.7 кг/м² при 1мм', productUrlId: 'volma-nivelir' },
      { id: 'volma-nivelir-25', name: 'Волма Нивелир Экспресс 25кг', consumption: 1.6, consumptionUnit: 'кг/м² при 1мм', bagWeight: 25, price: 430, tooltip: 'Быстротвердеющий. Расход 1.5-1.7 кг/м² при 1мм', productUrlId: 'volma-nivelir-ekspress' },
      { id: 'litoks-kompozit', name: 'Литокс Композит 25кг', consumption: 1.7, consumptionUnit: 'кг/м² при 1мм', bagWeight: 25, price: 500, tooltip: 'Для тёплого пола. Расход 1.6-1.8 кг/м² при 1мм', productUrlId: 'litoks-kompozit' },
      { id: 'litoks-floorex', name: 'Литокс Floorex 25кг', consumption: 1.6, consumptionUnit: 'кг/м² при 1мм', bagWeight: 25, price: 500, tooltip: 'Быстрое выравнивание. Расход 1.5-1.7 кг/м²', productUrlId: 'litoks-floorex' },
      { id: 'starateli-nalivnoy', name: 'Старатели Наливной пол 25кг', consumption: 1.5, consumptionUnit: 'кг/м² при 1мм', bagWeight: 25, price: 350, tooltip: 'Самовыравнивающийся. Расход 1.4-1.6 кг/м²', productUrlId: 'starateli-nalivnoy-pol' },
      { id: 'power-nivelir', name: 'Power Nivelir 25кг', consumption: 1.6, consumptionUnit: 'кг/м² при 1мм', bagWeight: 25, price: 380, tooltip: 'Самовыравнивающийся. Расход 1.5-1.7 кг/м²', productUrlId: 'power-nivelir' },
      // Пескобетон (толстослойные стяжки)
      { id: 'peskobeton-m300', name: 'Пескобетон М300 40кг', consumption: 2.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 40, price: 180, tooltip: 'Для стяжки 30-100мм. Расход 1.9-2.1 кг/м² при 1мм', productUrlId: 'peskobeton-m300' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь пола', unit: 'м²', defaultValue: 20, min: 1, max: 500, step: 1 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 10, min: 3, max: 100, step: 1, tooltip: 'Наливной пол: 3-30мм, М300: 30-100мм' },
    ],
    calculate: (v, product) => {
      const totalKg = v.area * product.consumption * v.thickness;
      const bags = Math.ceil(totalKg / (product.bagWeight || 25));
      const price = product.price ? bags * product.price : undefined;
      return {
        amount: bags,
        unit: `мешков (${product.bagWeight}кг)`,
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: price,
        recommendations: [
          v.thickness > 30 ? 'При толщине >30мм используйте пескобетон М300' : 'Загрунтуйте основание перед заливкой',
          'Избегайте сквозняков при высыхании',
        ],
      };
    },
  },

  paint: {
    name: 'Краска',
    description: 'Расчёт краски для стен и потолков',
    icon: '🖌️',
    products: [
      // Водоэмульсионные краски
      { id: 'arco-sten', name: 'Arco Iris для стен 14кг', consumption: 150, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1300, tooltip: 'Расход 150-180 г/м² в 1 слой', productUrlId: 'arco-iris-dlya-sten-14kg' },
      { id: 'arco-sten-7', name: 'Arco Iris для стен 7кг', consumption: 150, consumptionUnit: 'г/м² (1 слой)', bagWeight: 7, price: 700, tooltip: 'Расход 150-180 г/м² в 1 слой', productUrlId: 'arco-iris-dlya-sten-7kg' },
      { id: 'arco-sten-3', name: 'Arco Iris для стен 3кг', consumption: 150, consumptionUnit: 'г/м² (1 слой)', bagWeight: 3, price: 350, tooltip: 'Расход 150-180 г/м² в 1 слой', productUrlId: 'arco-iris-dlya-sten-3kg' },
      { id: 'arco-moyusch', name: 'Arco Iris моющаяся 14кг', consumption: 160, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1500, tooltip: 'Моющаяся. Расход 150-180 г/м²', productUrlId: 'arco-iris-moyushchayasya' },
      { id: 'arco-fasad', name: 'Arco Iris фасадная 14кг', consumption: 180, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1600, tooltip: 'Фасадная. Расход 170-200 г/м²', productUrlId: 'arco-iris-fasadnaya' },
      { id: 'lakra-sten', name: 'Лакра для стен 14кг', consumption: 150, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1100, tooltip: 'Расход 140-160 г/м² в 1 слой', productUrlId: 'lakra-dlya-sten' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь окрашивания', unit: 'м²', defaultValue: 30, min: 1, max: 1000, step: 1 },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 2, min: 1, max: 3, step: 1 },
    ],
    calculate: (v, product) => {
      const totalG = v.area * product.consumption * v.layers;
      const totalKg = totalG / 1000;
      const cans = Math.ceil(totalKg / (product.bagWeight || 14));
      const price = product.price ? cans * product.price : undefined;
      return {
        amount: cans,
        unit: `вёдер (${product.bagWeight}кг)`,
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: price,
        recommendations: [
          'Загрунтуйте поверхность перед покраской',
          'Между слоями давайте высохнуть 2-4 часа',
        ],
      };
    },
  },

  primer: {
    name: 'Грунтовка',
    description: 'Расчёт грунтовки для подготовки оснований',
    icon: '💧',
    products: [
      // Грунтовки глубокого проникновения
      { id: 'arco-grunt-10', name: 'Arco Iris глубокая 10л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 10, price: 500, tooltip: 'Расход 100-150 мл/м² (бетон, штукатурка)', productUrlId: 'arco-iris-gruntovka-10l' },
      { id: 'arco-grunt-5', name: 'Arco Iris глубокая 5л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 5, price: 300, tooltip: 'Расход 100-150 мл/м²', productUrlId: 'arco-iris-gruntovka-5l' },
      { id: 'ceresit-ct17', name: 'Ceresit CT17 10л', consumption: 120, consumptionUnit: 'мл/м²', bagWeight: 10, price: 1200, tooltip: 'Универсальная. Расход 100-150 мл/м²', productUrlId: 'ceresit-ct17' },
      { id: 'optimist-grunt', name: 'Оптимист 10л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 10, price: 850, tooltip: 'Расход 80-120 мл/м²', productUrlId: 'optimist-gruntovka' },
      { id: 'vetonit-grunt', name: 'Vetonit глубокая 10л', consumption: 120, consumptionUnit: 'мл/м²', bagWeight: 10, price: 1200, tooltip: 'Расход 100-150 мл/м²', productUrlId: 'vetonit-gruntovka' },
      { id: 'knauf-tifen', name: 'Knauf Тифенгрунд 10л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 10, price: 1350, tooltip: 'Готовая к применению. Расход 100 мл/м²', productUrlId: 'knauf-tifengrund' },
      { id: 'lakra-inter', name: 'Лакра интерьерная 10л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 10, price: 750, tooltip: 'Расход 100-120 мл/м²', productUrlId: 'lakra-gruntovka' },
      // Бетоноконтакт
      { id: 'ceresit-ct19', name: 'Ceresit CT19 15кг', consumption: 300, consumptionUnit: 'г/м²', bagWeight: 15, price: 2100, tooltip: 'Бетоноконтакт. Расход 300-400 г/м²', productUrlId: 'ceresit-ct19' },
      { id: 'habez-betkon', name: 'Хабез Бетоноконтакт 12кг', consumption: 300, consumptionUnit: 'г/м²', bagWeight: 12, price: 1000, tooltip: 'Бетоноконтакт. Расход 300-400 г/м²', productUrlId: 'habez-betonokontakt' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь обработки', unit: 'м²', defaultValue: 30, min: 1, max: 1000, step: 1 },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 1, min: 1, max: 2, step: 1, tooltip: 'Пористые основания — 2 слоя' },
    ],
    calculate: (v, product) => {
      // Проверяем единицы (мл или г)
      const isLiquid = product.consumptionUnit.includes('мл');
      const totalConsumption = v.area * product.consumption * v.layers;
      const totalL = isLiquid ? totalConsumption / 1000 : totalConsumption / 1000; // и г и мл переводим в кг/л
      const cans = Math.ceil(totalL / (product.bagWeight || 10));
      const price = product.price ? cans * product.price : undefined;
      return {
        amount: cans,
        unit: isLiquid ? `канистр (${product.bagWeight}л)` : `вёдер (${product.bagWeight}кг)`,
        totalWeight: totalL,
        details: `Общий расход: ${totalL.toFixed(1)} ${isLiquid ? 'л' : 'кг'}`,
        estimatedPrice: price,
        recommendations: [
          v.layers === 1 ? 'На пористых основаниях нанесите 2 слоя' : '',
          'Дайте высохнуть 1-4 часа перед следующим этапом',
        ].filter(Boolean),
      };
    },
  },

  profnastil: {
    name: 'Профнастил',
    description: 'Расчёт листов профнастила для забора или кровли',
    icon: '📐',
    products: [
      // Только товары из каталога - МП-20 и С-8, оба с шириной 1.15м
      { id: 'mp20-color', name: 'МП-20 цветной (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 1000, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 'mp-20-korichnevyy' },
      { id: 'mp20-otsink', name: 'МП-20 оцинкованный (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 850, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 'mp-20-otsinkovannyy' },
      { id: 'c8-color', name: 'С-8 цветной (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 1000, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 's-8-belyy' },
      { id: 'c8-premium', name: 'С-8 под дерево/камень (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 1800, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 's-8-morenyy-dub' },
    ],
    inputs: [
      { key: 'length', label: 'Длина забора/кровли', unit: 'м', defaultValue: 20, min: 1, max: 500, step: 1 },
      { key: 'height', label: 'Высота листа', unit: 'м', defaultValue: 2, min: 0.5, max: 12, step: 0.5, tooltip: 'Высота забора или ширина ската кровли' },
    ],
    calculate: (v, product) => {
      const sheets = Math.ceil(v.length / product.consumption);
      const totalArea = v.length * v.height;
      return {
        amount: sheets,
        unit: `листов (${v.height}×${product.consumption}м)`,
        details: `Общая площадь: ${totalArea.toFixed(1)} м²`,
        recommendations: [
          `Саморезов потребуется: ~${Math.ceil(totalArea * 8)} шт (8 шт/м²)`,
          'Закажите листы нужной длины для минимума отходов',
        ],
      };
    },
  },

  gkl: {
    name: 'Гипсокартон',
    description: 'Расчёт листов ГКЛ и комплектующих',
    icon: '📋',
    products: [
      { id: 'gkl-9.5', name: 'ГКЛ 9.5мм (2500×1200)', consumption: 3, consumptionUnit: 'м² на лист', bagWeight: 1, tooltip: 'Площадь листа 3м². Для потолков', productUrlId: 'gkl-9-5mm' },
      { id: 'gkl-12.5', name: 'ГКЛ 12.5мм (2500×1200)', consumption: 3, consumptionUnit: 'м² на лист', bagWeight: 1, tooltip: 'Площадь листа 3м². Для стен', productUrlId: 'gkl-12-5mm' },
      { id: 'gklv-12.5', name: 'ГКЛВ 12.5мм влагостойкий', consumption: 3, consumptionUnit: 'м² на лист', bagWeight: 1, tooltip: 'Площадь листа 3м². Для влажных помещений', productUrlId: 'gklv-12-5mm' },
      { id: 'gkl-3000', name: 'ГКЛ 12.5мм (3000×1200)', consumption: 3.6, consumptionUnit: 'м² на лист', bagWeight: 1, tooltip: 'Площадь листа 3.6м²', productUrlId: 'gkl-12-5mm-3000' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь обшивки', unit: 'м²', defaultValue: 20, min: 1, max: 500, step: 1 },
      { key: 'layers', label: 'Слоёв ГКЛ', unit: 'шт', defaultValue: 1, min: 1, max: 2, step: 1, tooltip: '2 слоя для шумоизоляции' },
      { key: 'waste', label: 'Запас на отходы', unit: '%', defaultValue: 10, min: 5, max: 20, step: 5 },
    ],
    calculate: (v, product) => {
      const areaWithWaste = v.area * (1 + v.waste / 100);
      const sheets = Math.ceil(areaWithWaste * v.layers / product.consumption);
      return {
        amount: sheets,
        unit: 'листов',
        details: `С учётом ${v.waste}% запаса: ${(areaWithWaste * v.layers).toFixed(1)} м²`,
        recommendations: [
          `Профиль ПП 60×27: ~${Math.ceil(v.area * 2.5)} м.п.`,
          `Профиль ПН 28×27: ~${Math.ceil(v.area * 0.8)} м.п.`,
          `Подвесы: ~${Math.ceil(v.area * 1)} шт`,
          `Саморезы 3.5×25: ~${Math.ceil(v.area * v.layers * 25)} шт`,
        ],
      };
    },
  },

  insulation: {
    name: 'Утеплитель',
    description: 'Расчёт минеральной ваты',
    icon: '🧊',
    products: [
      { id: 'isover-strong', name: 'Isover СТРОНГ (6.1м² в уп.)', consumption: 6.1, consumptionUnit: 'м² в упаковке', bagWeight: 1, tooltip: 'Толщина 50мм, 6.1м² в упаковке', productUrlId: 'isover-strong' },
      { id: 'isover-100', name: 'Isover Теплый Дом (10м² в уп.)', consumption: 10, consumptionUnit: 'м² в упаковке', bagWeight: 1, tooltip: 'Толщина 50мм, 10м² в упаковке', productUrlId: 'isover-teplyy-dom' },
      { id: 'tisma-20', name: 'Тисма (20м² в уп.)', consumption: 20, consumptionUnit: 'м² в упаковке', bagWeight: 1, tooltip: 'Рулон, 20м² в упаковке', productUrlId: 'tisma' },
      { id: 'rockwool', name: 'Rockwool Лайт Баттс (6м² в уп.)', consumption: 6, consumptionUnit: 'м² в упаковке', bagWeight: 1, tooltip: 'Плиты 1000×600мм, 6м² в упаковке', productUrlId: 'rockwool-layt-batts' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь утепления', unit: 'м²', defaultValue: 30, min: 1, max: 1000, step: 1 },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 1, min: 1, max: 3, step: 1, tooltip: '2 слоя = 100мм при 50мм плитах' },
      { key: 'waste', label: 'Запас на отходы', unit: '%', defaultValue: 5, min: 0, max: 15, step: 5 },
    ],
    calculate: (v, product) => {
      const areaWithWaste = v.area * (1 + v.waste / 100) * v.layers;
      const packages = Math.ceil(areaWithWaste / product.consumption);
      return {
        amount: packages,
        unit: 'упаковок',
        details: `Общая площадь: ${areaWithWaste.toFixed(1)} м²`,
        recommendations: [
          'Укладывайте плотно без зазоров',
          v.layers > 1 ? 'Укладывайте слои со смещением швов' : '',
          'Используйте пароизоляционную плёнку',
        ].filter(Boolean),
      };
    },
  },
};

// ================== ФУНКЦИЯ РАСЧЕТА ДЛЯ ДАННЫХ ИЗ БД ==================

function createCalculateFunction(formula: ApiFormula | null): MaterialConfig['calculate'] {
  if (!formula) {
    // Дефолтная формула по площади
    return (v, product) => {
      const totalKg = (v.area || 0) * product.consumption;
      const bags = Math.ceil(totalKg / (product.bagWeight || 25));
      return {
        amount: bags,
        unit: product.bagWeight ? `мешков (${product.bagWeight}кг)` : 'шт',
        totalWeight: totalKg,
        details: `Общий расход: ${totalKg.toFixed(1)} кг`,
        estimatedPrice: product.price ? bags * product.price : undefined,
      };
    };
  }

  const { formulaType, formulaParams, resultUnit, resultUnitTemplate, recommendationsTemplate } = formula;

  return (v, product) => {
    let amount = 0;
    let totalWeight = 0;
    let details = '';
    let unit = resultUnit;
    
    // Безопасная обработка параметров формулы
    const params = formulaParams || {};
    const areaKey = params.areaKey || 'area';
    const thicknessKey = params.thicknessKey || 'thickness';
    const layersKey = params.layersKey || 'layers';
    const volumeKey = params.volumeKey || 'volume';
    const lengthKey = params.lengthKey || 'length';
    const quantityKey = params.quantityKey || 'width';
    
    switch (formulaType) {
      case 'area': {
        // Формула по площади: area × consumption × (thickness/10) × layers
        const area = v[areaKey] || 0;
        const thickness = v[thicknessKey] || 10;
        const layers = v[layersKey] || 1;
        
        if (product.consumptionUnit.includes('/см') || product.consumptionUnit.includes('при 10мм') || product.consumptionUnit.includes('/м²/см')) {
          // Расход при толщине 10мм (1см) - умножаем на thickness/10
          totalWeight = area * product.consumption * (thickness / 10) * layers;
        } else if (product.consumptionUnit.includes('/мм') || product.consumptionUnit.includes('при 1мм') || product.consumptionUnit.includes('/м²/мм')) {
          // Расход при толщине 1мм - умножаем на thickness
          totalWeight = area * product.consumption * thickness * layers;
        } else {
          // Простой расход на м² (краска, шпаклёвка, грунтовка, плиточный клей)
          totalWeight = area * product.consumption * layers;
        }
        
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Общий расход: ${totalWeight.toFixed(1)} ${resultUnit}`;
        break;
      }
      
      case 'volume': {
        // Формула по объему
        const volume = v[volumeKey] || (v.area || 0) * (v.thickness || 50) / 1000;
        totalWeight = volume * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Объём: ${volume.toFixed(2)} м³`;
        break;
      }
      
      case 'sheets': {
        // Листовой материал (ГКЛ, утеплитель, профнастил)
        // Для профнастила: width (ширина покрытия) / consumption (рабочая ширина листа)
        // Для ГКЛ/утеплителя: area / consumption (площадь листа/упаковки)
        const area = v[areaKey] || 0;
        const length = v[lengthKey] || 0;
        const width = v.width || 0;
        const wastePercent = params.wastePercent || 10;
        
        // Если есть длина и ширина - это профнастил, считаем по ширине
        if (length > 0 && width > 0 && product.consumptionUnit.includes('ширины')) {
          // Профнастил: количество листов = ширина покрытия / рабочая ширина листа
          const sheetsNeeded = Math.ceil(width / product.consumption);
          amount = sheetsNeeded;
          unit = resultUnitTemplate || 'листов';
          details = `Покрытие ${length}м × ${width}м. Листов: ${sheetsNeeded} шт (рабочая ширина ${product.consumption}м)`;
        } else {
          // ГКЛ/утеплитель: количество = площадь / площадь листа/упаковки
          const sheetArea = product.consumption;
          const areaWithWaste = area * (1 + wastePercent / 100);
          amount = Math.ceil(areaWithWaste / sheetArea);
          unit = resultUnitTemplate || `упаковок`;
          details = `Общий расход: ${areaWithWaste.toFixed(1)} м² (с запасом ${wastePercent}%)`;
        }
        break;
      }
      
      case 'pieces': {
        // Штучный расчет (клей для блоков)
        const quantity = v[quantityKey] || v.blocks || 0;
        totalWeight = quantity * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Общий расход: ${totalWeight.toFixed(1)} ${resultUnit}`;
        break;
      }
      
      default: {
        // Простой расчет
        const area = v.area || 0;
        totalWeight = area * product.consumption;
        amount = product.bagWeight ? Math.ceil(totalWeight / product.bagWeight) : Math.ceil(totalWeight);
        unit = product.bagWeight ? `мешков (${product.bagWeight}кг)` : resultUnit;
        details = `Общий расход: ${totalWeight.toFixed(1)} ${resultUnit}`;
      }
    }

    const estimatedPrice = product.price ? amount * product.price : undefined;
    
    // Рекомендации из шаблона
    let recommendations: string[] = [];
    if (recommendationsTemplate) {
      if (recommendationsTemplate.tips) {
        recommendations = [...recommendationsTemplate.tips];
      }
      if (recommendationsTemplate.warnings) {
        recommendations = [...recommendations, ...recommendationsTemplate.warnings];
      }
    }

    return {
      amount,
      unit,
      totalWeight,
      details,
      estimatedPrice,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  };
}

// ================== КОМПОНЕНТ КАЛЬКУЛЯТОРА ==================

interface MaterialCalculatorProps {
  className?: string;
  alwaysExpanded?: boolean;  // Для отдельной страницы калькулятора
  useDatabase?: boolean;     // Загружать данные из БД
}

// Интерфейсы для данных из API
interface ApiProduct {
  id: number;
  catalogProductId: number | null; // ID товара в каталоге для связи
  name: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight: number | null;
  price: number;
  tooltip: string | null;
  productUrlId: string | null;
}

interface ApiInput {
  id: number;
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  minValue: number;
  maxValue: number | null;
  step: number;
  tooltip: string | null;
}

interface ApiFormula {
  id: number;
  formulaType: string;
  formulaParams: Record<string, any>;
  resultUnit: string;
  resultUnitTemplate: string | null;
  recommendationsTemplate: any;
}

interface ApiCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  isActive: boolean;
  products: ApiProduct[];
  inputs: ApiInput[];
  formula: ApiFormula | null;
}

export default function MaterialCalculator({ className = '', alwaysExpanded = false, useDatabase = false }: MaterialCalculatorProps) {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | string>('plaster');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [values, setValues] = useState<Record<string, number>>({});
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Состояния для данных из БД
  const [dbCategories, setDbCategories] = useState<ApiCategory[]>([]);
  const [dbLoading, setDbLoading] = useState(useDatabase);
  const [dbError, setDbError] = useState<string | null>(null);

  // Загрузка данных из БД
  useEffect(() => {
    if (!useDatabase) return;
    
    const fetchData = async () => {
      try {
        setDbLoading(true);
        const res = await fetch('/api/calculator');
        if (!res.ok) throw new Error('Failed to fetch calculator data');
        const data = await res.json();
        
        if (data.length > 0) {
          setDbCategories(data);
          setSelectedCategory(data[0].slug);
        } else {
          // Если данных нет в БД, используем локальные
          setDbError('Данные калькулятора не найдены в базе');
        }
      } catch (error) {
        console.error('Error fetching calculator data:', error);
        setDbError('Ошибка загрузки данных');
      } finally {
        setDbLoading(false);
      }
    };
    
    fetchData();
  }, [useDatabase]);

  // Определяем конфиг в зависимости от источника данных
  const { config, categories, isDbMode } = useMemo(() => {
    // Если используем БД и данные загружены
    if (useDatabase && dbCategories.length > 0) {
      const dbCat = dbCategories.find(c => c.slug === selectedCategory);
      if (dbCat) {
        // Конвертируем данные API в формат MaterialConfig
        const convertedConfig: MaterialConfig = {
          name: dbCat.name,
          description: dbCat.description || '',
          icon: dbCat.icon,
          products: dbCat.products.map(p => ({
            id: p.id.toString(),
            catalogProductId: p.catalogProductId || undefined, // Реальный ID товара в каталоге
            name: p.name,
            consumption: p.consumption,
            consumptionUnit: p.consumptionUnit,
            bagWeight: p.bagWeight || undefined,
            price: p.price,
            tooltip: p.tooltip || undefined,
            productUrlId: p.productUrlId || undefined,
          })),
          inputs: dbCat.inputs.map(i => ({
            key: i.key,
            label: i.label,
            unit: i.unit,
            defaultValue: i.defaultValue,
            min: i.minValue,
            max: i.maxValue || 10000,
            step: i.step,
            tooltip: i.tooltip || undefined,
          })),
          calculate: createCalculateFunction(dbCat.formula),
        };
        return {
          config: convertedConfig,
          categories: dbCategories.map(c => c.slug),
          isDbMode: true,
        };
      }
    }
    
    // Фолбэк на локальные данные
    return {
      config: MATERIALS_CONFIG[selectedCategory as MaterialCategory] || MATERIALS_CONFIG.plaster,
      categories: Object.keys(MATERIALS_CONFIG) as string[],
      isDbMode: false,
    };
  }, [useDatabase, dbCategories, selectedCategory]);
  
  // Выбранный продукт (или первый по умолчанию)
  const selectedProduct = useMemo(() => {
    return config.products.find(p => p.id === selectedProductId) || config.products[0];
  }, [config, selectedProductId]);

  // Текущие значения с дефолтами
  const currentValues = useMemo(() => {
    const defaults: Record<string, number> = {};
    config.inputs.forEach(input => {
      defaults[input.key] = values[input.key] ?? input.defaultValue;
    });
    return defaults;
  }, [config, values]);

  // Результат расчёта
  const result = useMemo(() => {
    return config.calculate(currentValues, selectedProduct);
  }, [config, currentValues, selectedProduct]);

  const handleCategoryChange = (category: MaterialCategory) => {
    setSelectedCategory(category);
    setSelectedProductId('');
    setValues({});
    setAddedToCart(false);
  };

  const handleValueChange = (key: string, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setAddedToCart(false);
  };

  // Добавление в корзину
  const handleAddToCart = () => {
    if (!selectedProduct.productUrlId || !selectedProduct.price) return;
    
    // Используем catalogProductId (реальный ID товара) если есть, иначе id записи калькулятора
    const productIdForCart = selectedProduct.catalogProductId 
      ? selectedProduct.catalogProductId.toString() 
      : selectedProduct.id;
    
    addItem({
      productId: productIdForCart,
      title: selectedProduct.name,
      urlId: selectedProduct.productUrlId,
      image: null,
      price: selectedProduct.price,
      quantity: result.amount,
      unit: result.unit,
      mainCategory: config.name,
      subCategory: config.name,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // Категории уже определены в useMemo выше
  // const categories = Object.keys(MATERIALS_CONFIG) as MaterialCategory[];
  
  // Получаем название/иконку категории
  const getCategoryInfo = useCallback((slug: string) => {
    if (isDbMode) {
      const cat = dbCategories.find(c => c.slug === slug);
      return { name: cat?.name || slug, icon: cat?.icon || '📦' };
    }
    const localConfig = MATERIALS_CONFIG[slug as MaterialCategory];
    return { name: localConfig?.name || slug, icon: localConfig?.icon || '📦' };
  }, [isDbMode, dbCategories]);

  // Показываем загрузку
  if (dbLoading) {
    return (
      <section className={alwaysExpanded ? className : `py-8 lg:py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка калькулятора...</p>
          </div>
        </div>
      </section>
    );
  }

  // Показываем ошибку (но продолжаем с локальными данными)
  if (dbError && !isDbMode) {
    console.warn('Calculator: using local data fallback:', dbError);
  }

  return (
    <section className={alwaysExpanded ? className : `py-8 lg:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Заголовок */}
          {alwaysExpanded ? (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-xl sm:text-2xl">Калькулятор материалов</h1>
                  <p className="text-sky-100 text-sm">Точный расчёт на основе данных производителей</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-lg sm:text-xl">Калькулятор материалов</h2>
                  <p className="text-sky-100 text-sm">Точный расчёт на основе данных производителей</p>
                </div>
              </div>
              <svg 
                className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {(isExpanded || alwaysExpanded) && (
            <div className="p-4 sm:p-6">
              {/* Выбор категории */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип материала
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                  {categories.map((cat) => {
                    const info = getCategoryInfo(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat as MaterialCategory)}
                        className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                          selectedCategory === cat
                            ? 'bg-sky-500 text-white shadow-md scale-105'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg sm:text-2xl block mb-1">{info.icon}</span>
                        <span className="text-[10px] sm:text-xs font-medium leading-tight block">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Выбор конкретного продукта */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите продукт
                </label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none bg-white text-gray-800"
                >
                  {config.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.consumption} {product.consumptionUnit}
                    </option>
                  ))}
                </select>
                {selectedProduct.tooltip && (
                  <p className="mt-1 text-xs text-gray-500">💡 {selectedProduct.tooltip}</p>
                )}
              </div>

              {/* Поля ввода */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                {config.inputs.map((input) => (
                  <div key={input.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        {input.label}
                        {input.tooltip && (
                          <span className="group relative cursor-help">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {input.tooltip}
                            </span>
                          </span>
                        )}
                      </label>
                      <span className="text-sm font-semibold text-sky-600">{currentValues[input.key]} {input.unit}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={currentValues[input.key]}
                        onChange={(e) => handleValueChange(input.key, parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-sky-500"
                      />
                      <input
                        type="number"
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        value={currentValues[input.key]}
                        onChange={(e) => handleValueChange(input.key, parseFloat(e.target.value) || input.min)}
                        className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Результат */}
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 sm:p-5 border border-sky-100">
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
                      <p className="text-xl font-bold text-sky-600">{result.estimatedPrice.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  )}
                </div>
                
                {/* Кнопка добавления в корзину */}
                {selectedProduct.productUrlId && selectedProduct.price && (
                  <div className="pt-3 border-t border-sky-200/50 mb-3">
                    <button
                      onClick={handleAddToCart}
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
                          Добавить {result.amount} {result.unit} в корзину
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

              {/* Дисклеймер */}
              <p className="mt-4 text-xs text-gray-400 text-center">
                * Расчёт является приблизительным. Точный расход зависит от состояния основания и техники нанесения.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
