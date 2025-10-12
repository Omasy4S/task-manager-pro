'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';

/**
 * Главная страница приложения
 * Показывает форму входа/регистрации или основное приложение
 */

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем задачи если пользователь авторизован
  useTasks();

  /**
   * Проверяем аутентификацию при загрузке
   */
  useEffect(() => {
    // Убираем искусственную задержку - проверяем сразу
    setIsLoading(false);
  }, []);

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь авторизован, показываем приложение
  if (isAuthenticated) {
    return <AppLayout />;
  }

  // Если не авторизован, показываем форму входа/регистрации
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Анимированная карточка */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-slide-up">
          {showSignUp ? (
            <SignUpForm onSwitchToLogin={() => setShowSignUp(false)} />
          ) : (
            <LoginForm onSwitchToSignUp={() => setShowSignUp(true)} />
          )}
        </div>

        {/* Футер */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 TaskMaster Pro. Профессиональное управление задачами.
        </p>
      </div>
    </div>
  );
}
