import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorCategories, calculatorProducts, calculatorInputs, calculatorFormulas } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    // Получаем все категории калькулятора с продуктами, полями и формулами
    const categories = await db
      .select()
      .from(calculatorCategories)
      .where(eq(calculatorCategories.isActive, true))
      .orderBy(asc(calculatorCategories.sortOrder));

    // Для каждой категории получаем связанные данные
    const result = await Promise.all(
      categories.map(async (category) => {
        // Продукты категории
        const products = await db
          .select()
          .from(calculatorProducts)
          .where(eq(calculatorProducts.categoryId, category.id))
          .orderBy(asc(calculatorProducts.sortOrder));

        // Поля ввода
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
          ...category,
          products: products.map(p => ({
            id: p.id.toString(),
            catalogProductId: p.productId, // ID товара в каталоге для связи
            name: p.name,
            consumption: p.consumption,
            consumptionUnit: p.consumptionUnit,
            bagWeight: p.bagWeight,
            price: p.price ? parseFloat(p.price) : undefined,
            tooltip: p.tooltip,
            productUrlId: p.productUrlId,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching calculator data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculator data' },
      { status: 500 }
    );
  }
}
