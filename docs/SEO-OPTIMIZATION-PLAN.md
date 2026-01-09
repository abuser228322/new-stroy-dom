# 🚀 План SEO-оптимизации сайта "Строй Дом"

> Полная техническая документация для вывода сайта stroydom30.ru в ТОП-3 поисковой выдачи по Астрахани

---

## 📊 Текущий статус проекта

### ✅ Что уже реализовано

| Компонент | Статус | Расположение |
|-----------|--------|--------------|
| **sitemap.xml** | ✅ Есть | `src/app/sitemap.ts` - динамическая генерация |
| **robots.txt** | ✅ Есть | `src/app/robots.ts` - правильная настройка для Яндекс/Google |
| **Open Graph теги** | ✅ Частично | `layout.tsx`, `page.tsx`, товары — есть; категории, блог — нужно улучшить |
| **Twitter Cards** | ✅ Есть | В layout.tsx и товарах |
| **JSON-LD Product** | ✅ Есть | Только на страницах товаров `[product]/page.tsx` |
| **JSON-LD BreadcrumbList** | ✅ Есть | Только на страницах товаров |
| **Canonical URL** | ⚠️ Частично | Только товары, нужно добавить на все страницы |
| **Изображения WebP** | ✅ Все 260 шт | `public/images/` |
| **alt-теги изображений** | ✅ Есть | ProductCard, SearchBar используют `product.title` |
| **Метаданные страниц** | ✅ Есть | Все основные страницы |

### ❌ Что нужно добавить

| Компонент | Приоритет | Влияние на SEO |
|-----------|-----------|----------------|
| **LocalBusiness Schema** | 🔴 Высокий | +20-30% в локальном поиске |
| **Organization Schema** | 🔴 Высокий | Бренд в поиске |
| **Canonical URL везде** | 🔴 Высокий | Избежание дублей |
| **FAQ Schema для товаров** | 🟡 Средний | Rich snippets |
| **Review/Rating Schema** | 🟡 Средний | Звёзды в выдаче |
| **Новые статьи блога (9-14)** | 🟡 Средний | SEO-трафик по НЧ запросам |
| **Улучшенные description товаров** | 🟢 Низкий | Уникальность контента |

---

## 🏗️ Архитектура SEO-компонентов

### 1. Структура файлов для изменения

```
src/app/
├── layout.tsx              # ← Добавить Organization Schema
├── page.tsx                # ← Добавить LocalBusiness Schema (главная)
├── sitemap.ts              # ← Раскомментировать товары
├── contacts/
│   └── page.tsx            # ← Добавить LocalBusiness Schema
├── catalog/
│   ├── page.tsx            # ← Добавить canonical, улучшить meta
│   ├── [category]/
│   │   ├── page.tsx        # ← Добавить canonical, JSON-LD
│   │   └── [subcategory]/
│   │       ├── page.tsx    # ← Добавить canonical, JSON-LD ItemList
│   │       └── [product]/
│   │           └── page.tsx # ✅ Уже есть Product Schema
├── blog/
│   ├── page.tsx            # ← Добавить canonical, улучшить OG
│   └── [slug]/
│       └── page.tsx        # ← Добавить Article Schema, canonical
└── components/
    └── SchemaOrg.tsx       # ← СОЗДАТЬ: переиспользуемые компоненты Schema
```

---

## 📝 Детальный план работ

### Этап 1: Schema.org разметка (Высокий приоритет)

#### 1.1 Создать компонент `SchemaOrg.tsx`

**Файл:** `src/app/components/SchemaOrg.tsx`

```tsx
// Компоненты для JSON-LD разметки

// LocalBusiness - для страниц контактов и главной
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://stroydom30.ru/#organization",
    "name": "Строй Дом",
    "alternateName": "Магазин строительных материалов Строй Дом",
    "description": "Магазин строительных материалов в Астрахани. Профнастил, сухие смеси, гипсокартон, утеплители, крепёж.",
    "url": "https://stroydom30.ru",
    "telephone": "+7-937-133-33-66",
    "email": "info@stroydom30.ru",
    "priceRange": "₽₽",
    "currenciesAccepted": "RUB",
    "paymentAccepted": "Наличные, Карта, Перевод",
    "image": "https://stroydom30.ru/og-image.jpg",
    "logo": {
      "@type": "ImageObject",
      "url": "https://stroydom30.ru/logo.png"
    },
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "ул. Рыбинская, 25Н",
        "addressLocality": "Астрахань",
        "addressRegion": "Астраханская область",
        "postalCode": "414000",
        "addressCountry": "RU"
      },
      {
        "@type": "PostalAddress", 
        "streetAddress": "пл. Свободы, 14К",
        "addressLocality": "Астрахань",
        "addressRegion": "Астраханская область",
        "postalCode": "414000",
        "addressCountry": "RU"
      }
    ],
    "geo": [
      {
        "@type": "GeoCoordinates",
        "latitude": 46.3472,
        "longitude": 48.0408
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:00",
        "closes": "16:00",
        "description": "Магазин №1 (Рыбинская)"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "08:00",
        "closes": "14:00",
        "description": "Магазин №1 (Рыбинская)"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00",
        "description": "Магазин №2 (пл. Свободы)"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "18:00",
        "description": "Магазин №2 (пл. Свободы)"
      }
    ],
    "areaServed": {
      "@type": "City",
      "name": "Астрахань"
    },
    "sameAs": [
      // Добавить когда будут соцсети
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization - глобальный для сайта
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://stroydom30.ru/#organization",
    "name": "Строй Дом",
    "url": "https://stroydom30.ru",
    "logo": "https://stroydom30.ru/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-937-133-33-66",
      "contactType": "sales",
      "areaServed": "RU",
      "availableLanguage": "Russian"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite - для поиска по сайту в Google
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Строй Дом",
    "url": "https://stroydom30.ru",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://stroydom30.ru/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ItemList - для страниц категорий/подкатегорий
export function ItemListSchema({ items, name, url }: {
  items: Array<{ name: string; url: string; image?: string; price?: number }>;
  name: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "url": url,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "url": item.url,
        "image": item.image,
        ...(item.price && {
          "offers": {
            "@type": "Offer",
            "price": item.price,
            "priceCurrency": "RUB"
          }
        })
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article - для блога
export function ArticleSchema({ 
  title, 
  description, 
  image, 
  datePublished, 
  dateModified,
  url 
}: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || "https://stroydom30.ru/og-image.jpg",
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": "Строй Дом"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Строй Дом",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stroydom30.ru/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### 1.2 Добавить в `layout.tsx`

```tsx
// После существующего кода в <body>
import { OrganizationSchema, WebSiteSchema } from './components/SchemaOrg';

// В начале body:
<OrganizationSchema />
<WebSiteSchema />
```

#### 1.3 Добавить LocalBusiness на главную

**Файл:** `src/app/page.tsx`

```tsx
import { LocalBusinessSchema } from './components/SchemaOrg';

// В начале компонента Home:
<LocalBusinessSchema />
```

---

### Этап 2: Canonical URL на всех страницах

#### 2.1 Страницы каталога

**Файл:** `src/app/catalog/page.tsx`
```tsx
export const metadata: Metadata = {
  // ... существующее
  alternates: {
    canonical: 'https://stroydom30.ru/catalog',
  },
};
```

**Файл:** `src/app/catalog/[category]/page.tsx`
```tsx
// В generateMetadata:
return {
  // ... существующее
  alternates: {
    canonical: `https://stroydom30.ru/catalog/${categorySlug}`,
  },
};
```

**Файл:** `src/app/catalog/[category]/[subcategory]/page.tsx`
```tsx
// В generateMetadata:
return {
  // ... существующее
  alternates: {
    canonical: `https://stroydom30.ru/catalog/${categorySlug}/${subcategorySlug}`,
  },
};
```

#### 2.2 Блог

**Файл:** `src/app/blog/page.tsx`
```tsx
export const metadata: Metadata = {
  // ... существующее
  alternates: {
    canonical: 'https://stroydom30.ru/blog',
  },
};
```

**Файл:** `src/app/blog/[slug]/page.tsx`
```tsx
// В generateMetadata:
return {
  // ... существующее
  alternates: {
    canonical: `https://stroydom30.ru/blog/${slug}`,
  },
};
```

#### 2.3 Остальные страницы

| Страница | Canonical URL |
|----------|---------------|
| `/contacts` | `https://stroydom30.ru/contacts` |
| `/sales` | `https://stroydom30.ru/sales` |
| `/payment` | `https://stroydom30.ru/payment` |
| `/policy` | `https://stroydom30.ru/policy` |

---

### Этап 3: Sitemap — включить товары

**Файл:** `src/app/sitemap.ts`

Раскомментировать секцию с товарами:

```typescript
// 4. Страницы товаров
const productUrls: MetadataRoute.Sitemap = products.map(product => {
  const categorySlug = getCategorySlug(product.mainCategory);
  const subcategorySlug = getSubcategorySlug(product.subCategory);
  
  return {
    url: `${BASE_URL}/catalog/${categorySlug}/${subcategorySlug}/${product.urlId}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  };
});

// Добавить в блог
const blogUrls: MetadataRoute.Sitemap = blogPosts.map(post => ({
  url: `${BASE_URL}/blog/${post.slug}`,
  lastModified: post.updatedAt || post.publishedAt,
  changeFrequency: 'weekly' as const,
  priority: 0.5,
}));

return [
  ...staticUrls,
  ...categoryUrls,
  ...subcategoryUrls,
  ...productUrls,
  ...blogUrls,
];
```

---

### Этап 4: Блог — новые статьи

#### Требуется добавить 9-14 новых статей:

| № | Тема | Ключевые слова | Внутренние ссылки |
|---|------|----------------|-------------------|
| 7 | Как выбрать профнастил для забора в Астрахани | профнастил забор астрахань | С-8, МП-20, крепёж |
| 8 | Штукатурка стен: пошаговая инструкция | штукатурка стен | сухие смеси, маяки |
| 9 | Утепление дома минватой: советы экспертов | утепление минватой астрахань | минвата, изоляция |
| 10 | Как класть плитку: полный гайд для новичков | плиточный клей укладка плитки | плиточный клей, затирка |
| 11 | Виды гидроизоляции: что выбрать для ванной | гидроизоляция ванной | гидроизоляция |
| 12 | Ремонт квартиры в Астрахани: с чего начать | ремонт квартиры астрахань | все категории |
| 13 | Сравнение брендов: Knauf, Ceresit, Волма | knauf ceresit волма сравнение | сухие смеси |
| 14 | Расход материалов: калькулятор для ремонта | расход штукатурки расход клея | калькулятор |
| 15 | Строительство гаража из профлиста | гараж профлист астрахань | профнастил, крепёж |

---

### Этап 5: Улучшение метаданных

#### 5.1 Шаблоны title для страниц

```
Главная:     Строй Дом — Стройматериалы в Астрахани | Профнастил, смеси, гипсокартон
Категория:   {Категория} купить в Астрахани по низким ценам | Строй Дом
Подкатегория: {Подкатегория} — {Категория} | Купить в Астрахани | Строй Дом
Товар:       {Товар} купить в Астрахани {цена} ₽ | Строй Дом
Блог:        {Заголовок} | Блог о строительстве | Строй Дом
```

#### 5.2 Шаблоны description

```
Категория:   {Категория} по низким ценам в Астрахани. Широкий выбор, доставка, 
             самовывоз. Магазин стройматериалов Строй Дом ☎ 8-937-133-33-66

Товар:       Купить {товар} в Астрахани за {цена} ₽. {Краткое описание}. 
             Доставка по городу. Магазин Строй Дом ☎ 8-937-133-33-66
```

---

## 💰 Оценка бюджета и сроков

### Бюджет на рекламу (рекомендуемый)

| Канал | Мин. бюджет/мес | Оптимальный | Результат |
|-------|-----------------|-------------|-----------|
| **Яндекс.Директ** | 15 000 ₽ | 30 000 ₽ | ~200-400 переходов |
| **Яндекс.Бизнес** | 0 ₽ (бесплатно) | 5 000 ₽ (приоритет) | Карты, отзывы |
| **Google Ads** | 10 000 ₽ | 20 000 ₽ | ~150-300 переходов |
| **ВКонтакте** | 5 000 ₽ | 15 000 ₽ | Охват + ретаргет |

**📌 Рекомендуемый стартовый бюджет:** 30 000 - 50 000 ₽/мес

### Сроки выхода в ТОП

| Позиция | Срок | Условия |
|---------|------|---------|
| **ТОП-10** | 2-3 месяца | SEO + реклама 30К/мес |
| **ТОП-5** | 4-6 месяцев | SEO + реклама 50К/мес + отзывы |
| **ТОП-3** | 6-9 месяцев | Полный SEO + 50-70К/мес + 30+ отзывов |
| **ТОП-1** | 9-12 месяцев | Всё вышеперечисленное + уникальный контент |

### Факторы ускорения:

1. **Яндекс.Бизнес** — бесплатно даёт видимость на картах
2. **Отзывы клиентов** — каждый отзыв = +5% к локальному SEO
3. **Регулярные статьи** — 2-3 статьи в месяц = органический трафик
4. **Сезонность** — весна/лето = пик спроса на стройматериалы

---

## 📋 Чек-лист для нового чата

### Обязательно перед началом работы:

- [ ] Проверить что сервер доступен: `ssh root@178.250.157.34`
- [ ] Проверить git status: нет незакоммиченных изменений
- [ ] Запустить dev сервер: `npm run dev`

### Порядок выполнения задач:

1. **Создать `SchemaOrg.tsx`** — компоненты JSON-LD
2. **Добавить Schema в layout.tsx** — Organization, WebSite
3. **Добавить LocalBusiness** — главная, контакты
4. **Добавить canonical** — все страницы
5. **Обновить sitemap.ts** — добавить товары и блог
6. **Добавить ItemList Schema** — категории, подкатегории
7. **Добавить Article Schema** — блог
8. **Создать новые статьи** — 9-14 статей
9. **Проверить результат** — Google Rich Results Test

### Команды для деплоя:

```bash
# Локально
npm run build

# На сервере
ssh root@178.250.157.34 "cd /var/www/new-stroy-dom && git pull && npm run build && pm2 restart stroy-dom"
```

### Проверка SEO после деплоя:

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema Validator:** https://validator.schema.org/
3. **Яндекс.Вебмастер:** https://webmaster.yandex.ru/
4. **Google Search Console:** https://search.google.com/search-console

---

## 📊 Текущая статистика проекта

| Метрика | Значение |
|---------|----------|
| Всего товаров | 269 |
| Категорий | 16 |
| Подкатегорий | ~50 |
| Статей блога | 6 (нужно 15-20) |
| Изображений | 260 (все WebP) |
| Страниц в sitemap | ~132 |

---

## 🎯 KPI для отслеживания

| Метрика | Текущее | Цель (3 мес) | Цель (6 мес) |
|---------|---------|--------------|--------------|
| Позиция "стройматериалы астрахань" | ? | ТОП-10 | ТОП-5 |
| Органический трафик | ~0 | 500/мес | 2000/мес |
| Отзывов на Яндекс.Картах | 0 | 10+ | 30+ |
| Статей в блоге | 6 | 12 | 20 |

---

*Документ создан: 09.01.2026*
*Версия: 1.0*
