# 🏗️ Полный анализ архитектуры проекта "Строй Дом"

**Дата анализа:** 11 января 2026  
**Версия:** 1.0  
**Аналитик:** GitHub Copilot (Claude Opus 4.5)

---

## 📋 Оглавление

1. [Общая информация о проекте](#1-общая-информация-о-проекте)
2. [Технологический стек](#2-технологический-стек)
3. [Архитектура приложения](#3-архитектура-приложения)
4. [Структура базы данных](#4-структура-базы-данных)
5. [Анализ компонентов](#5-анализ-компонентов)
6. [Система аутентификации](#6-система-аутентификации)
7. [SEO и маркетинг](#7-seo-и-маркетинг)
8. [✅ Преимущества проекта](#8--преимущества-проекта)
9. [⚠️ Недостатки и проблемы](#9-️-недостатки-и-проблемы)
10. [🚀 Рекомендации по улучшению](#10--рекомендации-по-улучшению)
11. [📊 Приоритетность задач](#11--приоритетность-задач)
12. [🔮 Перспективы развития](#12--перспективы-развития)

---

## 1. Общая информация о проекте

### Описание
E-commerce платформа для магазина строительных материалов "Строй Дом" в Астрахани.

### Ключевые показатели
| Параметр | Значение |
|----------|----------|
| **Домен** | stroydom30.ru |
| **Сервер** | 178.250.157.34 |
| **Товаров** | 269 позиций (будут пополняться) |
| **Категорий** | 16 основных (будут пополняться) |
| **Страницы** | ~360 URL в sitemap |

### Основной функционал
- 🛒 Каталог товаров с фильтрацией
- 🧮 Калькулятор материалов (12+ категорий (будут пополняться))
- 📝 Блог со статьями
- 👤 Личный кабинет пользователя
- 🎫 Система промокодов
- 🛠️ Админ-панель (10 разделов)

---

## 2. Технологический стек

### Frontend
| Технология | Версия | Оценка |
|------------|--------|--------|
| **Next.js** | 16.0.7 | ✅ Стабильная |
| **React** | 19.2.0 | ✅ Стабильная |
| **TypeScript** | 5.x | ✅ Отлично |
| **Tailwind CSS** | 4.x | ✅ Современный |
| **Lucide React** | 0.562.0 | ✅ Стабильно |

### Backend
| Технология | Версия | Оценка |
|------------|--------|--------|
| **Next.js API Routes** | - | ✅ Хорошо |
| **Drizzle ORM** | 0.44.7 | ✅ Отлично |
| **PostgreSQL** | - | ✅ Надёжно |

### DevOps
| Технология | Применение |
|------------|-----------|
| **PM2** | Process Manager |
| **Turbopack** | Dev server |
| **Sharp** | Image optimization |

### Зависимости (package.json)
```
Основные: next, react, react-dom, drizzle-orm, postgres
UI: lucide-react, react-icons, tailwindcss
Утилиты: axios, xlsx, uuid, dotenv
```

---

## 3. Архитектура приложения

### Структура директорий
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (pages)/           # Страницы сайта
│   │   ├── catalog/       # Каталог товаров
│   │   ├── blog/          # Блог
│   │   ├── calculator/    # Калькулятор
│   │   ├── cart/          # Корзина
│   │   └── ...
│   ├── admin/             # Админ-панель (10 разделов)
│   ├── api/               # API Routes (11 endpoints)
│   ├── components/        # Компоненты (16 файлов)
│   ├── context/           # React Context (CartContext)
│   └── lib/               # Утилиты
├── lib/
│   ├── db/                # База данных
│   │   ├── schema.ts      # Drizzle схема (428 строк)
│   │   ├── queries.ts     # Запросы (252 строки)
│   │   └── index.ts       # Подключение
│   └── auth.ts            # Аутентификация (320 строк)
└── hooks/
    └── useCategories.ts   # Кастомные хуки
```

### Паттерн данных: PostgreSQL + Drizzle ORM
```
┌─────────────────────────────────────────────────────────┐
│              ЕДИНЫЙ ИСТОЧНИК ДАННЫХ                      │
│                  PostgreSQL + Drizzle ORM                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ ВСЕ ДАННЫЕ В БАЗЕ:                                   │
│  - Товары (products)                                    │
│  - Категории (categories)                               │
│  - Подкатегории (subcategories)                         │
│  - Пользователи (users)                                 │
│  - Сессии (sessions)                                    │
│  - Блог посты (blog_posts)                              │
│  - Калькулятор (calculator_*)                           │
│  - Промокоды (coupons)                                  │
│  - Слайды (hero_slides)                                 │
│  - Акции (promotions)                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Структура базы данных

### ER-диаграмма (упрощённая)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    USERS        │     │    SESSIONS      │     │    COUPONS      │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (serial)     │<────│ userId (int)     │     │ id (serial)     │
│ username        │     │ token (text)     │     │ code (varchar)  │
│ passwordHash    │     │ expiresAt (ts)   │     │ discountPercent │
│ email           │     │ userAgent        │     │ maxUses         │
│ phone           │     │ ipAddress        │     │ isActive        │
│ role (enum)     │     └──────────────────┘     └─────────────────┘
│ telegramId      │                                      │
│ avatar          │                                      │
└─────────────────┘                                      │
                                                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CATEGORIES    │────>│  SUBCATEGORIES   │────>│    PRODUCTS     │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (serial)     │     │ id (serial)      │     │ id (serial)     │
│ name            │     │ categoryId (FK)  │     │ urlId (unique)  │
│ slug (unique)   │     │ name             │     │ title           │
│ image           │     │ slug             │     │ price (decimal) │
│ isActive        │     │ sortOrder        │     │ pricesBySize    │
│ sortOrder       │     └──────────────────┘     │ inStock         │
└─────────────────┘                              │ calculatorFields│
                                                 └─────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ CALC_CATEGORIES │────>│  CALC_INPUTS     │     │  CALC_PRODUCTS  │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (serial)     │     │ categoryId (FK)  │     │ categoryId (FK) │
│ name            │     │ key (varchar)    │     │ name            │
│ slug (unique)   │     │ label            │     │ consumption     │
│ icon            │     │ unit             │     │ bagWeight       │
│ description     │     │ min, max, step   │     │ price           │
└─────────────────┘     └──────────────────┘     │ productId (FK)  │
                                                 └─────────────────┘
```

### Таблицы базы данных (14 таблиц)
| Таблица | Назначение | Строк (прим.) |
|---------|------------|---------------|
| users | Пользователи | ~50 |
| sessions | Активные сессии | ~20 |
| coupons | Промокоды | ~10 |
| coupon_usages | Использование промокодов | ~30 |
| categories | Категории товаров | 16 |
| subcategories | Подкатегории | ~60 |
| products | Товары | 269 |
| hero_slides | Слайды главной | 5 |
| promotions | Акции | ~10 |
| blog_posts | Статьи блога | 10 |
| calculator_categories | Категории калькулятора | 12 |
| calculator_inputs | Поля ввода | ~30 |
| calculator_products | Продукты калькулятора | ~100 |
| calculator_formulas | Формулы расчёта | ~12 |

---

## 5. Анализ компонентов

### Структура компонентов (16 файлов)
```
components/
├── Header.tsx              # 521 строк ⚠️ БОЛЬШОЙ
├── Footer.tsx              # ~150 строк
├── MaterialCalculator.tsx  # 1205 строк ⚠️ ОЧЕНЬ БОЛЬШОЙ
├── ProductCard.tsx         # ~180 строк
├── SearchBar.tsx           # ~200 строк
├── HeroSection.tsx         # ~150 строк
├── SchemaOrg.tsx           # ~250 строк (JSON-LD)
├── StoreStatusBadge.tsx    # ~50 строк
├── UserMenu.tsx            # ~80 строк
├── CookieConsent.tsx       # ~50 строк
├── ContactForm.tsx         # ~100 строк
├── ProductGallery.tsx      # ~120 строк
├── Pagination.tsx          # ~60 строк
├── PromotionCard.tsx       # ~70 строк
├── BlogCard.tsx            # ~80 строк
└── HammerCursor.tsx        # ~30 строк
```

### Метрики сложности
| Компонент | Строки | Хуки | Оценка |
|-----------|--------|------|--------|
| MaterialCalculator | 1205 | 5 | ⚠️ Требует рефакторинга |
| Header | 521 | 3 | ⚠️ Сложный |
| SearchBar | 200 | 6 | ✅ Нормально |
| ProductCard | 180 | 1 | ✅ Хорошо |

---

## 6. Система аутентификации

### Архитектура безопасности
```
┌─────────────────────────────────────────────────────────┐
│                  СИСТЕМА АУТЕНТИФИКАЦИИ                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Пароль    │   │   PBKDF2     │   │  Соль (16б)   │  │
│  │  (plain)   │──>│  100K iter   │──>│  + Hash (32б) │  │
│  └────────────┘   │  SHA-256     │   └───────────────┘  │
│                   └──────────────┘                       │
│                                                          │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Логин     │   │ Проверка в   │   │  Сессия       │  │
│  │  успешен   │──>│ БД (users)   │──>│  (30 дней)    │  │
│  └────────────┘   └──────────────┘   └───────────────┘  │
│                                                          │
│  Cookie: auth_token (httpOnly, secure, sameSite: lax)   │
└─────────────────────────────────────────────────────────┘
```

### Роли пользователей
| Роль | Доступ |
|------|--------|
| `user` | Личный кабинет, корзина, заказы |
| `admin` | Полный доступ к админ-панели |

### Telegram авторизация
- ✅ Поддержка Telegram Login Widget
- ✅ Верификация через HMAC-SHA256
- ✅ Привязка аккаунта по telegramId

---

## 7. SEO и маркетинг

### Реализованные SEO-компоненты
| Компонент | Статус | Описание |
|-----------|--------|----------|
| Schema.org JSON-LD | ✅ | 6 типов схем |
| Canonical URLs | ✅ | На всех страницах |
| OpenGraph | ✅ | Для соцсетей |
| Sitemap.xml | ✅ | ~360 URL |
| Robots.txt | ✅ | Настроен |
| Meta теги | ✅ | Title, description |
| Яндекс верификация | ✅ | yandex_62123382660b3356.html |

### Schema.org типы
```json
[
  "LocalBusiness",    // Информация о магазине
  "Organization",     // Организация
  "WebSite",          // Сайт + SearchAction
  "ItemList",         // Списки товаров
  "Product",          // Страницы товаров
  "Article",          // Блог статьи
  "BreadcrumbList"    // Хлебные крошки
]
```

---

## 8. ✅ Преимущества проекта

### 🏆 Сильные стороны

#### Технологии
1. **Современный стек** — Next.js App Router, React 19, Tailwind CSS 4
2. **Type-safe** — TypeScript везде, включая Drizzle ORM
3. **Производительность** — Turbopack, Image optimization, CSS chunking
4. **SEO-оптимизация** — Полная реализация Schema.org, метатеги

#### Архитектура
1. **App Router** — Современный подход к роутингу Next.js
2. **Server Components** — Рендеринг на сервере по умолчанию
3. **Drizzle ORM** — Современная, типизированная работа с БД
4. **Модульность** — Чёткое разделение API, компонентов, утилит

#### Функционал
1. **Калькулятор материалов** — Уникальная фича с 12+ категориями
2. **Админ-панель** — Полноценное управление контентом
3. **Блог** — SEO-трафик через информационные статьи
4. **Промокоды** — Система скидок с отслеживанием

#### Безопасность
1. **PBKDF2 хеширование** — 100K итераций, соль 16 байт
2. **httpOnly cookies** — Защита от XSS
3. **Роли пользователей** — user/admin разграничение
4. **Валидация данных** — Проверка на сервере

---

## 9. ⚠️ Недостатки и проблемы

### 🔴 Критические (нужно исправить)

#### 1. Отсутствие защиты админ-панели
```tsx
// admin/layout.tsx
export default function AdminLayout({ children }) {
  // ⚠️ НЕТ ПРОВЕРКИ АВТОРИЗАЦИИ!
  return <div>{children}</div>;
}
```
**Проблема:** Любой может получить доступ к /admin.  
**Риск:** Безопасность данных под угрозой.

#### 2. Большие компоненты без разбиения
```
MaterialCalculator.tsx — 1205 строк
Header.tsx — 521 строк
```
**Проблема:** Сложность поддержки, тестирования.  
**Риск:** Баги, сложный рефакторинг.

---

### 🟡 Важные (стоит улучшить)

#### 5. Нет тестов
```
⚠️ Отсутствуют: unit-тесты, e2e-тесты, интеграционные тесты
```

#### 6. Нет CI/CD
```
⚠️ Деплой вручную через SSH + PM2
```

#### 7. Нет кэширования
```
⚠️ Отсутствует Redis/Memcached для кэша запросов
```

#### 8. Нет логирования
```
⚠️ Только console.error, нет структурированных логов
```

#### 9. Нет мониторинга
```
⚠️ Отсутствует: Sentry, Prometheus, Grafana
```

#### 10. Нет Rate Limiting
```
⚠️ API не защищён от DDoS/брутфорса
```

---

### 🟠 Незначительные (косметические)

#### 11. Стили inline в компонентах
```tsx
// Встречается в Header.tsx
className="border-transparent text-gray-500 hover:border-gray-300..."
```
**Рекомендация:** Вынести в @apply или компоненты.

#### 12. Console.log в продакшене
```typescript
// Встречается в queries.ts
console.error("Error fetching categories:", error);
```

#### 13. Нет интернационализации
```
⚠️ Только русский язык, нет i18n
```

---

## 10. 🚀 Рекомендации по улучшению

### Приоритет 1: Критические (1-2 недели)

#### 1.1 Защитить админ-панель
```tsx
// src/app/admin/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/login?redirect=/admin');
  }
  
  const session = await verifySession(token);
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return <div>{children}</div>;
}
```

---

### Приоритет 2: Важные (2-4 недели)

#### 2.1 Добавить тесты
```bash
npm install -D vitest @testing-library/react @playwright/test
```

```typescript
// __tests__/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePlaster } from '@/lib/calculator';

describe('Calculator', () => {
  it('should calculate plaster correctly', () => {
    const result = calculatePlaster({
      area: 20,
      thickness: 10,
      consumption: 8.5,
      bagWeight: 30
    });
    expect(result.bags).toBe(6);
  });
});
```

#### 2.2 Настроить CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - name: Deploy to server
        run: |
          ssh user@178.250.157.34 "cd /app && git pull && npm ci && pm2 restart all"
```

#### 2.3 Добавить кэширование
```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getProductsCached = unstable_cache(
  async (categorySlug: string) => {
    return await getProducts({ categorySlug });
  },
  ['products'],
  { revalidate: 3600 } // 1 час
);
```

#### 2.4 Добавить Rate Limiting
```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 запросов/мин
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
}
```

---

### Приоритет 3: Улучшения (1-2 месяца)

#### 3.1 Рефакторинг MaterialCalculator
```
MaterialCalculator.tsx (1205 строк)
↓ РАЗБИТЬ НА:
├── MaterialCalculator/
│   ├── index.tsx           # Главный контейнер
│   ├── CategorySelector.tsx # Выбор категории
│   ├── ProductSelector.tsx  # Выбор продукта
│   ├── InputFields.tsx      # Поля ввода
│   ├── ResultCard.tsx       # Результат расчёта
│   ├── AddToCartButton.tsx  # Кнопка добавления
│   ├── hooks/
│   │   ├── useCalculation.ts
│   │   └── useDBCategories.ts
│   └── utils/
│       └── formulas.ts      # Формулы расчёта
```

#### 3.2 Добавить мониторинг
```typescript
// Sentry для ошибок
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### 3.3 Добавить структурированные логи
```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  },
});

// Использование
logger.info({ userId, action: 'login' }, 'User logged in');
```

---

### Приоритет 4: Новый функционал

#### 4.1 Система заказов
```typescript
// schema.ts — добавить таблицы
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  status: orderStatusEnum('status').default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  deliveryAddress: text('delivery_address'),
  deliveryType: deliveryTypeEnum('delivery_type'),
  paymentMethod: paymentMethodEnum('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id'),
  quantity: decimal('quantity'),
  price: decimal('price'),
  size: varchar('size', { length: 100 }),
});
```

#### 4.2 Интеграция с платёжными системами
- ЮKassa (Яндекс.Касса)
- СБП (Система быстрых платежей)
- Тинькофф Эквайринг

#### 4.3 Уведомления
- Email (Nodemailer + шаблоны)
- Telegram Bot для заказов
- SMS (SMS.RU / SMSC)

---

## 11. 📊 Приоритетность задач

### Матрица срочность/важность

```
                    ВАЖНО
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    │  [Квадрант 2]   │   [Квадрант 1]  │
    │  ПЛАНИРОВАТЬ    │   ДЕЛАТЬ СЕЙЧАС │
    │                 │                 │
    │  • Тесты        │  • Защита админки│
    │  • CI/CD        │                 │
    │  • Рефакторинг  │                 │
    │  • Логирование  │                 │
НЕ  │                 │                 │  СРОЧНО
СРОЧНО ─────────────────────────────────────
    │                 │                 │
    │  [Квадрант 4]   │   [Квадрант 3]  │
    │  ОТЛОЖИТЬ       │   ДЕЛЕГИРОВАТЬ  │
    │                 │                 │
    │  • i18n         │  • Rate Limit   │
    │  • Dark mode    │  • Мониторинг   │
    │  • PWA          │                 │
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
                  НЕ ВАЖНО
```

### План работ

| Неделя | Задачи | Результат |
|--------|--------|-----------|
| 1 | Защита админки | Безопасность ↑ |
| 2-3 | Тесты, CI/CD | Надёжность ↑ |
| 5-6 | Кэширование, Rate Limit | Производительность ↑ |
| 7-8 | Рефакторинг компонентов | Поддерживаемость ↑ |
| 9-10 | Мониторинг, логирование | Наблюдаемость ↑ |
| 11-12 | Система заказов | Функционал ↑ |

---

## 12. 🔮 Перспективы развития

### Краткосрочные (3-6 месяцев)
1. **Полноценный интернет-магазин** — Заказы, оплата, доставка
2. **Мобильное приложение** — React Native / Expo
3. **PWA** — Офлайн-режим, push-уведомления

### Среднесрочные (6-12 месяцев)
1. **Маркетплейс** — Подключение поставщиков
2. **1C интеграция** — Синхронизация остатков и цен
3. **CRM** — Управление клиентами

### Долгосрочные (1-2 года)
1. **AI-рекомендации** — Персонализация товаров
2. **AR-визуализация** — Примерка материалов
3. **Франшиза** — Масштабирование на другие города

---

## 📝 Заключение

### Общая оценка проекта: 7/10

| Критерий | Оценка | Комментарий |
|----------|--------|-------------|
| Технологии | 9/10 | Современный стек, стабильные версии |
| Архитектура | 7/10 | Хорошая структура, есть проблемы |
| Безопасность | 6/10 | Нет защиты админки, нет rate limit |
| Производительность | 7/10 | Оптимизация изображений, нет кэша |
| Тестируемость | 3/10 | Нет тестов |
| Документация | 5/10 | Базовая документация |
| SEO | 9/10 | Отличная реализация |
| UX/UI | 8/10 | Приятный дизайн, удобная навигация |

### Ключевые выводы

1. **Проект имеет хороший фундамент** — современные технологии, продуманная архитектура
2. **Критические проблемы безопасности** — требуется срочное исправление
3. **Уникальные фичи** — калькулятор материалов даёт конкурентное преимущество
4. **Потенциал роста** — возможность развития в полноценный e-commerce

---

**Документ подготовлен:** GitHub Copilot (Claude Opus 4.5)  
**Версия документа:** 1.0  
**Следующий ревью:** через 3 месяца
