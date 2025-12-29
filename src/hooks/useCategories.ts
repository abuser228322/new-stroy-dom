'use client';

import { useState, useEffect } from 'react';

export interface Category {
  id: number;
  slug: string;
  name: string;
  shortName: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

// Кеш для категорий
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(categoriesCache || []);
  const [loading, setLoading] = useState(!categoriesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если есть свежий кеш - не делаем запрос
    if (categoriesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setCategories(categoriesCache);
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке категорий');
        }
        
        const data = await response.json();
        
        // Обновляем кеш
        categoriesCache = data;
        cacheTimestamp = Date.now();
        
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        
        // Если есть старый кеш - используем его
        if (categoriesCache) {
          setCategories(categoriesCache);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Функция для принудительного обновления
  const refetch = async () => {
    categoriesCache = null;
    cacheTimestamp = null;
    setLoading(true);
    
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        categoriesCache = data;
        cacheTimestamp = Date.now();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error refetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch };
}

// Функция для получения категории по slug
export function getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

// Экспортируем кеш для SSR/SSG совместимости
export function getCachedCategories(): Category[] {
  return categoriesCache || [];
}
