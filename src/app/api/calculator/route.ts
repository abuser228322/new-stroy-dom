import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, subcategories, calculatorCategories, calculatorInputs, calculatorFormulas } from '@/lib/db/schema';
import { eq, asc, isNotNull, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Получаем категории калькулятора
    const calcCategories = await db
      .select()
      .from(calculatorCategories)
      .where(eq(calculatorCategories.isActive, true))
      .orderBy(asc(calculatorCategories.sortOrder));

    // Для каждой категории получаем товары из products с заполненным consumption
    const result = await Promise.all(
      calcCategories.map(async (category) => {
        // Получаем товары из основной таблицы products по calculatorCategorySlug
        const categoryProducts = await db
          .select({
            id: products.id,
            urlId: products.urlId,
            title: products.title,
            description: products.description,
            image: products.image,
            price: products.price,
            pricesBySize: products.pricesBySize,
            sizeText: products.sizeText,
            unit: products.unit,
            brand: products.brand,
            inStock: products.inStock,
            consumption: products.consumption,
            consumptionUnit: products.consumptionUnit,
            bagWeight: products.bagWeight,
            categoryId: products.categoryId,
            subcategoryId: products.subcategoryId,
            categorySlug: categories.slug,
            categoryName: categories.name,
            subcategorySlug: subcategories.slug,
            subcategoryName: subcategories.name,
          })
          .from(products)
          .innerJoin(categories, eq(products.categoryId, categories.id))
          .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
          .where(
            and(
              eq(products.calculatorCategorySlug, category.slug),
              isNotNull(products.consumption),
              eq(products.isActive, true)
            )
          )
          .orderBy(asc(products.sortOrder));

        // Поля ввода для категории
        const inputs = await db
          .select()
          .from(calculatorInputs)
          .where(eq(calculatorInputs.categoryId, category.id))
          .orderBy(asc(calculatorInputs.sortOrder));

        // Формула расчёта
        const [formula] = await db
          .select()
          .from(calculatorFormulas)
          .where(eq(calculatorFormulas.categoryId, category.id));

        return {
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description,
          icon: category.icon,
          isActive: category.isActive,
          products: categoryProducts.map(p => ({
            // Идентификация
            id: p.id.toString(),
            productId: p.id, // Реальный ID товара в БД
            urlId: p.urlId,
            
            // Данные для калькулятора
            name: p.title,
            consumption: p.consumption || 0,
            consumptionUnit: p.consumptionUnit || '',
            bagWeight: p.bagWeight,
            price: p.price ? parseFloat(p.price) : undefined,
            pricesBySize: (p.pricesBySize as Record<string, number> | null) ?? null,
            sizeText: p.sizeText || null,
            unit: p.unit || 'шт',
            tooltip: p.description || null,
            
            // Данные для корректной ссылки в корзину
            categorySlug: p.categorySlug,
            subcategorySlug: p.subcategorySlug,
            categoryName: p.categoryName,
            subcategoryName: p.subcategoryName,
            
            // Дополнительно
            image: p.image,
            brand: p.brand,
            inStock: p.inStock,
          })),
          inputs: inputs.map(i => ({
            key: i.key,
            label: i.label,
            unit: i.unit,
            defaultValue: i.defaultValue,
            min: i.minValue,
            max: i.maxValue,
            step: i.step,
            tooltip: i.tooltip,
          })),
          formula: formula ? {
            formulaType: formula.formulaType,
            formulaParams: formula.formulaParams,
            resultUnit: formula.resultUnit,
            resultUnitTemplate: formula.resultUnitTemplate,
            recommendationsTemplate: formula.recommendationsTemplate,
          } : null,
        };
      })
    );

    // Фильтруем категории у которых есть товары
    const categoriesWithProducts = result.filter(cat => cat.products.length > 0);

    return NextResponse.json(categoriesWithProducts);
  } catch (error) {
    console.error('Error fetching calculator data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculator data' },
      { status: 500 }
    );
  }
}
