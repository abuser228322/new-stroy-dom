import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Глобальный кеш для dev режима (HMR)
declare global {
  var dbInstance: PostgresJsDatabase<typeof schema> | undefined;
}

// Создаём подключение к БД
function createDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables. Check your .env.local file.");
  }

  const client = postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

// Экспортируем функцию получения БД
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (process.env.NODE_ENV === "production") {
    return createDb();
  }

  // В dev режиме используем глобальный кеш
  if (!global.dbInstance) {
    global.dbInstance = createDb();
  }
  return global.dbInstance;
}

// Для обратной совместимости - ленивый геттер
// ВАЖНО: Это не будет выполняться при билде, только при runtime
export const db = {
  get query() {
    return getDb().query;
  },
  get insert() {
    return getDb().insert.bind(getDb());
  },
  get update() {
    return getDb().update.bind(getDb());
  },
  get delete() {
    return getDb().delete.bind(getDb());
  },
  get select() {
    return getDb().select.bind(getDb());
  },
};

// Типы для удобства
export type DB = PostgresJsDatabase<typeof schema>;
