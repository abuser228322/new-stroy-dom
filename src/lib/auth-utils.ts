import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateSession, isAdmin, isModerator, type User } from "./auth";

// Тип результата проверки авторизации
export type AuthResult = 
  | { success: true; user: User }
  | { success: false; error: string; status: number };

/**
 * Проверяет авторизацию администратора для API роутов
 * Использовать в начале каждого API хендлера админки
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return { 
      success: false, 
      error: "Требуется авторизация", 
      status: 401 
    };
  }

  const user = await validateSession(token);

  if (!user) {
    return { 
      success: false, 
      error: "Сессия истекла или недействительна", 
      status: 401 
    };
  }

  if (!isAdmin(user)) {
    return { 
      success: false, 
      error: "Недостаточно прав. Требуется роль администратора", 
      status: 403 
    };
  }

  return { success: true, user };
}

/**
 * Проверяет авторизацию модератора для API роутов
 */
export async function requireModerator(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return { 
      success: false, 
      error: "Требуется авторизация", 
      status: 401 
    };
  }

  const user = await validateSession(token);

  if (!user) {
    return { 
      success: false, 
      error: "Сессия истекла или недействительна", 
      status: 401 
    };
  }

  if (!isModerator(user)) {
    return { 
      success: false, 
      error: "Недостаточно прав. Требуется роль модератора или выше", 
      status: 403 
    };
  }

  return { success: true, user };
}

/**
 * Проверяет авторизацию обычного пользователя
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return { 
      success: false, 
      error: "Требуется авторизация", 
      status: 401 
    };
  }

  const user = await validateSession(token);

  if (!user) {
    return { 
      success: false, 
      error: "Сессия истекла или недействительна", 
      status: 401 
    };
  }

  return { success: true, user };
}

/**
 * Создаёт ответ с ошибкой авторизации
 */
export function authErrorResponse(result: { error: string; status: number }): NextResponse {
  return NextResponse.json(
    { error: result.error },
    { status: result.status }
  );
}

/**
 * Получает текущего пользователя из cookies (для Server Components)
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return validateSession(token);
}

/**
 * Получает текущего админа или null (для Server Components)
 */
export async function getCurrentAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  
  if (!user || !isAdmin(user)) {
    return null;
  }

  return user;
}

// Реэкспорт типа User для удобства
export type { User };
