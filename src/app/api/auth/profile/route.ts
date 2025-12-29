import { NextRequest, NextResponse } from 'next/server';
import { validateSession, updateUserProfile, changePassword, setPassword } from '@/lib/auth';

// Получить профиль
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Сессия истекла' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        createdAt: user.createdAt,
        hasPassword: !!user.passwordHash,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновить профиль
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Сессия истекла' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { email, phone, firstName, lastName } = body;
    
    const result = await updateUserProfile(user.id, {
      email,
      phone,
      firstName,
      lastName,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка обновления' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        emailVerified: result.user!.emailVerified,
        phone: result.user!.phone,
        phoneVerified: result.user!.phoneVerified,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        role: result.user!.role,
        avatar: result.user!.avatar,
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Сменить пароль
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Сессия истекла' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, oldPassword, newPassword, password } = body;
    
    if (action === 'set-password') {
      // Установка пароля для Telegram пользователей
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'Пароль должен содержать минимум 6 символов' },
          { status: 400 }
        );
      }
      
      const result = await setPassword(user.id, password);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Ошибка установки пароля' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    // Смена пароля
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Укажите текущий и новый пароль' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Новый пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }
    
    const result = await changePassword(user.id, oldPassword, newPassword);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка смены пароля' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
