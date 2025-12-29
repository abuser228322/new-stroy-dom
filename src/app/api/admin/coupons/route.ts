import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { validateSession, isAdmin } from '@/lib/auth';
import { eq, desc, like, or, sql } from 'drizzle-orm';

// Получить список купонов
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const currentUser = await validateSession(token);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    
    const offset = (page - 1) * limit;
    
    // Базовый запрос с создателем
    let query = db.select({
      id: coupons.id,
      code: coupons.code,
      description: coupons.description,
      discountType: coupons.discountType,
      discountValue: coupons.discountValue,
      minOrderAmount: coupons.minOrderAmount,
      maxDiscountAmount: coupons.maxDiscountAmount,
      usageLimit: coupons.usageLimit,
      usageCount: coupons.usageCount,
      usagePerUser: coupons.usagePerUser,
      startDate: coupons.startDate,
      endDate: coupons.endDate,
      isActive: coupons.isActive,
      createdById: coupons.createdById,
      createdAt: coupons.createdAt,
    }).from(coupons);
    
    // Фильтрация по поиску
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(coupons.code, `%${search}%`),
          like(coupons.description, `%${search}%`)
        )
      );
    }
    
    if (isActive === 'true') {
      conditions.push(eq(coupons.isActive, true));
    } else if (isActive === 'false') {
      conditions.push(eq(coupons.isActive, false));
    }
    
    if (conditions.length > 0) {
      // @ts-expect-error - Drizzle types issue
      query = query.where(sql`${conditions.map(c => sql`(${c})`).join(' AND ')}`);
    }
    
    // @ts-expect-error - Drizzle types issue
    query = query.orderBy(desc(coupons.createdAt)).limit(limit).offset(offset);
    
    const couponsList = await query;
    
    // Подсчет общего количества
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(coupons);
    const total = countResult[0].count;
    
    return NextResponse.json({
      coupons: couponsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Создать купон
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const currentUser = await validateSession(token);
    
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Валидация
    if (!body.code || body.code.length < 3) {
      return NextResponse.json({ error: 'Код купона должен содержать минимум 3 символа' }, { status: 400 });
    }
    
    if (!body.discountType || !['percentage', 'fixed'].includes(body.discountType)) {
      return NextResponse.json({ error: 'Укажите тип скидки' }, { status: 400 });
    }
    
    if (!body.discountValue || body.discountValue <= 0) {
      return NextResponse.json({ error: 'Укажите значение скидки' }, { status: 400 });
    }
    
    if (body.discountType === 'percentage' && body.discountValue > 100) {
      return NextResponse.json({ error: 'Скидка не может превышать 100%' }, { status: 400 });
    }
    
    // Проверка уникальности кода
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, body.code.toUpperCase()),
    });
    
    if (existingCoupon) {
      return NextResponse.json({ error: 'Купон с таким кодом уже существует' }, { status: 400 });
    }
    
    const [coupon] = await db.insert(coupons).values({
      code: body.code.toUpperCase(),
      description: body.description || null,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderAmount: body.minOrderAmount || null,
      maxDiscountAmount: body.maxDiscountAmount || null,
      usageLimit: body.usageLimit || null,
      usagePerUser: body.usagePerUser || 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive !== false,
      createdById: currentUser.id,
    }).returning();
    
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Coupon POST error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
