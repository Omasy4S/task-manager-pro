'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';

/**
 * Провайдеры для всего приложения
 * Настраивает React Query и инициализирует тему
 */

// Создаем клиент React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Не рефетчить при фокусе окна
      refetchOnWindowFocus: false,
      // Повторять запрос при ошибке
      retry: 1,
      // Время жизни кэша
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const setTheme = useAppStore((state) => state.setTheme);

  /**
   * Инициализация темы при загрузке
   */
  useEffect(() => {
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Если темы нет, используем системную
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
