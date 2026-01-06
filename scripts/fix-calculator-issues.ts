/**
 * Скрипт для исправления проблем калькулятора:
 * 1. Добавление bagWeight для грунтовки (объём канистры)
 * 2. Добавление bagWeight и price для краски (вес ведра)
 * 3. Добавление bagWeight и price для ГКЛ (1 лист)
 * 4. Перенос Литокс Бриз и Кнауф Севенер в категорию штукатурно-клеевых смесей
 * 5. Добавление недостающих товаров
 * 
 * Запуск: npx tsx scripts/fix-calculator-issues.ts
 */

import { db } from '../src/lib/db';
import { products, calculatorCategories, calculatorInputs, calculatorFormulas } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// ============ ИСПРАВЛЕНИЯ ДАННЫХ ============

// 1. Грунтовки - добавляем объём канистры
const GRUNTOVKA_FIXES: Record<string, { bagWeight: number }> = {
  'gruntovka-ceresit-ct17': { bagWeight: 10 },          // 10л канистра
  'gruntovka-optimist-glubokogo-proniknoveniya': { bagWeight: 10 },
  'gruntovka-vetonit-glubokogo-proniknoveniya': { bagWeight: 10 },
  'gruntovka-knauf-tifengrund': { bagWeight: 10 },
  'gruntovka-lakra-interernaya': { bagWeight: 10 },
  'betonokontakt-ceresit-ct19-15kg': { bagWeight: 15 }, // 15кг ведро
  'betonokontakt-habez-12kg': { bagWeight: 12 },        // 12кг ведро
};

// 2. Краски - добавляем вес ведра и цену за 14кг
const PAINT_FIXES: Record<string, { bagWeight: number; price: number }> = {
  'kraska-arco-iris-dlya-sten-i-potolkov': { bagWeight: 14, price: 1300 },  // 14кг
  'kraska-arco-iris-moyuschayasya': { bagWeight: 14, price: 1500 },
  'kraska-arco-iris-fasadnaya': { bagWeight: 14, price: 1600 },
  'kraska-lakra-dlya-sten-i-potolkov': { bagWeight: 14, price: 1300 },
  'kraska-lakra-moyuschayasya': { bagWeight: 14, price: 2500 },
  'kraska-lakra-fasadnaya': { bagWeight: 14, price: 2550 },
};

// 3. ГКЛ - устанавливаем bagWeight = 1 (1 лист) и цену за лист 12.5мм
const GKL_FIXES: Record<string, { bagWeight: number; price: number }> = {
  'gipsokarton': { bagWeight: 1, price: 310 },                    // 2500x1200, 12.5мм
  'gipsokarton-knauf': { bagWeight: 1, price: 500 },              // 3000x1200, 12.5мм
  'gipsokarton-vlagostoykiy': { bagWeight: 1, price: 380 },       // 2500x1200, 12.5мм
  'gipsokarton-vlagostoykiy-vetonit': { bagWeight: 1, price: 300 }, // 2000x1200, 12.5мм
};

// 4. Литокс Бриз и Кнауф Севенер - перенос в новую категорию "Штукатурно-клеевая смесь"
const ADHESIVE_PLASTER_PRODUCTS: Record<string, {
  calculatorCategorySlug: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight: number;
}> = {
  'litoks-briz': { 
    calculatorCategorySlug: 'adhesive_plaster', 
    consumption: 5.5, 
    consumptionUnit: 'кг/м²',
    bagWeight: 25 
  },
  'knauf-sevener': { 
    calculatorCategorySlug: 'adhesive_plaster', 
    consumption: 4.5, 
    consumptionUnit: 'кг/м²',
    bagWeight: 25 
  },
};

// 5. Дополнительные товары для калькулятора
const ADDITIONAL_PRODUCTS: Record<string, {
  calculatorCategorySlug: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight?: number;
}> = {
  // ============ ГРУНТОВКИ ДОПОЛНИТЕЛЬНЫЕ ============
  'gruntovka-arco-iris-glubokogo-proniknoveniya': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²', bagWeight: 10 },
  'gruntovka-optimist': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²', bagWeight: 10 },
  'grunt-kontsentrat-lakra-profit': { calculatorCategorySlug: 'gruntovka', consumption: 0.08, consumptionUnit: 'л/м²', bagWeight: 5 }, // концентрат
  'grunt-kontsentrat-arco-iris-1-10': { calculatorCategorySlug: 'gruntovka', consumption: 0.08, consumptionUnit: 'л/м²', bagWeight: 5 },
  'grunt-kontsentrat-knauf-mittelgrund': { calculatorCategorySlug: 'gruntovka', consumption: 0.08, consumptionUnit: 'л/м²', bagWeight: 10 },
  'gruntovka-pod-dekorativnye-shtukaturki-ceresit-ct16': { calculatorCategorySlug: 'gruntovka', consumption: 0.3, consumptionUnit: 'кг/м²', bagWeight: 10 },

  // ============ ЗАТИРКА ДЛЯ ШВОВ ============
  'zatirka-ceresit-ce33': { calculatorCategorySlug: 'grout', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 2 },
  'zatirka-ceresit-ce40': { calculatorCategorySlug: 'grout', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 2 },
  'zatirka-litokol': { calculatorCategorySlug: 'grout', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 2 },
  
  // ============ ИЗОЛЯЦИОННЫЕ ПЛЁНКИ ============
  'membrana-b-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'membrana-d-gidro-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'membrana-a-vetro-vlagozaschita': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'tisma-b-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 60, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'tisma-a-vetro-vlagozaschita': { calculatorCategorySlug: 'membrane', consumption: 60, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'fiberon-b-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 60, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'fiberon-d-gidro-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 60, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'fiberon-a-vetro-vlagozaschita': { calculatorCategorySlug: 'membrane', consumption: 60, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'izospan-b-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'izospan-d-gidro-paroizolyatsiya': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'izospan-am-vetro-vlagozaschita': { calculatorCategorySlug: 'membrane', consumption: 70, consumptionUnit: 'м²/рулон', bagWeight: 1 },
  'izospan-fb-gidro-paroizolyatsiya-otrazhayuschaya': { calculatorCategorySlug: 'membrane', consumption: 35, consumptionUnit: 'м²/рулон', bagWeight: 1 },

  // ============ ЭМАЛИ ============
  'emal-alkidnaya-pf-115': { calculatorCategorySlug: 'paint', consumption: 0.12, consumptionUnit: 'л/м²', bagWeight: 1.8 },
  'grunt-emal-3v1': { calculatorCategorySlug: 'paint', consumption: 0.12, consumptionUnit: 'л/м²', bagWeight: 1.8 },
  'emal-dlya-radiatorov-akrilovaya': { calculatorCategorySlug: 'paint', consumption: 0.1, consumptionUnit: 'л/м²', bagWeight: 0.9 },
  'emal-dlya-dverey-i-podokonnikov-akrilovaya': { calculatorCategorySlug: 'paint', consumption: 0.1, consumptionUnit: 'л/м²', bagWeight: 0.9 },
  
  // ============ ПЕСКОБЕТОН ============
  'peskobeton-m300': { calculatorCategorySlug: 'floor', consumption: 2.0, consumptionUnit: 'кг/м²/мм', bagWeight: 40 },
};

// ============ НОВЫЕ КАТЕГОРИИ ============

const NEW_CATEGORIES = [
  {
    slug: 'adhesive_plaster',
    name: 'Штукатурно-клеевая смесь',
    description: 'Расчёт штукатурно-клеевой смеси для фасадных работ и утепления',
    icon: '🧱',
    sortOrder: 11,
    inputs: [
      { key: 'area', label: 'Площадь', unit: 'м²', defaultValue: 20, minValue: 1, maxValue: 500, step: 1, sortOrder: 1 },
      { key: 'layers', label: 'Количество слоёв', unit: 'шт', defaultValue: 2, minValue: 1, maxValue: 3, step: 1, sortOrder: 2, tooltip: 'Базовый + армирующий слой = 2' },
    ],
    formula: {
      formulaType: 'area',
      formulaParams: { areaKey: 'area', layersKey: 'layers' },
      resultUnit: 'кг',
      resultUnitTemplate: null,
      recommendationsTemplate: { tips: ['Используйте армирующую сетку между слоями', 'Наносите слой толщиной 3-5мм'], warnings: [] },
    },
  },
  {
    slug: 'grout',
    name: 'Затирка',
    description: 'Расчёт затирки для швов плитки',
    icon: '🔳',
    sortOrder: 12,
    inputs: [
      { key: 'area', label: 'Площадь плитки', unit: 'м²', defaultValue: 20, minValue: 1, maxValue: 500, step: 1, sortOrder: 1 },
    ],
    formula: {
      formulaType: 'area',
      formulaParams: { areaKey: 'area' },
      resultUnit: 'кг',
      resultUnitTemplate: null,
      recommendationsTemplate: { tips: ['Расход зависит от размера плитки и ширины шва', 'Работайте небольшими участками'], warnings: [] },
    },
  },
  {
    slug: 'membrane',
    name: 'Изоляционные плёнки',
    description: 'Расчёт пароизоляции и гидроизоляции',
    icon: '🧻',
    sortOrder: 13,
    inputs: [
      { key: 'area', label: 'Площадь', unit: 'м²', defaultValue: 50, minValue: 1, maxValue: 1000, step: 1, sortOrder: 1 },
      { key: 'overlap', label: 'Нахлёст', unit: '%', defaultValue: 15, minValue: 10, maxValue: 20, step: 5, sortOrder: 2, tooltip: 'Стандартный нахлёст 10-15см' },
    ],
    formula: {
      formulaType: 'sheets',
      formulaParams: { areaKey: 'area', wastePercent: 15 },
      resultUnit: 'м²',
      resultUnitTemplate: 'рулонов',
      recommendationsTemplate: { tips: ['Укладывайте с нахлёстом 10-15см', 'Используйте скотч для герметизации стыков'], warnings: [] },
    },
  },
];

async function fixCalculatorIssues() {
  console.log('🔧 Исправление проблем калькулятора...\n');

  // ============ 1. ИСПРАВИТЬ ГРУНТОВКУ ============
  console.log('📦 Исправление грунтовки (добавление bagWeight)...');
  for (const [urlId, data] of Object.entries(GRUNTOVKA_FIXES)) {
    try {
      await db.update(products)
        .set({ bagWeight: data.bagWeight })
        .where(eq(products.urlId, urlId));
      console.log(`  ✓ ${urlId} → bagWeight: ${data.bagWeight}`);
    } catch (error) {
      console.error(`  ❌ Ошибка для ${urlId}:`, error);
    }
  }

  // ============ 2. ИСПРАВИТЬ КРАСКУ ============
  console.log('\n🖌️ Исправление краски (добавление bagWeight и price)...');
  for (const [urlId, data] of Object.entries(PAINT_FIXES)) {
    try {
      await db.update(products)
        .set({ 
          bagWeight: data.bagWeight,
          price: data.price.toString()
        })
        .where(eq(products.urlId, urlId));
      console.log(`  ✓ ${urlId} → bagWeight: ${data.bagWeight}, price: ${data.price}`);
    } catch (error) {
      console.error(`  ❌ Ошибка для ${urlId}:`, error);
    }
  }

  // ============ 3. ИСПРАВИТЬ ГКЛ ============
  console.log('\n📋 Исправление ГКЛ (добавление bagWeight и price)...');
  for (const [urlId, data] of Object.entries(GKL_FIXES)) {
    try {
      await db.update(products)
        .set({ 
          bagWeight: data.bagWeight,
          price: data.price.toString()
        })
        .where(eq(products.urlId, urlId));
      console.log(`  ✓ ${urlId} → bagWeight: ${data.bagWeight}, price: ${data.price}`);
    } catch (error) {
      console.error(`  ❌ Ошибка для ${urlId}:`, error);
    }
  }

  // ============ 4. СОЗДАТЬ НОВЫЕ КАТЕГОРИИ ============
  console.log('\n🆕 Создание новых категорий калькулятора...');
  for (const category of NEW_CATEGORIES) {
    try {
      // Проверяем существует ли категория
      const [existingCat] = await db
        .select()
        .from(calculatorCategories)
        .where(eq(calculatorCategories.slug, category.slug));
      
      let categoryId: number;
      
      if (existingCat) {
        console.log(`  ⚠ Категория ${category.slug} уже существует (id: ${existingCat.id})`);
        categoryId = existingCat.id;
      } else {
        const [newCat] = await db.insert(calculatorCategories)
          .values({
            slug: category.slug,
            name: category.name,
            description: category.description,
            icon: category.icon,
            sortOrder: category.sortOrder,
          })
          .returning({ id: calculatorCategories.id });
        categoryId = newCat.id;
        console.log(`  ✓ Создана категория: ${category.name} (id: ${categoryId})`);

        // Добавляем поля ввода
        for (const input of category.inputs) {
          await db.insert(calculatorInputs).values({
            categoryId,
            ...input,
          });
        }
        console.log(`    - Добавлено ${category.inputs.length} полей ввода`);

        // Добавляем формулу
        await db.insert(calculatorFormulas).values({
          categoryId,
          ...category.formula,
        });
        console.log(`    - Добавлена формула расчёта`);
      }
    } catch (error) {
      console.error(`  ❌ Ошибка при создании ${category.slug}:`, error);
    }
  }

  // Переносим товары в категорию "Штукатурно-клеевая смесь"
  console.log('\n🔄 Перенос товаров в категорию "Штукатурно-клеевая смесь"...');
  for (const [urlId, data] of Object.entries(ADHESIVE_PLASTER_PRODUCTS)) {
    try {
      await db.update(products)
        .set({
          calculatorCategorySlug: data.calculatorCategorySlug,
          consumption: data.consumption,
          consumptionUnit: data.consumptionUnit,
          bagWeight: data.bagWeight,
        })
        .where(eq(products.urlId, urlId));
      console.log(`  ✓ ${urlId} → ${data.calculatorCategorySlug}`);
    } catch (error) {
      console.error(`  ❌ Ошибка для ${urlId}:`, error);
    }
  }

  // ============ 5. ДОБАВИТЬ ДОПОЛНИТЕЛЬНЫЕ ТОВАРЫ ============
  console.log('\n➕ Добавление дополнительных товаров...');
  for (const [urlId, data] of Object.entries(ADDITIONAL_PRODUCTS)) {
    try {
      const [product] = await db.select({ id: products.id }).from(products).where(eq(products.urlId, urlId));
      
      if (product) {
        await db.update(products)
          .set({
            calculatorCategorySlug: data.calculatorCategorySlug,
            consumption: data.consumption,
            consumptionUnit: data.consumptionUnit,
            bagWeight: data.bagWeight || null,
          })
          .where(eq(products.urlId, urlId));
        console.log(`  ✓ ${urlId} → ${data.calculatorCategorySlug}`);
      } else {
        console.log(`  ⚠ Товар не найден: ${urlId}`);
      }
    } catch (error) {
      console.error(`  ❌ Ошибка для ${urlId}:`, error);
    }
  }

  console.log('\n✅ Исправление завершено!');
  process.exit(0);
}

fixCalculatorIssues().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
