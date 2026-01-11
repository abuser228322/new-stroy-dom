/**
 * Типы для Header компонентов
 * Реэкспорт из центрального модуля типов
 */
export type { 
  Category, 
  NavLink, 
  MobileMenuProps, 
  StoreOpenDotProps,
  MenuCategory 
} from '@/types';

// Константы навигации
export const NAV_LINKS = [
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/blog', label: 'Блог' },
  { href: '/sales', label: 'Акции' },
  { href: '/contacts', label: 'Контакты' },
] as const;
