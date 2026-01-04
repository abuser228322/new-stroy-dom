/**
 * Скрипт для заполнения таблиц калькулятора начальными данными
 * Запуск: npx tsx scripts/seed-calculator.ts
 */

import { db } from '../src/lib/db';
import { 
  calculatorCategories, 
  calculatorProducts, 
  calculatorInputs, 
  calculatorFormulas 
} from '../src/lib/db/schema';

// Данные из MATERIALS_CONFIG
const CALCULATOR_DATA = [
  {
    slug: 'plaster',
    name: 'Штукатурка',
    icon: '🏗️',
    inputs: [
      { key: 'area', label: 'Площадь стен', unit: 'м²', defaultValue: 10, minValue: 1, step: 0.5 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 10, minValue: 1, maxValue: 50, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', thicknessKey: 'thickness' }, resultUnit: 'кг' },
    products: [
      { name: 'Штукатурка гипсовая Кнауф Ротбанд 30кг', consumption: 8.5, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 540, productUrlId: 'knauf-rotband-30kg' },
      { name: 'Штукатурка цементная Волма Аквапласт 25кг', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 280, productUrlId: 'volma-aquaplast-25kg' },
      { name: 'Штукатурка цементная Knauf Unterputz 25кг', consumption: 17, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 340, productUrlId: 'knauf-unterputz-25kg' },
      { name: 'Штукатурка гипсовая Волма Слой 30кг', consumption: 8, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 380, productUrlId: 'volma-sloy-30kg' },
      { name: 'Штукатурка гипсовая Старатели 30кг', consumption: 9, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 320, productUrlId: 'starateli-gips-30kg' },
    ],
  },
  {
    slug: 'putty',
    name: 'Шпаклевка',
    icon: '🖌️',
    inputs: [
      { key: 'area', label: 'Площадь поверхности', unit: 'м²', defaultValue: 10, minValue: 1, step: 0.5 },
      { key: 'layers', label: 'Количество слоев', unit: '', defaultValue: 2, minValue: 1, maxValue: 5, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', layersKey: 'layers' }, resultUnit: 'кг' },
    products: [
      { name: 'Шпаклевка финишная Ветонит LR+ 25кг', consumption: 1.2, consumptionUnit: 'кг/м²', bagWeight: 25, price: 850, productUrlId: 'vetonit-lr-plus-25kg' },
      { name: 'Шпаклевка финишная Knauf HP Finish 25кг', consumption: 0.9, consumptionUnit: 'кг/м²', bagWeight: 25, price: 620, productUrlId: 'knauf-hp-finish-25kg' },
      { name: 'Шпаклевка универсальная Волма Стандарт 25кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 450, productUrlId: 'volma-standart-25kg' },
      { name: 'Шпаклевка гипсовая Knauf Фуген 25кг', consumption: 0.8, consumptionUnit: 'кг/м²', bagWeight: 25, price: 520, productUrlId: 'knauf-fugen-25kg' },
    ],
  },
  {
    slug: 'floor',
    name: 'Наливной пол',
    icon: '🏠',
    inputs: [
      { key: 'area', label: 'Площадь пола', unit: 'м²', defaultValue: 15, minValue: 1, step: 0.5 },
      { key: 'thickness', label: 'Толщина слоя', unit: 'мм', defaultValue: 5, minValue: 1, maxValue: 100, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', thicknessKey: 'thickness' }, resultUnit: 'кг' },
    products: [
      { name: 'Наливной пол Старатели Тонкий 25кг', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 350, productUrlId: 'starateli-tonkiy-25kg' },
      { name: 'Наливной пол Волма Нивелир Экспресс 20кг', consumption: 1.4, consumptionUnit: 'кг/м²/мм', bagWeight: 20, price: 420, productUrlId: 'volma-nivelir-express-20kg' },
      { name: 'Наливной пол Knauf Трибон 30кг', consumption: 1.7, consumptionUnit: 'кг/м²/мм', bagWeight: 30, price: 580, productUrlId: 'knauf-tribon-30kg' },
      { name: 'Наливной пол Bergauf Easy Boden 25кг', consumption: 1.5, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 390, productUrlId: 'bergauf-easy-boden-25kg' },
    ],
  },
  {
    slug: 'tile_adhesive',
    name: 'Плиточный клей',
    icon: '🔲',
    inputs: [
      { key: 'area', label: 'Площадь облицовки', unit: 'м²', defaultValue: 10, minValue: 1, step: 0.5 },
    ],
    formula: { type: 'area', params: { areaKey: 'area' }, resultUnit: 'кг' },
    products: [
      { name: 'Клей для плитки Knauf Флизен 25кг', consumption: 2.2, consumptionUnit: 'кг/м²', bagWeight: 25, price: 350, productUrlId: 'knauf-flizen-25kg' },
      { name: 'Клей для плитки Ceresit CM 11 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 420, productUrlId: 'ceresit-cm11-25kg' },
      { name: 'Клей для плитки Волма Керамик 25кг', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 280, productUrlId: 'volma-keramik-25kg' },
      { name: 'Клей для керамогранита Ceresit CM 14 25кг', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 520, productUrlId: 'ceresit-cm14-25kg' },
      { name: 'Клей усиленный Knauf Флекс 25кг', consumption: 2.8, consumptionUnit: 'кг/м²', bagWeight: 25, price: 580, productUrlId: 'knauf-flex-25kg' },
    ],
  },
  {
    slug: 'paint',
    name: 'Краска',
    icon: '🎨',
    inputs: [
      { key: 'area', label: 'Площадь окрашивания', unit: 'м²', defaultValue: 20, minValue: 1, step: 1 },
      { key: 'layers', label: 'Количество слоев', unit: '', defaultValue: 2, minValue: 1, maxValue: 4, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', layersKey: 'layers' }, resultUnit: 'л' },
    products: [
      { name: 'Краска Dulux Bindo 7 матовая 10л', consumption: 0.12, consumptionUnit: 'л/м²', bagWeight: 10, price: 4200, productUrlId: 'dulux-bindo-7-10l' },
      { name: 'Краска Marshall Maestro 9л', consumption: 0.1, consumptionUnit: 'л/м²', bagWeight: 9, price: 2100, productUrlId: 'marshall-maestro-9l' },
      { name: 'Краска Tikkurila Euro Power 7 9л', consumption: 0.11, consumptionUnit: 'л/м²', bagWeight: 9, price: 3800, productUrlId: 'tikkurila-euro-power-7-9l' },
      { name: 'Краска Alpina Надежная интерьерная 10л', consumption: 0.14, consumptionUnit: 'л/м²', bagWeight: 10, price: 2900, productUrlId: 'alpina-nadezhnaya-10l' },
    ],
  },
  {
    slug: 'drywall',
    name: 'Гипсокартон',
    icon: '📐',
    inputs: [
      { key: 'area', label: 'Площадь покрытия', unit: 'м²', defaultValue: 20, minValue: 1, step: 1 },
    ],
    formula: { type: 'sheets', params: { areaKey: 'area', wastePercent: 10 }, resultUnit: 'листов' },
    products: [
      { name: 'ГКЛ Волма 2500х1200х12.5мм', consumption: 3.0, consumptionUnit: 'м²/лист', price: 380, productUrlId: 'gkl-volma-12-5mm' },
      { name: 'ГКЛ Knauf 2500х1200х12.5мм', consumption: 3.0, consumptionUnit: 'м²/лист', price: 450, productUrlId: 'gkl-knauf-12-5mm' },
      { name: 'ГКЛВ Волма влагостойкий 2500х1200х12.5мм', consumption: 3.0, consumptionUnit: 'м²/лист', price: 480, productUrlId: 'gklv-volma-12-5mm' },
      { name: 'ГКЛВ Knauf влагостойкий 2500х1200х12.5мм', consumption: 3.0, consumptionUnit: 'м²/лист', price: 550, productUrlId: 'gklv-knauf-12-5mm' },
      { name: 'ГКЛ Волма 2500х1200х9.5мм', consumption: 3.0, consumptionUnit: 'м²/лист', price: 320, productUrlId: 'gkl-volma-9-5mm' },
    ],
  },
  {
    slug: 'insulation',
    name: 'Утеплитель',
    icon: '🧱',
    inputs: [
      { key: 'area', label: 'Площадь утепления', unit: 'м²', defaultValue: 20, minValue: 1, step: 1 },
      { key: 'thickness', label: 'Толщина', unit: 'мм', defaultValue: 50, minValue: 30, maxValue: 200, step: 10 },
    ],
    formula: { type: 'volume', params: { volumeKey: 'volume' }, resultUnit: 'м³' },
    products: [
      { name: 'Утеплитель Rockwool Лайт Баттс 50мм', consumption: 1.0, consumptionUnit: 'м²', price: 180, productUrlId: 'rockwool-light-batts-50mm', tooltip: '50 мм, 5.76 м² в упаковке' },
      { name: 'Утеплитель Технониколь Роклайт 50мм', consumption: 1.0, consumptionUnit: 'м²', price: 150, productUrlId: 'tekhnonikol-roklayt-50mm', tooltip: '50 мм, 5.76 м² в упаковке' },
      { name: 'Пенополистирол ПСБ-С 25 50мм', consumption: 1.0, consumptionUnit: 'м²', price: 120, productUrlId: 'psb-s-25-50mm', tooltip: '50 мм, 1 м² в листе' },
      { name: 'Утеплитель URSA GEO М-11 50мм', consumption: 1.0, consumptionUnit: 'м²', price: 170, productUrlId: 'ursa-geo-m11-50mm', tooltip: '50 мм, 10 м² в упаковке' },
    ],
  },
  {
    slug: 'masonry',
    name: 'Кладочная смесь',
    icon: '🧱',
    inputs: [
      { key: 'area', label: 'Площадь кладки', unit: 'м²', defaultValue: 10, minValue: 1, step: 0.5 },
    ],
    formula: { type: 'area', params: { areaKey: 'area' }, resultUnit: 'кг' },
    products: [
      { name: 'Смесь кладочная Волма 25кг', consumption: 25, consumptionUnit: 'кг/м²', bagWeight: 25, price: 250, productUrlId: 'volma-kladochnaya-25kg' },
      { name: 'Смесь кладочная Основит Брикформ 25кг', consumption: 20, consumptionUnit: 'кг/м²', bagWeight: 25, price: 320, productUrlId: 'osnovit-brickform-25kg' },
      { name: 'Клей для газоблоков Волма Блок 25кг', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25, price: 280, productUrlId: 'volma-blok-25kg', tooltip: 'Для блоков 600x300x200' },
      { name: 'Клей для газоблоков Ceresit CT 21 25кг', consumption: 1.6, consumptionUnit: 'кг/блок', bagWeight: 25, price: 420, productUrlId: 'ceresit-ct21-25kg' },
    ],
  },
  {
    slug: 'profnastil',
    name: 'Профнастил',
    icon: '🏭',
    inputs: [
      { key: 'length', label: 'Длина', unit: 'м', defaultValue: 6, minValue: 0.5, step: 0.5 },
      { key: 'width', label: 'Ширина (кол-во листов)', unit: 'шт', defaultValue: 5, minValue: 1, step: 1 },
    ],
    formula: { type: 'pieces', params: { lengthKey: 'length', quantityKey: 'width' }, resultUnit: 'листов', resultUnitTemplate: 'листов (рабочая ширина 1.15м)' },
    products: [
      { name: 'Профнастил МП-20 (RAL 8017, коричневый)', consumption: 1.15, consumptionUnit: 'м/лист', price: 450, productUrlId: 'profnastil-mp20-ral8017', tooltip: 'Рабочая ширина 1.15м' },
      { name: 'Профнастил МП-20 (RAL 6005, зеленый)', consumption: 1.15, consumptionUnit: 'м/лист', price: 450, productUrlId: 'profnastil-mp20-ral6005', tooltip: 'Рабочая ширина 1.15м' },
      { name: 'Профнастил МП-20 (оцинкованный)', consumption: 1.15, consumptionUnit: 'м/лист', price: 380, productUrlId: 'profnastil-mp20-otsink', tooltip: 'Рабочая ширина 1.15м' },
      { name: 'Профнастил С-8 (RAL 8017, коричневый)', consumption: 1.15, consumptionUnit: 'м/лист', price: 380, productUrlId: 'profnastil-s8-ral8017', tooltip: 'Рабочая ширина 1.15м' },
      { name: 'Профнастил С-8 (оцинкованный)', consumption: 1.15, consumptionUnit: 'м/лист', price: 320, productUrlId: 'profnastil-s8-otsink', tooltip: 'Рабочая ширина 1.15м' },
    ],
  },
];

async function seedCalculator() {
  console.log('🚀 Начинаем заполнение данных калькулятора...\n');

  for (let i = 0; i < CALCULATOR_DATA.length; i++) {
    const cat = CALCULATOR_DATA[i];
    console.log(`📁 Категория: ${cat.icon} ${cat.name}`);

    // Создаем категорию
    const [category] = await db
      .insert(calculatorCategories)
      .values({
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        sortOrder: i + 1,
        isActive: true,
      })
      .returning();

    console.log(`   ✓ Категория создана (ID: ${category.id})`);

    // Создаем inputs
    for (let j = 0; j < cat.inputs.length; j++) {
      const input = cat.inputs[j];
      await db.insert(calculatorInputs).values({
        categoryId: category.id,
        key: input.key,
        label: input.label,
        unit: input.unit,
        defaultValue: input.defaultValue,
        minValue: input.minValue,
        maxValue: input.maxValue || null,
        step: input.step,
        sortOrder: j + 1,
      });
    }
    console.log(`   ✓ Параметры ввода: ${cat.inputs.length} шт.`);

    // Создаем формулу
    await db.insert(calculatorFormulas).values({
      categoryId: category.id,
      formulaType: cat.formula.type,
      formulaParams: cat.formula.params,
      resultUnit: cat.formula.resultUnit,
      resultUnitTemplate: cat.formula.resultUnitTemplate || null,
    });
    console.log(`   ✓ Формула: ${cat.formula.type}`);

    // Создаем продукты
    for (let j = 0; j < cat.products.length; j++) {
      const product = cat.products[j];
      await db.insert(calculatorProducts).values({
        categoryId: category.id,
        name: product.name,
        consumption: product.consumption,
        consumptionUnit: product.consumptionUnit,
        bagWeight: product.bagWeight || null,
        price: product.price,
        tooltip: product.tooltip || null,
        productUrlId: product.productUrlId,
        sortOrder: j + 1,
      });
    }
    console.log(`   ✓ Продукты: ${cat.products.length} шт.\n`);
  }

  console.log('✅ Данные калькулятора успешно загружены!');
  process.exit(0);
}

seedCalculator().catch((error) => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
