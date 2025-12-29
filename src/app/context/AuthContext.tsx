'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'MODER' | 'USER';
  avatar: string | null;
  telegramId: string | null;
  telegramUsername: string | null;
  createdAt: string;
  hasPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  loginWithTelegram: (telegramData: TelegramAuthData) => Promise<{ success: boolean; error?: string; isNew?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface ProfileUpdateData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка входа' };
      }
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка регистрации' };
      }
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  const loginWithTelegram = async (telegramData: TelegramAuthData) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка авторизации через Telegram' };
      }
      
      setUser(data.user);
      return { success: true, isNew: data.isNew };
    } catch (error) {
      console.error('Telegram login error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        return { success: false, error: responseData.error || 'Ошибка обновления' };
      }
      
      setUser(prev => prev ? { ...prev, ...responseData.user } : null);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка смены пароля' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  const setPassword = async (password: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-password', password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка установки пароля' };
      }
      
      await refreshUser();
      return { success: true };
    } catch (error) {
      console.error('Set password error:', error);
      return { success: false, error: 'Ошибка соединения' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithTelegram,
      logout,
      updateProfile,
      changePassword,
      setPassword,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
