import { NextRequest, NextResponse } from 'next/server';
import { loginWithTelegram, createSession } from '@/lib/auth';
import crypto from 'crypto';

// Telegram Bot Token - должен быть в .env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Проверка подписи от Telegram
function verifyTelegramAuth(data: Record<string, string>): boolean {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return false;
  }
  
  const { hash, ...authData } = data;
  
  // Создаем строку для проверки
  const checkString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');
  
  // Создаем секретный ключ
  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  
  // Вычисляем HMAC
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');
  
  return hmac === hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Проверяем подпись от Telegram
    const authData: Record<string, string> = {};
    for (const key of ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash']) {
      if (body[key] !== undefined) {
        authData[key] = String(body[key]);
      }
    }
    
    // Проверяем время авторизации (не старше 1 часа)
    const authDate = parseInt(authData.auth_date || '0', 10);
    if (Date.now() / 1000 - authDate > 3600) {
      return NextResponse.json(
        { error: 'Данные авторизации устарели' },
        { status: 400 }
      );
    }
    
    // В продакшене проверяем подпись
    if (process.env.NODE_ENV === 'production') {
      if (!verifyTelegramAuth(authData)) {
        return NextResponse.json(
          { error: 'Недействительная подпись' },
          { status: 400 }
        );
      }
    }
    
    // Авторизуем через Telegram
    const result = await loginWithTelegram({
      id: authData.id,
      username: authData.username,
      first_name: authData.first_name,
      last_name: authData.last_name,
      photo_url: authData.photo_url,
    });
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Ошибка авторизации' },
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
      isNew: result.isNew,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        phone: result.user.phone,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        avatar: result.user.avatar,
        telegramId: result.user.telegramId,
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
    console.error('Telegram auth API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
