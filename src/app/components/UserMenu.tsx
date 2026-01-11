'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100"
        aria-label="Войти"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    );
  }

  const roleColors: Record<string, string> = {
    SUPERADMIN: 'bg-purple-500',
    ADMIN: 'bg-red-500',
    MODER: 'bg-orange-500',
    USER: 'bg-sky-500',
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-sky-600 transition-colors rounded-lg hover:bg-gray-100 relative"
        aria-label="Профиль"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${roleColors[user.role]}`}>
            {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Индикатор роли для админов */}
        {(user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'MODER') && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${roleColors[user.role]} rounded-full border-2 border-white`}></span>
        )}
      </button>

      {/* Dropdown меню */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {/* Информация о пользователе */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900 truncate">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.firstName || user.username}
            </p>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            {user.telegramUsername && (
              <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.12.098.153.228.168.326.015.146.033.312.015.481z"/>
                </svg>
                @{user.telegramUsername}
              </div>
            )}
          </div>

          {/* Ссылки меню */}
          <div className="py-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Личный кабинет
            </Link>
            
            <Link
              href="/account?tab=orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Мои заказы
            </Link>

            {/* Ссылка на админ-панель для модераторов и выше */}
            {(user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'MODER') && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Админ-панель
                </Link>
              </>
            )}
          </div>

          {/* Кнопка выхода */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
