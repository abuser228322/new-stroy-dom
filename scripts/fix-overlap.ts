/**
 * Скрипт для исправления overlap (нахлёст) для изоляционных плёнок
 */

import { db } from '../src/lib/db';
import { calculatorInputs } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Исправляю overlap для изоляционных плёнок...');
  
  const result = await db
    .update(calculatorInputs)
    .set({ minValue: 5, maxValue: 30, defaultValue: 15 })
    .where(eq(calculatorInputs.key, 'overlap'))
    .returning();
  
  console.log('Обновлено строк:', result.length);
  result.forEach(r => {
    console.log(`  - category_id=${r.categoryId}: min=${r.minValue}, max=${r.maxValue}, default=${r.defaultValue}`);
  });
  
  process.exit(0);
}

main().catch(e => {
  console.error('Ошибка:', e);
  process.exit(1);
});
