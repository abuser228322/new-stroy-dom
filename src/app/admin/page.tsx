import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Карточка товаров */}
        <Link href="/admin/products" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Товары
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      Управление товарами
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-orange-600 font-medium">
                Добавить / Редактировать →
              </div>
            </div>
          </div>
        </Link>

        {/* Карточка категорий */}
        <Link href="/admin/categories" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Категории
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      Управление категориями
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-blue-600 font-medium">
                Добавить / Редактировать →
              </div>
            </div>
          </div>
        </Link>

        {/* Карточка пользователей */}
        <Link href="/admin/users" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Пользователи
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      Управление пользователями
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-purple-600 font-medium">
                Роли и доступы →
              </div>
            </div>
          </div>
        </Link>

        {/* Карточка купонов */}
        <Link href="/admin/coupons" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Купоны
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      Система скидок
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-green-600 font-medium">
                Создать / Управлять →
              </div>
            </div>
          </div>
        </Link>

        {/* Информационная карточка */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Статус БД
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    Настройка
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm text-gray-500">
              Настройте DATABASE_URL
            </div>
          </div>
        </div>
      </div>

      {/* Инструкция */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Инструкция по настройке</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Создайте PostgreSQL базу данных (например, на <a href="https://neon.tech" target="_blank" rel="noopener" className="text-orange-600 hover:underline">Neon</a> или <a href="https://supabase.com" target="_blank" rel="noopener" className="text-orange-600 hover:underline">Supabase</a>)</li>
          <li>Скопируйте <code className="bg-gray-100 px-1 rounded">.env.example</code> в <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
          <li>Добавьте строку подключения в <code className="bg-gray-100 px-1 rounded">DATABASE_URL</code></li>
          <li>Выполните <code className="bg-gray-100 px-1 rounded">npm run db:generate</code> - создаст миграции</li>
          <li>Выполните <code className="bg-gray-100 px-1 rounded">npm run db:push</code> - создаст таблицы</li>
          <li>Выполните <code className="bg-gray-100 px-1 rounded">npm run db:migrate-data</code> - перенесёт товары</li>
        </ol>
      </div>
    </div>
  );
}
