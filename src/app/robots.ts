import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://stroydom30.ru';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/login/',
          '/favorites/',
          '/_next/',
          '/static/',
          '/cart',
        ],
      },
      // Специальные правила для поисковых ботов
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/login/', '/favorites/', '/cart'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/admin/', '/login/', '/favorites/', '/cart'],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
