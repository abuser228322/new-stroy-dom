// SEO Schema.org JSON-LD компоненты для улучшения поисковой выдачи
// Используются для разметки структурированных данных сайта stroydom30.ru

// LocalBusiness - информация о магазине (для главной и контактов)
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
    "sameAs": []
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization - глобальная информация об организации
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
        "urlTemplate": "https://stroydom30.ru/catalog?search={search_term_string}"
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
interface ItemListItem {
  name: string;
  url: string;
  image?: string;
  price?: number;
}

interface ItemListSchemaProps {
  items: ItemListItem[];
  name: string;
  url: string;
}

export function ItemListSchema({ items, name, url }: ItemListSchemaProps) {
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
        ...(item.image && { "image": item.image }),
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

// Article - для статей блога
interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  url
}: ArticleSchemaProps) {
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

// BreadcrumbList - для хлебных крошек (универсальный компонент)
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
