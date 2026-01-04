'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout, updateProfile, changePassword, setPassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [newPasswordData, setNewPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Показываем модалку привязки Telegram для новых пользователей
  useEffect(() => {
    const isWelcome = searchParams.get('welcome') === '1';
    if (isWelcome && user && !user.telegramId && !welcomeDismissed) {
      // Небольшая задержка для плавности
      const timer = setTimeout(() => {
        setShowTelegramModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, welcomeDismissed]);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Профиль успешно обновлён' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка обновления' });
    }
    
    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      setIsSaving(false);
      return;
    }
    
    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Пароль успешно изменён' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка смены пароля' });
    }
    
    setIsSaving(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      setIsSaving(false);
      return;
    }
    
    const result = await setPassword(newPasswordData.password);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Пароль успешно установлен' });
      setNewPasswordData({ password: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка установки пароля' });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleNames: Record<string, string> = {
    SUPERADMIN: 'Главный администратор',
    ADMIN: 'Администратор',
    MODER: 'Модератор',
    USER: 'Пользователь',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Хедер профиля */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-sky-600">
                  {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-800">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.firstName || user.username}
              </h1>
              <p className="text-slate-500">@{user.username}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.role === 'MODER' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {roleNames[user.role]}
                </span>
                {user.telegramUsername && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.12.098.153.228.168.326.015.146.033.312.015.481z"/>
                    </svg>
                    @{user.telegramUsername}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {(user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'MODER') && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Админ-панель
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
        
        {/* Модальное окно привязки Telegram */}
        {showTelegramModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.12.098.153.228.168.326.015.146.033.312.015.481z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Добро пожаловать! 🎉</h2>
                <p className="text-slate-600 mb-4">
                  Привяжите Telegram, чтобы быстрее входить в аккаунт и получать уведомления о заказах
                </p>
              </div>
              
              <div className="space-y-3">
                <a
                  href="https://t.me/StroyDom30_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => {
                    setShowTelegramModal(false);
                    setWelcomeDismissed(true);
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.12.098.153.228.168.326.015.146.033.312.015.481z"/>
                  </svg>
                  Привязать Telegram
                </a>
                
                <button
                  onClick={() => {
                    setShowTelegramModal(false);
                    setWelcomeDismissed(true);
                  }}
                  className="w-full text-slate-500 hover:text-slate-700 font-medium py-2 transition-colors"
                >
                  Позже
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Уведомление */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Табы */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => { setActiveTab('profile'); setMessage(null); }}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Профиль
              </button>
              <button
                onClick={() => { setActiveTab('security'); setMessage(null); }}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Безопасность
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMessage(null); }}
                className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Заказы
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* Вкладка профиля */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-50"
                      placeholder="Введите имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-50"
                      placeholder="Введите фамилию"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                      {user.emailVerified && (
                        <span className="ml-2 text-xs text-green-600">✓ Подтверждён</span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-50"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Телефон
                      {user.phoneVerified && (
                        <span className="ml-2 text-xs text-green-600">✓ Подтверждён</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:bg-slate-50"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            email: user.email || '',
                            phone: user.phone || '',
                          });
                        }}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Редактировать
                    </button>
                  )}
                </div>
              </form>
            )}
            
            {/* Вкладка безопасности */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Привязанные аккаунты */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Привязанные аккаунты</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.12.098.153.228.168.326.015.146.033.312.015.481z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">Telegram</p>
                          {user.telegramUsername ? (
                            <p className="text-sm text-slate-500">@{user.telegramUsername}</p>
                          ) : (
                            <p className="text-sm text-slate-400">Не привязан</p>
                          )}
                        </div>
                      </div>
                      {user.telegramId ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Привязан
                        </span>
                      ) : (
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Привязать
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Смена/установка пароля */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {user.hasPassword ? 'Сменить пароль' : 'Установить пароль'}
                  </h3>
                  
                  {user.hasPassword ? (
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Текущий пароль
                        </label>
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          minLength={6}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Подтверждение пароля
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          minLength={6}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Сохранение...' : 'Сменить пароль'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSetPassword} className="max-w-md space-y-4">
                      <p className="text-sm text-slate-500 mb-4">
                        Вы авторизовались через Telegram. Установите пароль, чтобы входить по логину и паролю.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          value={newPasswordData.password}
                          onChange={(e) => setNewPasswordData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          minLength={6}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Подтверждение пароля
                        </label>
                        <input
                          type="password"
                          value={newPasswordData.confirmPassword}
                          onChange={(e) => setNewPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                          minLength={6}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Сохранение...' : 'Установить пароль'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
            
            {/* Вкладка заказов */}
            {activeTab === 'orders' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Заказов пока нет</h3>
                <p className="text-slate-500 mb-6">История ваших заказов появится здесь</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                >
                  Перейти к покупкам
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountContent />
    </Suspense>
  );
}
