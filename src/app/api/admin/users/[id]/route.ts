import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { validateSession, isAdmin, isSuperAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Получить пользователя
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
    const userId = parseInt(id, 10);
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        passwordHash: false,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    
    // Если не SUPERADMIN, не показываем SUPERADMIN'ов
    if (!isSuperAdmin(currentUser) && user.role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Обновить пользователя
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
    const userId = parseInt(id, 10);
    const body = await request.json();
    
    // Получаем целевого пользователя
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    
    // Нельзя редактировать SUPERADMIN, если ты не SUPERADMIN
    if (!isSuperAdmin(currentUser) && targetUser.role === 'SUPERADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    
    // Нельзя менять свою роль
    if (currentUser.id === userId && body.role !== undefined && body.role !== currentUser.role) {
      return NextResponse.json({ error: 'Нельзя изменить свою роль' }, { status: 400 });
    }
    
    // Только SUPERADMIN может назначать роль ADMIN
    if (body.role === 'SUPERADMIN' && !isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'Только главный администратор может назначать эту роль' }, { status: 403 });
    }
    
    // Допустимые поля для обновления
    const updateData: Record<string, unknown> = {};
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) {
      updateData.email = body.email;
      updateData.emailVerified = false;
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone;
      updateData.phoneVerified = false;
    }
    if (body.role !== undefined && ['SUPERADMIN', 'ADMIN', 'MODER', 'USER'].includes(body.role)) {
      updateData.role = body.role;
    }
    if (body.isActive !== undefined) {
      // Нельзя деактивировать себя
      if (currentUser.id === userId && !body.isActive) {
        return NextResponse.json({ error: 'Нельзя деактивировать свой аккаунт' }, { status: 400 });
      }
      updateData.isActive = body.isActive;
    }
    
    updateData.updatedAt = new Date();
    
    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    // Убираем passwordHash из ответа
    const { passwordHash, ...safeUser } = updated;
    
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// Удалить пользователя
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
    
    if (!currentUser || !isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: 'Только главный администратор может удалять пользователей' }, { status: 403 });
    }
    
    const { id } = await params;
    const userId = parseInt(id, 10);
    
    // Нельзя удалить себя
    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Нельзя удалить свой аккаунт' }, { status: 400 });
    }
    
    await db.delete(users).where(eq(users.id, userId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
