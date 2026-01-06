/**
 * Скрипт для исправления max_value в calculator_inputs
 * Запуск: npx tsx scripts/fix-calculator-inputs.ts
 */

import { db } from '../src/lib/db';
import { calculatorInputs, calculatorCategories } from '../src/lib/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

async function fixCalculatorInputs() {
  console.log('🔧 Исправление max_value в calculator_inputs...\n');

  // Обновляем max_value для полей площади
  const areaInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 500 })
    .where(
      and(
        eq(calculatorInputs.key, 'area'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${areaInputs.length} полей 'area' (max=500)`);

  // Обновляем max_value для толщины (мм)
  const thicknessInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 50 })
    .where(
      and(
        eq(calculatorInputs.key, 'thickness'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${thicknessInputs.length} полей 'thickness' (max=50)`);

  // Обновляем max_value для слоёв
  const layersInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 5 })
    .where(
      and(
        eq(calculatorInputs.key, 'layers'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${layersInputs.length} полей 'layers' (max=5)`);

  // Обновляем max_value для нахлёста/запаса (%)
  const overlapInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 30, minValue: 5, defaultValue: 15 })
    .where(
      and(
        eq(calculatorInputs.key, 'overlap'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${overlapInputs.length} полей 'overlap' (min=5, max=30, default=15)`);

  // Обновляем max_value для полей blocks
  const blocksInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 5000 })
    .where(
      and(
        eq(calculatorInputs.key, 'blocks'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${blocksInputs.length} полей 'blocks' (max=5000)`);

  // Обновляем max_value для профнастила - длина
  const lengthInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 100 })
    .where(
      and(
        eq(calculatorInputs.key, 'length'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${lengthInputs.length} полей 'length' (max=100)`);

  // Обновляем max_value для профнастила - ширина
  const widthInputs = await db
    .update(calculatorInputs)
    .set({ maxValue: 200 })
    .where(
      and(
        eq(calculatorInputs.key, 'width'),
        or(isNull(calculatorInputs.maxValue), eq(calculatorInputs.maxValue, 0))
      )
    )
    .returning();
  
  console.log(`✓ Обновлено ${widthInputs.length} полей 'width' (max=200)`);

  // Показываем текущее состояние всех inputs
  const allInputs = await db.select().from(calculatorInputs);
  console.log('\n📊 Текущее состояние calculator_inputs:');
  allInputs.forEach(input => {
    console.log(`  [${input.categoryId}] ${input.key}: min=${input.minValue}, max=${input.maxValue}, default=${input.defaultValue}, step=${input.step}`);
  });

  console.log('\n✅ Исправление завершено!');
  process.exit(0);
}

fixCalculatorInputs().catch((error) => {
  console.error('❌ Ошибка:', error);
  process.exit(1);
});
