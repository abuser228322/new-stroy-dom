import { NextRequest, NextResponse } from 'next/server';
import { loginUser, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Валидация
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }
    
    // Авторизация
    const result = await loginUser(username, password);
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Ошибка авторизации' },
        { status: 401 }
      );
    }
    
    // Создаем сессию
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               undefined;
    
    const token = await createSession(result.user.id, userAgent, ip);
    
    // Создаем ответ с cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        phone: result.user.phone,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        avatar: result.user.avatar,
        telegramUsername: result.user.telegramUsername,
      },
    });
    
    // Устанавливаем cookie с токеном
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 дней
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
