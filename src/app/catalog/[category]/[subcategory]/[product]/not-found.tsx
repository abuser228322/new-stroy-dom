import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Товар не найден
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          К сожалению, запрашиваемый товар не существует или был удалён.
          Возможно, он закончился или ссылка устарела.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalog"
            className="px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
          >
            Перейти в каталог
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
