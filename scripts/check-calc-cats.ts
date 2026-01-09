import { db } from '../src/lib/db';
import { calculatorCategories, calculatorProducts } from '../src/lib/db/schema';
import { asc, eq, sql } from 'drizzle-orm';

async function main() {
  const cats = await db.select().from(calculatorCategories).orderBy(asc(calculatorCategories.sortOrder));
  console.log('\nКатегории калькулятора:');
  console.log('ID | Slug | Name | Products');
  console.log('-'.repeat(60));
  
  for (const cat of cats) {
    const [count] = await db.select({ count: sql<number>`count(*)` }).from(calculatorProducts).where(eq(calculatorProducts.categoryId, cat.id));
    console.log(`${cat.id} | ${cat.slug} | ${cat.name} | ${count?.count || 0}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
