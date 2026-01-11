import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Защищённые пути, требующие авторизации админа
const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, относится ли путь к админке
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!isAdminPath) {
    return NextResponse.next();
  }

  // Получаем токен из cookies
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Для API возвращаем JSON ошибку
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }
    // Для страниц редиректим на логин
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    url.searchParams.set("error", "auth_required");
    return NextResponse.redirect(url);
  }

  // Валидация сессии и проверка роли происходит в layout.tsx и API handlers
  // Middleware не может делать запросы к БД напрямую в Edge Runtime
  // Поэтому здесь только базовая проверка наличия токена

  return NextResponse.next();
}

// Конфигурация middleware - на каких путях он работает
export const config = {
  matcher: [
    // Защищаем все пути админки
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
