import { db } from './db';
import { users, sessions, type User, type NewUser } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

// ==================== ХЕШИРОВАНИЕ ПАРОЛЕЙ ====================

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

// ==================== ГЕНЕРАЦИЯ ТОКЕНОВ ====================

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ==================== СЕССИИ ====================

export async function createSession(userId: number, userAgent?: string, ip?: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
  
  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
    userAgent,
    ip,
  });
  
  // Обновляем lastLoginAt
  await db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
  
  return token;
}

export async function validateSession(token: string): Promise<User | null> {
  const result = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.token, token),
      gt(sessions.expiresAt, new Date())
    ),
    with: {
      user: true,
    },
  });
  
  if (!result || !result.user.isActive) {
    return null;
  }
  
  return result.user;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ==================== РЕГИСТРАЦИЯ ====================

export async function registerUser(data: {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Проверяем уникальность username
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    });
    
    if (existingUser) {
      return { success: false, error: 'Пользователь с таким логином уже существует' };
    }
    
    // Проверяем email если указан
    if (data.email) {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });
      if (existingEmail) {
        return { success: false, error: 'Этот email уже используется' };
      }
    }
    
    const passwordHash = await hashPassword(data.password);
    
    const [user] = await db.insert(users).values({
      username: data.username,
      passwordHash,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
    }).returning();
    
    return { success: true, user };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Ошибка при регистрации' };
  }
}

// ==================== АВТОРИЗАЦИЯ ====================

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Неверный логин или пароль' };
    }
    
    if (!user.isActive) {
      return { success: false, error: 'Аккаунт заблокирован' };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: 'Неверный логин или пароль' };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Ошибка при входе' };
  }
}

// ==================== TELEGRAM АВТОРИЗАЦИЯ ====================

export async function loginWithTelegram(telegramData: {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}): Promise<{ success: boolean; user?: User; isNew?: boolean; error?: string }> {
  try {
    // Ищем существующего пользователя по Telegram ID
    let user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramData.id),
    });
    
    if (user) {
      // Обновляем данные из Telegram
      const [updated] = await db.update(users)
        .set({
          telegramUsername: telegramData.username,
          firstName: telegramData.first_name || user.firstName,
          lastName: telegramData.last_name || user.lastName,
          avatar: telegramData.photo_url || user.avatar,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      
      return { success: true, user: updated, isNew: false };
    }
    
    // Создаем нового пользователя
    const username = telegramData.username || `tg_${telegramData.id}`;
    
    // Проверяем уникальность username
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    const finalUsername = existingUsername ? `tg_${telegramData.id}_${Date.now()}` : username;
    
    const [newUser] = await db.insert(users).values({
      username: finalUsername,
      telegramId: telegramData.id,
      telegramUsername: telegramData.username,
      firstName: telegramData.first_name,
      lastName: telegramData.last_name,
      avatar: telegramData.photo_url,
    }).returning();
    
    return { success: true, user: newUser, isNew: true };
  } catch (error) {
    console.error('Telegram login error:', error);
    return { success: false, error: 'Ошибка авторизации через Telegram' };
  }
}

// ==================== ОБНОВЛЕНИЕ ПРОФИЛЯ ====================

export async function updateUserProfile(userId: number, data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Проверяем email если указан
    if (data.email) {
      const existingEmail = await db.query.users.findFirst({
        where: and(
          eq(users.email, data.email),
          // Исключаем текущего пользователя
        ),
      });
      if (existingEmail && existingEmail.id !== userId) {
        return { success: false, error: 'Этот email уже используется' };
      }
    }
    
    const [updated] = await db.update(users)
      .set({
        ...data,
        emailVerified: data.email ? false : undefined,
        phoneVerified: data.phone ? false : undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return { success: true, user: updated };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Ошибка при обновлении профиля' };
  }
}

// ==================== СМЕНА ПАРОЛЯ ====================

export async function changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Пользователь не найден' };
    }
    
    const isValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Неверный текущий пароль' };
    }
    
    const newPasswordHash = await hashPassword(newPassword);
    
    await db.update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Ошибка при смене пароля' };
  }
}

// ==================== УСТАНОВКА ПАРОЛЯ (для Telegram юзеров) ====================

export async function setPassword(userId: number, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await hashPassword(password);
    
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Set password error:', error);
    return { success: false, error: 'Ошибка при установке пароля' };
  }
}

// ==================== ПРОВЕРКА ПРАВ ====================

export function hasRole(user: User | null, roles: Array<'SUPERADMIN' | 'ADMIN' | 'MODER' | 'USER'>): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['SUPERADMIN', 'ADMIN']);
}

export function isModerator(user: User | null): boolean {
  return hasRole(user, ['SUPERADMIN', 'ADMIN', 'MODER']);
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, ['SUPERADMIN']);
}
