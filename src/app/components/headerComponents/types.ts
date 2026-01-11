import type { Category } from '@/hooks/useCategories';

export type { Category };

export interface NavLink {
  href: string;
  label: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export interface StoreOpenDotProps {
  isOpen: boolean;
}

// Навигационные ссылки
export const NAV_LINKS: NavLink[] = [
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/blog', label: 'Блог' },
  { href: '/sales', label: 'Акции' },
  { href: '/contacts', label: 'Контакты' },
];
