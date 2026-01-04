import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorProducts, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Получить все продукты категории
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const productsList = await db
      .select({
        id: calculatorProducts.id,
        categoryId: calculatorProducts.categoryId,
        productId: calculatorProducts.productId,
        name: calculatorProducts.name,
        consumption: calculatorProducts.consumption,
        consumptionUnit: calculatorProducts.consumptionUnit,
        bagWeight: calculatorProducts.bagWeight,
        price: calculatorProducts.price,
        tooltip: calculatorProducts.tooltip,
        productUrlId: calculatorProducts.productUrlId,
        sortOrder: calculatorProducts.sortOrder,
        createdAt: calculatorProducts.createdAt,
        // Данные связанного продукта из каталога
        linkedProductName: products.title,
        linkedProductPrice: products.price,
      })
      .from(calculatorProducts)
      .leftJoin(products, eq(calculatorProducts.productId, products.id))
      .where(eq(calculatorProducts.categoryId, parseInt(id)))
      .orderBy(calculatorProducts.sortOrder);

    return NextResponse.json(productsList);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Создать продукт
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Получаем максимальный sortOrder
    const [maxSort] = await db
      .select({ maxOrder: calculatorProducts.sortOrder })
      .from(calculatorProducts)
      .where(eq(calculatorProducts.categoryId, parseInt(id)))
      .orderBy(desc(calculatorProducts.sortOrder))
      .limit(1);

    const nextSortOrder = (maxSort?.maxOrder || 0) + 1;

    const [newProduct] = await db
      .insert(calculatorProducts)
      .values({
        categoryId: parseInt(id),
        productId: body.productId || null,
        name: body.name,
        consumption: body.consumption,
        consumptionUnit: body.consumptionUnit || 'кг/м²',
        bagWeight: body.bagWeight || null,
        price: body.price,
        tooltip: body.tooltip || null,
        productUrlId: body.productUrlId || null,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
