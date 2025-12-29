import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { validateSession, isAdmin, isSuperAdmin } from '@/lib/auth';
import { eq, desc, asc, like, or, sql } from 'drizzle-orm';

// Получить список пользователей
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
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Базовый запрос
    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      emailVerified: users.emailVerified,
      phone: users.phone,
      phoneVerified: users.phoneVerified,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      avatar: users.avatar,
      telegramId: users.telegramId,
      telegramUsername: users.telegramUsername,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users);
    
    // Фильтрация по поиску
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.telegramUsername, `%${search}%`)
        )
      );
    }
    
    // Фильтрация по роли
    if (role && ['SUPERADMIN', 'ADMIN', 'MODER', 'USER'].includes(role)) {
      conditions.push(eq(users.role, role as 'SUPERADMIN' | 'ADMIN' | 'MODER' | 'USER'));
    }
    
    // Если не SUPERADMIN, не показываем SUPERADMIN'ов
    if (!isSuperAdmin(currentUser)) {
      conditions.push(sql`${users.role} != 'SUPERADMIN'`);
    }
    
    if (conditions.length > 0) {
      // @ts-expect-error - Drizzle types issue
      query = query.where(sql`${conditions.map(c => sql`(${c})`).join(' AND ')}`);
    }
    
    // Сортировка
    const orderFn = sortOrder === 'asc' ? asc : desc;
    const sortColumn = {
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    }[sortBy] || users.createdAt;
    
    // @ts-expect-error - Drizzle types issue  
    query = query.orderBy(orderFn(sortColumn)).limit(limit).offset(offset);
    
    const usersList = await query;
    
    // Подсчет общего количества
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const total = countResult[0].count;
    
    return NextResponse.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
