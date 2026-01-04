import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatorProducts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Получить продукт
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    
    const [product] = await db
      .select()
      .from(calculatorProducts)
      .where(eq(calculatorProducts.id, parseInt(productId)));

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Обновить продукт
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(calculatorProducts)
      .set({
        productId: body.productId || null,
        name: body.name,
        consumption: body.consumption,
        consumptionUnit: body.consumptionUnit,
        bagWeight: body.bagWeight || null,
        price: body.price,
        tooltip: body.tooltip || null,
        productUrlId: body.productUrlId || null,
        updatedAt: new Date(),
      })
      .where(eq(calculatorProducts.id, parseInt(productId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить продукт
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    
    await db
      .delete(calculatorProducts)
      .where(eq(calculatorProducts.id, parseInt(productId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
