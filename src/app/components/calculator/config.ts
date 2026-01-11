import {
  Ruler,
  PaintRoller,
  Droplet,
  Palette,
  Droplets,
  LayoutGrid,
  Grid2x2,
  Snowflake,
  Blocks,
  SprayCan,
  Layers,
  FileSpreadsheet,
  Cylinder,
  Grid3x3,
  Blend,
  Square,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { MaterialCategory, MaterialConfig } from './types';

// Маппинг slug категорий калькулятора -> Lucide иконки
export const CALCULATOR_CATEGORY_ICONS: Record<string, LucideIcon> = {
  'plaster': Ruler,
  'putty': PaintRoller,
  'floor': Blend,
  'tile_adhesive': Grid2x2,
  'paint': Palette,
  'drywall': LayoutGrid,
  'insulation': Snowflake,
  'masonry': Blocks,
  'profnastil': Layers,
  'gruntovka': Droplet,
  'adhesive_plaster': Home,
  'grout': Grid3x3,
  'enamel': SprayCan,
  'membrane': FileSpreadsheet,
  'pena': Cylinder,
  'primer': Droplets,
  'tile_glue': Grid2x2,
  'floor_mix': Blend,
  'gkl': LayoutGrid,
  'default': Square,
};

// ================== ДАННЫЕ О РАСХОДЕ МАТЕРИАЛОВ ==================

export const MATERIALS_CONFIG: Record<MaterialCategory, MaterialConfig> = {
  plaster: {
    name: 'Штукатурка',
    description: 'Расчёт гипсовой или цементной штукатурки',
    icon: '🧱',
    products: [
      { id: 'volma-sloy', name: 'Волма Слой 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 430, tooltip: 'Расход 8-9 кг/м² при слое 10мм (по TDS)', productUrlId: 'volma-sloy' },
      { id: 'volma-start', name: 'Волма Старт 30кг', consumption: 9, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 300, tooltip: 'Расход ~9 кг/м² при слое 10мм', productUrlId: 'volma-start' },
      { id: 'volma-gips-aktiv', name: 'Волма Гипс-актив 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 350, tooltip: 'Расход 8-9 кг/м² при слое 10мм', productUrlId: 'volma-gips-aktiv' },
      { id: 'knauf-mp75', name: 'Knauf MP 75 30кг', consumption: 8.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 380, tooltip: 'Машинное нанесение. Расход 8.5 кг/м² при 10мм', productUrlId: 'knauf-mp-75' },
      { id: 'litoks-start', name: 'Литокс Start 30кг', consumption: 9, consumptionUnit: 'кг/м² при 10мм', bagWeight: 30, price: 300, tooltip: 'Расход ~9 кг/м² при слое 10мм', productUrlId: 'litoks-start' },
      { id: 'volma-akvaplast', name: 'Волма Аквапласт 25кг', consumption: 9.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 400, tooltip: 'Влагостойкая. Расход 9-10 кг/м²', productUrlId: 'volma-akvaplast' },
      { id: 'litoks-aquaplast', name: 'Литокс AquaPlast 25кг', consumption: 9.5, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 500, tooltip: 'Влагостойкая. Расход 9-10 кг/м²', productUrlId: 'litoks-aquaplast' },
      { id: 'litoks-cemplast', name: 'Литокс CemPlast 25кг', consumption: 16, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 370, tooltip: 'Цементная. Расход 15-17 кг/м² при 10мм', productUrlId: 'litoks-cemplast' },
      { id: 'power-fasad', name: 'Power Fasad 25кг', consumption: 17, consumptionUnit: 'кг/м² при 10мм', bagWeight: 25, price: 300, tooltip: 'Фасадная цементная. Расход 16-18 кг/м²', productUrlId: 'power-fasad' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь поверхности', unit: 'м²', defaultValue: 20, min: 1, max: 1000, step: 1 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 10, min: 5, max: 50, step: 1, tooltip: 'Рекомендуемая толщина: 5-30мм' },
    ],
    calculate: (v, product) => {
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
      { id: 'volma-shov', name: 'Волма Шов 20кг', consumption: 0.25, consumptionUnit: 'кг/м.п. шва', bagWeight: 20, price: 430, tooltip: 'Для заделки швов ГКЛ. Расход ~0.25 кг/м.п.', productUrlId: 'volma-shov' },
      { id: 'volma-finish', name: 'Волма Финиш 20кг', consumption: 1.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 420, tooltip: 'Финишная. Расход 0.9-1.1 кг/м² при 1мм', productUrlId: 'volma-finish' },
      { id: 'volma-akvastandart', name: 'Волма Аквастандарт 20кг', consumption: 1.0, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 400, tooltip: 'Влагостойкая. Расход ~1 кг/м² при 1мм', productUrlId: 'volma-akvastandart' },
      { id: 'vetonit-lr', name: 'Vetonit LR+ 20кг', consumption: 1.2, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 1050, tooltip: 'Полимерная суперфинишная. Расход 1.2 кг/м² при 1мм', productUrlId: 'vetonit-lr' },
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
      { id: 'volma-keramik', name: 'Волма Керамик+ 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 400, tooltip: 'Универсальный. Расход 3-5 кг/м² в зависимости от гребёнки', productUrlId: 'volma-keramik-plyus' },
      { id: 'ceresit-cm11', name: 'Ceresit СМ 11 25кг', consumption: 4.2, consumptionUnit: 'кг/м² (зуб 8мм)', bagWeight: 25, price: 530, tooltip: 'Стандартный. Расход 3.5-4.5 кг/м² (зуб 8мм)', productUrlId: 'ceresit-sm-11' },
      { id: 'ceresit-cm16', name: 'Ceresit СМ 16 25кг', consumption: 4.5, consumptionUnit: 'кг/м² (зуб 10мм)', bagWeight: 25, price: 1350, tooltip: 'Для керамогранита. Расход 4-5 кг/м² (зуб 10мм)', productUrlId: 'ceresit-sm-16' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь укладки', unit: 'м²', defaultValue: 20, min: 1, max: 500, step: 1 },
      { key: 'toothSize', label: 'Размер зуба гребёнки', unit: 'мм', defaultValue: 8, min: 4, max: 12, step: 2, tooltip: '4-6мм мозаика, 6-8мм плитка, 10-12мм керамогранит' },
    ],
    calculate: (v, product) => {
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
      { id: 'volma-nivelir-20', name: 'Волма Нивелир 20кг', consumption: 1.6, consumptionUnit: 'кг/м² при 1мм', bagWeight: 20, price: 300, tooltip: 'Самовыравнивающийся. Расход 1.5-1.7 кг/м² при 1мм', productUrlId: 'volma-nivelir' },
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
      { id: 'arco-sten', name: 'Arco Iris для стен 14кг', consumption: 150, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1300, tooltip: 'Расход 150-180 г/м² в 1 слой', productUrlId: 'arco-iris-dlya-sten-14kg' },
      { id: 'arco-moyusch', name: 'Arco Iris моющаяся 14кг', consumption: 160, consumptionUnit: 'г/м² (1 слой)', bagWeight: 14, price: 1500, tooltip: 'Моющаяся. Расход 150-180 г/м²', productUrlId: 'arco-iris-moyushchayasya' },
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
      { id: 'arco-grunt-10', name: 'Arco Iris глубокая 10л', consumption: 100, consumptionUnit: 'мл/м²', bagWeight: 10, price: 500, tooltip: 'Расход 100-150 мл/м² (бетон, штукатурка)', productUrlId: 'arco-iris-gruntovka-10l' },
      { id: 'ceresit-ct17', name: 'Ceresit CT17 10л', consumption: 120, consumptionUnit: 'мл/м²', bagWeight: 10, price: 1200, tooltip: 'Универсальная. Расход 100-150 мл/м²', productUrlId: 'ceresit-ct17' },
    ],
    inputs: [
      { key: 'area', label: 'Площадь обработки', unit: 'м²', defaultValue: 30, min: 1, max: 1000, step: 1 },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 1, min: 1, max: 2, step: 1, tooltip: 'Пористые основания — 2 слоя' },
    ],
    calculate: (v, product) => {
      const isLiquid = product.consumptionUnit.includes('мл');
      const totalConsumption = v.area * product.consumption * v.layers;
      const totalL = isLiquid ? totalConsumption / 1000 : totalConsumption / 1000;
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
      { id: 'mp20-color', name: 'МП-20 цветной (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 1000, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 'mp-20-korichnevyy' },
      { id: 'mp20-otsink', name: 'МП-20 оцинкованный (ширина 1.15м)', consumption: 1.15, consumptionUnit: 'м ширина листа', bagWeight: 1, price: 850, tooltip: 'Ширина 1.15м, толщина 0.35мм. Цена за лист 2м', productUrlId: 'mp-20-otsinkovannyy' },
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
