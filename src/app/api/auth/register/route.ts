import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, phone, firstName, lastName } = body;
    
    // Валидация
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }
    
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Логин должен содержать минимум 3 символа' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }
    
    // Регистрация
    const result = await registerUser({
      username,
      password,
      email,
      phone,
      firstName,
      lastName,
    });
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Ошибка регистрации' },
        { status: 400 }
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
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
