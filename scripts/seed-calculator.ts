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

// Данные из реальных товаров магазина
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
      { name: 'Волма Слой 30кг', consumption: 8, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 430, productUrlId: 'volma-sloy', productId: 12 },
      { name: 'Волма Старт 25кг', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 300, productUrlId: 'volma-start', productId: 13 },
      { name: 'Волма Гипс-актив 30кг', consumption: 8.5, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 350, productUrlId: 'volma-gips-aktiv', productId: 14 },
      { name: 'Волма Гипс-актив Экстра 30кг', consumption: 8.5, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 350, productUrlId: 'volma-gips-aktiv-ekstra', productId: 15 },
      { name: 'Knauf MP 75 30кг', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 30, price: 380, productUrlId: 'knauf-mp-75', productId: 16 },
      { name: 'Литокс Start 25кг', consumption: 10, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 300, productUrlId: 'litoks-start', productId: 17 },
      { name: 'Литокс AquaPlast 25кг', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 500, productUrlId: 'litoks-aquaplast', productId: 18 },
      { name: 'Волма Аквапласт 25кг', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 400, productUrlId: 'volma-akvaplast', productId: 19 },
      { name: 'Литокс CemPlast 25кг', consumption: 16, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 370, productUrlId: 'litoks-cemplast', productId: 20 },
      { name: 'Power Fasad 25кг', consumption: 15, consumptionUnit: 'кг/м²/см', bagWeight: 25, price: 300, productUrlId: 'power-fasad', productId: 21 },
    ],
  },
  {
    slug: 'putty',
    name: 'Шпаклёвка',
    icon: '🖌️',
    inputs: [
      { key: 'area', label: 'Площадь поверхности', unit: 'м²', defaultValue: 10, minValue: 1, step: 0.5 },
      { key: 'layers', label: 'Количество слоев', unit: '', defaultValue: 2, minValue: 1, maxValue: 5, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', layersKey: 'layers' }, resultUnit: 'кг' },
    products: [
      { name: 'Волма Шов 25кг', consumption: 0.8, consumptionUnit: 'кг/м²', bagWeight: 25, price: 430, productUrlId: 'volma-shov', productId: 22 },
      { name: 'Волма Финиш 20кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 20, price: 420, productUrlId: 'volma-finish', productId: 23 },
      { name: 'Литокс SatenLux 25кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 500, productUrlId: 'litoks-satenlux', productId: 24 },
      { name: 'Волма Аквастандарт 25кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 400, productUrlId: 'volma-akvastandart', productId: 25 },
      { name: 'Волма Аквастандарт Светлый 25кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 570, productUrlId: 'volma-akvastandart-svetlyy', productId: 26 },
      { name: 'Vetonit LR+ 25кг', consumption: 1.2, consumptionUnit: 'кг/м²', bagWeight: 25, price: 1050, productUrlId: 'shpatlevka-polimernaya-vetonit-lr', productId: 27 },
      { name: 'Старатели КР 20кг', consumption: 1.0, consumptionUnit: 'кг/м²', bagWeight: 20, price: 650, productUrlId: 'shpatlevka-polimernaya-starateli-kr', productId: 28 },
      { name: 'Knauf Ротбанд паста 18кг', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 18, price: 2000, productUrlId: 'shpatlevka-finishnaya-knauf-rotband-pasta', productId: 207, tooltip: 'Готовая к применению' },
      { name: 'Vetonit LR паста 18кг', consumption: 0.4, consumptionUnit: 'кг/м²', bagWeight: 18, price: 1700, productUrlId: 'shpatlevka-finishnaya-vetonit-lr-pasta', productId: 208, tooltip: 'Готовая к применению' },
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
      { name: 'Волма Нивелир 20кг', consumption: 1.4, consumptionUnit: 'кг/м²/мм', bagWeight: 20, price: 300, productUrlId: 'volma-nivelir-20kg', productId: 30 },
      { name: 'Волма Нивелир Экспресс 25кг', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 430, productUrlId: 'volma-nivelir-ekspress-25kg', productId: 31 },
      { name: 'Литокс Композит 25кг', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 500, productUrlId: 'litoks-kompozit', productId: 32 },
      { name: 'Литокс Floorex 25кг', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 500, productUrlId: 'litoks-floorex', productId: 33 },
      { name: 'Наливной пол Старатели 25кг', consumption: 1.6, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 350, productUrlId: 'nalivnoy-pol-starateli', productId: 34 },
      { name: 'Power Nivelir 25кг', consumption: 1.5, consumptionUnit: 'кг/м²/мм', bagWeight: 25, price: 380, productUrlId: 'power-nivelir', productId: 35 },
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
      { name: 'Волма Керамик+ 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 400, productUrlId: 'volma-keramik', productId: 37 },
      { name: 'Волма Мультиклей 25кг', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 500, productUrlId: 'volma-multikley', productId: 38 },
      { name: 'Ceresit СМ 11 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 530, productUrlId: 'ceresit-sm-11', productId: 39 },
      { name: 'Ceresit СМ 14 25кг', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 800, productUrlId: 'ceresit-sm-14', productId: 40, tooltip: 'Для керамогранита' },
      { name: 'Ceresit СМ 16 25кг', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 1350, productUrlId: 'ceresit-sm-16', productId: 41, tooltip: 'Эластичный' },
      { name: 'Ceresit СМ 17 25кг', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 2000, productUrlId: 'ceresit-sm-17', productId: 42, tooltip: 'Суперэластичный' },
      { name: 'Мега Стандарт 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 300, productUrlId: 'mega-standart', productId: 43 },
      { name: 'Мега Керамогранит 25кг', consumption: 3.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 370, productUrlId: 'mega-keramogranit', productId: 44 },
      { name: 'Хабез Стандарт 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 300, productUrlId: 'habez-standart', productId: 45 },
      { name: 'Power Ceramic 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 300, productUrlId: 'power-ceramic', productId: 46 },
      { name: 'Литокс Бриз 25кг', consumption: 2.5, consumptionUnit: 'кг/м²', bagWeight: 25, price: 500, productUrlId: 'litoks-briz', productId: 47 },
      { name: 'Knauf Севенер 25кг', consumption: 3.0, consumptionUnit: 'кг/м²', bagWeight: 25, price: 850, productUrlId: 'knauf-sevener', productId: 48, tooltip: 'Для систем теплоизоляции' },
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
      { name: 'Arco Iris для стен и потолков', consumption: 0.15, consumptionUnit: 'л/м²', productUrlId: 'kraska-arco-iris-dlya-sten-i-potolkov', productId: 193 },
      { name: 'Arco Iris моющаяся', consumption: 0.12, consumptionUnit: 'л/м²', productUrlId: 'kraska-arco-iris-moyuschayasya', productId: 194 },
      { name: 'Arco Iris фасадная', consumption: 0.15, consumptionUnit: 'л/м²', productUrlId: 'kraska-arco-iris-fasadnaya', productId: 195 },
      { name: 'Лакра для стен и потолков', consumption: 0.15, consumptionUnit: 'л/м²', productUrlId: 'kraska-lakra-dlya-sten-i-potolkov', productId: 196 },
      { name: 'Лакра моющаяся', consumption: 0.12, consumptionUnit: 'л/м²', productUrlId: 'kraska-lakra-moyuschayasya', productId: 197 },
      { name: 'Лакра фасадная', consumption: 0.15, consumptionUnit: 'л/м²', productUrlId: 'kraska-lakra-fasadnaya', productId: 198 },
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
      { name: 'ГКЛ 2500х1200мм', consumption: 3.0, consumptionUnit: 'м²/лист', productUrlId: 'gipsokarton', productId: 67, tooltip: '3 м² в листе' },
      { name: 'ГКЛ Knauf 12.5х3000х1200мм', consumption: 3.6, consumptionUnit: 'м²/лист', price: 500, productUrlId: 'gipsokarton-knauf', productId: 68, tooltip: '3.6 м² в листе' },
      { name: 'ГКЛВ влагостойкий 2500х1200мм', consumption: 3.0, consumptionUnit: 'м²/лист', productUrlId: 'gipsokarton-vlagostoykiy', productId: 69, tooltip: '3 м² в листе' },
      { name: 'ГКЛВ Vetonit влагостойкий 2000х1200мм', consumption: 2.4, consumptionUnit: 'м²/лист', productUrlId: 'gipsokarton-vlagostoykiy-vetonit', productId: 70, tooltip: '2.4 м² в листе' },
    ],
  },
  {
    slug: 'insulation',
    name: 'Утеплитель',
    icon: '🧊',
    inputs: [
      { key: 'area', label: 'Площадь утепления', unit: 'м²', defaultValue: 20, minValue: 1, step: 1 },
    ],
    formula: { type: 'sheets', params: { areaKey: 'area', wastePercent: 5 }, resultUnit: 'упаковок' },
    products: [
      { name: 'Пеноплэкс 50мм (уп/7шт 4.85м²)', consumption: 4.85, consumptionUnit: 'м²/уп', price: 320, productUrlId: 'penopleks-50', productId: 109 },
      { name: 'Пеноплэкс 30мм (уп/13шт 9м²)', consumption: 9, consumptionUnit: 'м²/уп', price: 220, productUrlId: 'penopleks-30', productId: 110 },
      { name: 'Пеноплэкс 20мм (уп/20шт 13.9м²)', consumption: 13.9, consumptionUnit: 'м²/уп', price: 160, productUrlId: 'penopleks-20', productId: 111 },
      { name: 'Техноплекс 50мм (уп/8шт 5.5м²)', consumption: 5.5, consumptionUnit: 'м²/уп', price: 310, productUrlId: 'tehnopleks-50', productId: 112 },
      { name: 'Техноплекс 30мм (уп/13шт 9м²)', consumption: 9, consumptionUnit: 'м²/уп', price: 210, productUrlId: 'tehnopleks-30', productId: 113 },
      { name: 'Техноплекс 20мм (уп/20шт 13.9м²)', consumption: 13.9, consumptionUnit: 'м²/уп', price: 150, productUrlId: 'tehnopleks-20', productId: 114 },
      { name: 'Профиплекс 50мм (уп/8шт 5.5м²)', consumption: 5.5, consumptionUnit: 'м²/уп', price: 310, productUrlId: 'profipleks-50', productId: 115 },
      { name: 'Профиплекс 30мм (уп/13шт 9м²)', consumption: 9, consumptionUnit: 'м²/уп', price: 210, productUrlId: 'profipleks-30', productId: 116 },
      { name: 'Технониколь Роклайт 50мм (уп/8шт 5.76м²)', consumption: 5.76, consumptionUnit: 'м²/уп', price: 1000, productUrlId: 'tehnonikol-roklayt', productId: 119 },
      { name: 'Isover СТРОНГ 50мм (уп/10шт 6.1м²)', consumption: 6.1, consumptionUnit: 'м²/уп', price: 1200, productUrlId: 'isover-strong', productId: 122 },
      { name: 'Isover Теплый дом 100мм (уп/7шт 5м²)', consumption: 5, consumptionUnit: 'м²/уп', price: 1500, productUrlId: 'isover-teplyy-dom-100mm', productId: 123 },
      { name: 'Isover Теплый дом 50мм (уп/14шт 10м²)', consumption: 10, consumptionUnit: 'м²/уп', price: 1500, productUrlId: 'isover-teplyy-dom-50mm', productId: 124 },
    ],
  },
  {
    slug: 'masonry',
    name: 'Кладочная смесь / Клей для блоков',
    icon: '🧱',
    inputs: [
      { key: 'blocks', label: 'Количество блоков', unit: 'шт', defaultValue: 100, minValue: 1, step: 10 },
    ],
    formula: { type: 'pieces', params: { quantityKey: 'blocks' }, resultUnit: 'кг' },
    products: [
      { name: 'Волма Блок 25кг', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25, price: 380, productUrlId: 'volma-blok', productId: 52, tooltip: 'Для блоков 600x300x200мм' },
      { name: 'Литокс Контакт 25кг', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25, price: 340, productUrlId: 'litoks-kontakt', productId: 53, tooltip: 'Для газоблоков' },
      { name: 'Мега Блок Монтаж 25кг', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25, price: 300, productUrlId: 'mega-blok-montazh', productId: 54 },
      { name: 'ProfMix Профи-Блок 25кг', consumption: 1.5, consumptionUnit: 'кг/блок', bagWeight: 25, price: 300, productUrlId: 'profmix-profi-blok', productId: 55 },
      { name: 'Волма Монтаж 25кг', consumption: 2.0, consumptionUnit: 'кг/блок', bagWeight: 25, price: 500, productUrlId: 'volma-montazh', productId: 50 },
    ],
  },
  {
    slug: 'profnastil',
    name: 'Профнастил',
    icon: '🏭',
    inputs: [
      { key: 'length', label: 'Длина покрытия', unit: 'м', defaultValue: 6, minValue: 0.5, step: 0.5 },
      { key: 'width', label: 'Ширина покрытия', unit: 'м', defaultValue: 5, minValue: 1, step: 0.5 },
    ],
    formula: { type: 'sheets', params: { areaKey: 'area', sheetWidth: 1.15, wastePercent: 10 }, resultUnit: 'листов', resultUnitTemplate: 'листов (рабочая ширина 1.15м)' },
    products: [
      { name: 'МП-20 Коричневый (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-korichnevyy', productId: 1, tooltip: 'Под заказ по длине' },
      { name: 'МП-20 Красный (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-krasnyy', productId: 2, tooltip: 'Под заказ по длине' },
      { name: 'МП-20 Синий (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-siniy', productId: 3, tooltip: 'Под заказ по длине' },
      { name: 'МП-20 Зелёный (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-zelenyy', productId: 4, tooltip: 'Под заказ по длине' },
      { name: 'МП-20 Графит (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-grafit', productId: 5, tooltip: 'Под заказ по длине' },
      { name: 'МП-20 Оцинкованный (1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', productUrlId: 'mp-20-otsinkovannyy', productId: 6, tooltip: 'Под заказ по длине' },
      { name: 'С-8 Белый (2000х1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', price: 1000, productUrlId: 's-8-belyy', productId: 7 },
      { name: 'С-8 Слоновая кость (2000х1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', price: 1000, productUrlId: 's-8-slonovaya-kost', productId: 8 },
      { name: 'С-8 Коричневый (2000х1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', price: 1000, productUrlId: 's-8-korichnevyy', productId: 9 },
      { name: 'С-8 Морёный дуб (2000х1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', price: 1800, productUrlId: 's-8-morenyy-dub', productId: 10, tooltip: 'Текстура дерева' },
      { name: 'С-8 Камень (2000х1150х0.35мм)', consumption: 1.15, consumptionUnit: 'м ширины', price: 1800, productUrlId: 's-8-kamen', productId: 11, tooltip: 'Текстура камня' },
    ],
  },
  {
    slug: 'gruntovka',
    name: 'Грунтовка',
    icon: '🎯',
    inputs: [
      { key: 'area', label: 'Площадь обработки', unit: 'м²', defaultValue: 20, minValue: 1, step: 1 },
      { key: 'layers', label: 'Количество слоев', unit: '', defaultValue: 1, minValue: 1, maxValue: 2, step: 1 },
    ],
    formula: { type: 'area', params: { areaKey: 'area', layersKey: 'layers' }, resultUnit: 'л' },
    products: [
      { name: 'Ceresit CT17 10л', consumption: 0.1, consumptionUnit: 'л/м²', price: 1200, productUrlId: 'gruntovka-ceresit-ct17', productId: 180 },
      { name: 'Оптимист глубокого проникновения 10л', consumption: 0.1, consumptionUnit: 'л/м²', price: 1100, productUrlId: 'gruntovka-optimist-glubokogo-proniknoveniya', productId: 182 },
      { name: 'Vetonit глубокого проникновения 10л', consumption: 0.1, consumptionUnit: 'л/м²', price: 1200, productUrlId: 'gruntovka-vetonit-glubokogo-proniknoveniya', productId: 183 },
      { name: 'Knauf Тифенгрунд 10л', consumption: 0.07, consumptionUnit: 'л/м²', price: 1350, productUrlId: 'gruntovka-knauf-tifengrund', productId: 184 },
      { name: 'Лакра интерьерная 10л', consumption: 0.1, consumptionUnit: 'л/м²', price: 750, productUrlId: 'gruntovka-lakra-interernaya', productId: 185 },
      { name: 'Бетоноконтакт Ceresit CT19 15кг', consumption: 0.3, consumptionUnit: 'кг/м²', price: 2100, productUrlId: 'betonokontakt-ceresit-ct19-15kg', productId: 190 },
      { name: 'Бетоноконтакт Хабез 12кг', consumption: 0.3, consumptionUnit: 'кг/м²', price: 1000, productUrlId: 'betonokontakt-habez-12kg', productId: 191 },
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
      const input = cat.inputs[j] as any;
      await db.insert(calculatorInputs).values({
        categoryId: category.id,
        key: input.key,
        label: input.label,
        unit: input.unit,
        defaultValue: input.defaultValue,
        minValue: input.minValue,
        maxValue: input.maxValue ?? null,
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
      const product = cat.products[j] as any;
      await db.insert(calculatorProducts).values({
        categoryId: category.id,
        productId: product.productId || null, // Связь с товаром из каталога
        name: product.name,
        consumption: product.consumption,
        consumptionUnit: product.consumptionUnit,
        bagWeight: product.bagWeight || null,
        price: product.price || 0,
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
