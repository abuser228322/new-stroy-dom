/**
 * Типы для UI компонентов
 */

// ==================== НАВИГАЦИЯ ====================

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  shortName?: string | null;
  image?: string | null;
  icon?: string | null;
  subcategories: MenuSubcategory[];
}

export interface MenuSubcategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
}

// ==================== ХЕДЕР ====================

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
}

export interface StoreOpenDotProps {
  isOpen: boolean;
}

// ==================== МАГАЗИНЫ ====================

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  phones?: string[];
  email?: string;
  workingHours: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreHours {
  weekday: { open: number; close: number };
  saturday: { open: number; close: number };
  sunday: { open: number; close: number };
}

// ==================== ОТЗЫВЫ ====================

export interface Review {
  id: number;
  author: string;
  text: string;
  rating: number;           // 1-5
  createdAt: string;
  isApproved: boolean;
}

// ==================== ОБЩИЕ ====================

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}
