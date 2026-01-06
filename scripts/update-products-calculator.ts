/**
 * Скрипт для добавления данных калькулятора к существующим товарам
 * Запуск: npx tsx scripts/update-products-calculator.ts
 */

import { db } from '../src/lib/db';
import { products } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Маппинг товаров на категории калькулятора с данными о расходе
const PRODUCT_CALCULATOR_DATA: Record<string, {
  calculatorCategorySlug: string;
  consumption: number;
  consumptionUnit: string;
  bagWeight?: number;
}> = {
  // ============ ШТУКАТУРКА (plaster) ============
  'volma-sloy': { calculatorCategorySlug: 'plaster', consumption: 8, consumptionUnit: 'кг/м²/см', bagWeight: 30 },
  'volma-start': { calculatorCategorySlug: 'plaster', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 25 },
  'volma-gips-aktiv': { calculatorCategorySlug: 'plaster', consumption: 8.5, consumptionUnit: 'кг/м²/см', bagWeight: 30 },
  'volma-gips-aktiv-ekstra': { calculatorCategorySlug: 'plaster', consumption: 8.5, consumptionUnit: 'кг/м²/см', bagWeight: 30 },
  'knauf-mp-75': { calculatorCategorySlug: 'plaster', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 30 },
  'litoks-start': { calculatorCategorySlug: 'plaster', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 25 },
  'litoks-aquaplast': { calculatorCategorySlug: 'plaster', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25 },
  'volma-akvaplast': { calculatorCategorySlug: 'plaster', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25 },
  'litoks-cemplast': { calculatorCategorySlug: 'plaster', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25 },
  'power-fasad': { calculatorCategorySlug: 'plaster', consumption: 15, consumptionUnit: 'кг/м²/см', bagWeight: 25 },

  // ============ ШПАКЛЁВКА (putty) ============
  'volma-shov': { calculatorCategorySlug: 'putty', consumption: 0.8, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'volma-finish': { calculatorCategorySlug: 'putty', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 20 },
  'litoks-satenlux': { calculatorCategorySlug: 'putty', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'volma-akvastandart': { calculatorCategorySlug: 'putty', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'volma-akvastandart-svetlyy': { calculatorCategorySlug: 'putty', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'shpatlevka-polimernaya-vetonit-lr': { calculatorCategorySlug: 'putty', consumption: 1.2, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'shpatlevka-polimernaya-starateli-kr': { calculatorCategorySlug: 'putty', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 20 },
  'shpatlevka-finishnaya-knauf-rotband-pasta': { calculatorCategorySlug: 'putty', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 18 },
  'shpatlevka-finishnaya-vetonit-lr-pasta': { calculatorCategorySlug: 'putty', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 18 },

  // ============ НАЛИВНОЙ ПОЛ (floor) ============
  'volma-nivelir-20kg': { calculatorCategorySlug: 'floor', consumption: 1.4, consumptionUnit: 'кг/м²/мм', bagWeight: 20 },
  'volma-nivelir-ekspress-25kg': { calculatorCategorySlug: 'floor', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25 },
  'litoks-kompozit': { calculatorCategorySlug: 'floor', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25 },
  'litoks-floorex': { calculatorCategorySlug: 'floor', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25 },
  'nalivnoy-pol-starateli': { calculatorCategorySlug: 'floor', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25 },
  'power-nivelir': { calculatorCategorySlug: 'floor', consumption: 1.5, consumptionUnit: 'кг/м²/мм', bagWeight: 25 },

  // ============ ПЛИТОЧНЫЙ КЛЕЙ (tile_adhesive) ============
  'volma-keramik': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'volma-multikley': { calculatorCategorySlug: 'tile_adhesive', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'ceresit-sm-11': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'ceresit-sm-14': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'ceresit-sm-16': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'ceresit-sm-17': { calculatorCategorySlug: 'tile_adhesive', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'mega-standart': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'mega-keramogranit': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'habez-standart': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'power-ceramic': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'litoks-briz': { calculatorCategorySlug: 'tile_adhesive', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25 },
  'knauf-sevener': { calculatorCategorySlug: 'tile_adhesive', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25 },

  // ============ КРАСКА (paint) ============
  'kraska-arco-iris-dlya-sten-i-potolkov': { calculatorCategorySlug: 'paint', consumption: 0.15, consumptionUnit: 'л/м²' },
  'kraska-arco-iris-moyuschayasya': { calculatorCategorySlug: 'paint', consumption: 0.12, consumptionUnit: 'л/м²' },
  'kraska-arco-iris-fasadnaya': { calculatorCategorySlug: 'paint', consumption: 0.15, consumptionUnit: 'л/м²' },
  'kraska-lakra-dlya-sten-i-potolkov': { calculatorCategorySlug: 'paint', consumption: 0.15, consumptionUnit: 'л/м²' },
  'kraska-lakra-moyuschayasya': { calculatorCategorySlug: 'paint', consumption: 0.12, consumptionUnit: 'л/м²' },
  'kraska-lakra-fasadnaya': { calculatorCategorySlug: 'paint', consumption: 0.15, consumptionUnit: 'л/м²' },

  // ============ ГИПСОКАРТОН (drywall) ============
  'gipsokarton': { calculatorCategorySlug: 'drywall', consumption: 3.0, consumptionUnit: 'м²/лист' },
  'gipsokarton-knauf': { calculatorCategorySlug: 'drywall', consumption: 3.6, consumptionUnit: 'м²/лист' },
  'gipsokarton-vlagostoykiy': { calculatorCategorySlug: 'drywall', consumption: 3.0, consumptionUnit: 'м²/лист' },
  'gipsokarton-vlagostoykiy-vetonit': { calculatorCategorySlug: 'drywall', consumption: 2.4, consumptionUnit: 'м²/лист' },

  // ============ УТЕПЛИТЕЛЬ (insulation) ============
  'penopleks-50': { calculatorCategorySlug: 'insulation', consumption: 4.85, consumptionUnit: 'м²/уп' },
  'penopleks-30': { calculatorCategorySlug: 'insulation', consumption: 9, consumptionUnit: 'м²/уп' },
  'penopleks-20': { calculatorCategorySlug: 'insulation', consumption: 13.9, consumptionUnit: 'м²/уп' },
  'tehnopleks-50': { calculatorCategorySlug: 'insulation', consumption: 5.5, consumptionUnit: 'м²/уп' },
  'tehnopleks-30': { calculatorCategorySlug: 'insulation', consumption: 9, consumptionUnit: 'м²/уп' },
  'tehnopleks-20': { calculatorCategorySlug: 'insulation', consumption: 13.9, consumptionUnit: 'м²/уп' },
  'profipleks-50': { calculatorCategorySlug: 'insulation', consumption: 5.5, consumptionUnit: 'м²/уп' },
  'profipleks-30': { calculatorCategorySlug: 'insulation', consumption: 9, consumptionUnit: 'м²/уп' },
  'tehnonikol-roklayt': { calculatorCategorySlug: 'insulation', consumption: 5.76, consumptionUnit: 'м²/уп' },
  'isover-strong': { calculatorCategorySlug: 'insulation', consumption: 6.1, consumptionUnit: 'м²/уп' },
  'isover-teplyy-dom-100mm': { calculatorCategorySlug: 'insulation', consumption: 5, consumptionUnit: 'м²/уп' },
  'isover-teplyy-dom-50mm': { calculatorCategorySlug: 'insulation', consumption: 10, consumptionUnit: 'м²/уп' },

  // ============ КЛЕЙ ДЛЯ БЛОКОВ (masonry) ============
  'volma-blok': { calculatorCategorySlug: 'masonry', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25 },
  'litoks-kontakt': { calculatorCategorySlug: 'masonry', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25 },
  'mega-blok-montazh': { calculatorCategorySlug: 'masonry', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25 },
  'profmix-profi-blok': { calculatorCategorySlug: 'masonry', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25 },
  'volma-montazh': { calculatorCategorySlug: 'masonry', consumption: 2.0, consumptionUnit: 'кг/блок', bagWeight: 25 },

  // ============ ПРОФНАСТИЛ (profnastil) ============
  'mp-20-korichnevyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  'mp-20-krasnyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  'mp-20-siniy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  'mp-20-zelenyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  'mp-20-grafit': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  'mp-20-otsinkovannyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  's-8-belyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  's-8-slonovaya-kost': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  's-8-korichnevyy': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  's-8-morenyy-dub': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },
  's-8-kamen': { calculatorCategorySlug: 'profnastil', consumption: 1.15, consumptionUnit: 'м ширины' },

  // ============ ГРУНТОВКА (gruntovka) ============
  'gruntovka-ceresit-ct17': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²' },
  'gruntovka-optimist-glubokogo-proniknoveniya': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²' },
  'gruntovka-vetonit-glubokogo-proniknoveniya': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²' },
  'gruntovka-knauf-tifengrund': { calculatorCategorySlug: 'gruntovka', consumption: 0.07, consumptionUnit: 'л/м²' },
  'gruntovka-lakra-interernaya': { calculatorCategorySlug: 'gruntovka', consumption: 0.1, consumptionUnit: 'л/м²' },
  'betonokontakt-ceresit-ct19-15kg': { calculatorCategorySlug: 'gruntovka', consumption: 0.3, consumptionUnit: 'кг/м²' },
  'betonokontakt-habez-12kg': { calculatorCategorySlug: 'gruntovka', consumption: 0.3, consumptionUnit: 'кг/м²' },
};

async function updateProductsCalculator() {
  console.log('🚀 Обновление данных калькулятора в товарах...\n');

  let updated = 0;
  let notFound = 0;

  for (const [urlId, data] of Object.entries(PRODUCT_CALCULATOR_DATA)) {
    try {
      const result = await db
        .update(products)
        .set({
          calculatorCategorySlug: data.calculatorCategorySlug,
          consumption: data.consumption,
          consumptionUnit: data.consumptionUnit,
          bagWeight: data.bagWeight || null,
        })
        .where(eq(products.urlId, urlId));
      
      // Проверяем был ли обновлён товар
      const [product] = await db.select({ id: products.id }).from(products).where(eq(products.urlId, urlId));
      
      if (product) {
        console.log(`✓ ${urlId} → ${data.calculatorCategorySlug}`);
        updated++;
      } else {
        console.log(`⚠ Товар не найден: ${urlId}`);
        notFound++;
      }
    } catch (error) {
      console.error(`❌ Ошибка для ${urlId}:`, error);
    }
  }

  console.log(`\n✅ Обновлено товаров: ${updated}`);
  console.log(`⚠ Не найдено: ${notFound}`);
  
  process.exit(0);
}

updateProductsCalculator().catch((error) => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
