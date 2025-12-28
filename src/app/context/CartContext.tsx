'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { CartItem } from '../types/types';

// Тип для корзины
interface Cart {
  items: CartItem[];
}

// Тип контекста корзины
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'stroydom_cart';

// Генерация уникального ключа для элемента корзины
function getCartItemKey(productId: string, size?: string): string {
  return size ? `${productId}_${size}` : `${productId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // Загрузка корзины из localStorage при монтировании
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as Cart;
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    setIsHydrated(true);
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [cart, isHydrated]);

  // Добавление товара в корзину
  const addItem = useCallback((item: CartItem) => {
    setCart((prevCart: Cart) => {
      const itemKey = getCartItemKey(item.productId, item.size);
      const existingIndex = prevCart.items.findIndex(
        (cartItem: CartItem) => getCartItemKey(cartItem.productId, cartItem.size) === itemKey
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Увеличиваем количество существующего товара
        newItems = prevCart.items.map((cartItem: CartItem, index: number) => {
          if (index === existingIndex) {
            return { ...cartItem, quantity: cartItem.quantity + item.quantity };
          }
          return cartItem;
        });
      } else {
        // Добавляем новый товар
        newItems = [...prevCart.items, item];
      }

      return { items: newItems };
    });
  }, []);

  // Удаление товара из корзины
  const removeItem = useCallback((productId: string, size?: string) => {
    setCart((prevCart: Cart) => {
      const itemKey = getCartItemKey(productId, size);
      const newItems = prevCart.items.filter(
        (item: CartItem) => getCartItemKey(item.productId, item.size) !== itemKey
      );
      return { items: newItems };
    });
  }, []);

  // Обновление количества товара
  const updateQuantity = useCallback((productId: string, size: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setCart((prevCart: Cart) => {
      const itemKey = getCartItemKey(productId, size);
      const newItems = prevCart.items.map((item: CartItem) => {
        if (getCartItemKey(item.productId, item.size) === itemKey) {
          return { ...item, quantity };
        }
        return item;
      });
      return { items: newItems };
    });
  }, [removeItem]);

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCart({ items: [] });
  }, []);

  // Общее количество товаров
  const totalItems = cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Общая сумма
  const totalAmount = cart.items.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items: cart.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
