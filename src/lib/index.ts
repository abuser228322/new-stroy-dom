/**
 * Библиотечные функции
 */

// Auth - основные функции
export {
  hashPassword,
  verifyPassword,
  generateToken,
  createSession,
  validateSession,
  deleteSession,
  deleteAllUserSessions,
  registerUser,
  loginUser,
  loginWithTelegram,
  updateUserProfile,
  changePassword,
  setPassword,
  hasRole,
  isAdmin,
  isModerator,
  isSuperAdmin,
} from './auth';

export type { User, NewUser } from './auth';

// Auth utils для API
export {
  requireAdmin,
  requireModerator,
  requireAuth,
  authErrorResponse,
  getCurrentUser,
  getCurrentAdmin,
} from './auth-utils';

export type { AuthResult } from './auth-utils';

// Database
export { db } from './db';
