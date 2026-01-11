import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Админ-панель | Строй Дом",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Проверяем авторизацию
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login?redirect=/admin&error=auth_required");
  }

  const user = await validateSession(token);

  if (!user) {
    redirect("/login?redirect=/admin&error=session_expired");
  }

  if (!isAdmin(user)) {
    redirect("/?error=access_denied");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-orange-600">
                  Строй Дом - Админ
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Главная
                </Link>
                <Link
                  href="/admin/products"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Товары
                </Link>
                <Link
                  href="/admin/categories"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Категории
                </Link>
                <Link
                  href="/admin/slides"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Слайды
                </Link>
                <Link
                  href="/admin/promotions"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Акции
                </Link>
                <Link
                  href="/admin/blog"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Блог
                </Link>
                <Link
                  href="/admin/orders"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Заказы
                </Link>
                <Link
                  href="/admin/calculator"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Калькулятор
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline">👤</span>
                <span className="font-medium">{user.username}</span>
                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                  {user.role}
                </span>
              </div>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← На сайт
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
