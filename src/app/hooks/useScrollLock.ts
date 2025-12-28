import { useEffect } from 'react';

/**
 * Hook для блокировки скролла при открытии модального окна
 * Правильно работает на iOS и других браузерах
 * Сохраняет позицию скролла при закрытии модалки
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) return;

        // Сохраняем текущую позицию скролла
        const scrollY = window.scrollY || window.pageYOffset;
        
        // Блокируем скролл
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overscrollBehavior = 'none';
        
        // Сохраняем позицию в dataset для восстановления
        document.body.dataset.scrollY = String(scrollY);

        return () => {
            // Разблокируем скролл
            document.body.style.overflow = '';
            document.documentElement.style.overscrollBehavior = '';
            
            // Восстанавливаем позицию скролла
            const savedScrollY = parseInt(document.body.dataset.scrollY || '0', 10);
            window.scrollTo(0, savedScrollY);
            
            // Очищаем dataset
            delete document.body.dataset.scrollY;
        };
    }, [isLocked]);
};
