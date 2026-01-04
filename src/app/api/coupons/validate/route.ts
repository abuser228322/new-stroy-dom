import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons, couponUsages } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Код купона не указан', valid: false },
        { status: 400 }
      );
    }

    // Ищем купон
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase()),
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Купон не найден', valid: false },
        { status: 404 }
      );
    }

    // Проверяем активность
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Купон недействителен', valid: false },
        { status: 400 }
      );
    }

    // Проверяем даты
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { error: 'Купон ещё не активен', valid: false },
        { status: 400 }
      );
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { error: 'Срок действия купона истёк', valid: false },
        { status: 400 }
      );
    }

    // Проверяем лимит использований
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Купон исчерпан', valid: false },
        { status: 400 }
      );
    }

    // Проверяем минимальную сумму заказа
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        { 
          error: `Минимальная сумма заказа: ${coupon.minOrderAmount} ₽`, 
          valid: false 
        },
        { status: 400 }
      );
    }

    // Проверяем лимит использования на пользователя
    if (coupon.usagePerUser) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('session')?.value;
      
      if (sessionToken) {
        const session = await validateSession(sessionToken);
        
        if (session) {
          // Считаем использования этим пользователем
          const userUsages = await db
            .select({ count: sql<number>`count(*)` })
            .from(couponUsages)
            .where(
              and(
                eq(couponUsages.couponId, coupon.id),
                eq(couponUsages.userId, session.id)
              )
            );

          const usageCount = userUsages[0]?.count || 0;

          if (usageCount >= coupon.usagePerUser) {
            return NextResponse.json(
              { error: 'Вы уже использовали этот купон', valid: false },
              { status: 400 }
            );
          }
        }
      }
    }

    // Купон действителен
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки купона', valid: false },
      { status: 500 }
    );
  }
}
