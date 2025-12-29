import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { validateSession, isAdmin } from '@/lib/auth';
import { eq, and, ne } from 'drizzle-orm';

// Получить купон
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const currentUser = await validateSession(token);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    const { id } = await params;
    const couponId = parseInt(id, 10);
    
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, couponId),
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Купон не найден' }, { status: 404 });
    }
    
    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Coupon GET error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Обновить купон
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const currentUser = await validateSession(token);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    const { id } = await params;
    const couponId = parseInt(id, 10);
    const body = await request.json();
    
    // Проверка существования
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, couponId),
    });
    
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Купон не найден' }, { status: 404 });
    }
    
    // Если меняется код, проверяем уникальность
    if (body.code && body.code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await db.query.coupons.findFirst({
        where: and(
          eq(coupons.code, body.code.toUpperCase()),
          ne(coupons.id, couponId)
        ),
      });
      
      if (duplicateCoupon) {
        return NextResponse.json({ error: 'Купон с таким кодом уже существует' }, { status: 400 });
      }
    }
    
    // Валидация скидки
    if (body.discountValue !== undefined && body.discountValue <= 0) {
      return NextResponse.json({ error: 'Значение скидки должно быть больше 0' }, { status: 400 });
    }
    
    const discountType = body.discountType || existingCoupon.discountType;
    if (discountType === 'percentage' && body.discountValue > 100) {
      return NextResponse.json({ error: 'Скидка не может превышать 100%' }, { status: 400 });
    }
    
    // Формируем данные для обновления
    const updateData: Record<string, unknown> = {};
    
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue;
    if (body.minOrderAmount !== undefined) updateData.minOrderAmount = body.minOrderAmount;
    if (body.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = body.maxDiscountAmount;
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit;
    if (body.usagePerUser !== undefined) updateData.usagePerUser = body.usagePerUser;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    updateData.updatedAt = new Date();
    
    const [updated] = await db.update(coupons)
      .set(updateData)
      .where(eq(coupons.id, couponId))
      .returning();
    
    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error('Coupon PUT error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Удалить купон
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const currentUser = await validateSession(token);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    const { id } = await params;
    const couponId = parseInt(id, 10);
    
    await db.delete(coupons).where(eq(coupons.id, couponId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
