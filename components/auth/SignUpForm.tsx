'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Форма регистрации нового пользователя
 */

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Валидация пароля
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем сообщение об успешной регистрации
  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-success-600 dark:text-success-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Регистрация успешна!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Проверьте вашу почту для подтверждения аккаунта.
          </p>
          <Button
            onClick={onSwitchToLogin}
            variant="primary"
            className="mt-6"
          >
            Перейти ко входу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Создать аккаунт
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Начните управлять задачами эффективно
        </p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Имя */}
        <Input
          type="text"
          label="Полное имя"
          placeholder="Иван Иванов"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User size={20} />}
          required
        />

        {/* Email */}
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={20} />}
          required
        />

        {/* Пароль */}
        <Input
          type="password"
          label="Пароль"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={20} />}
          helperText="Минимум 6 символов"
          required
        />

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
          </div>
        )}

        {/* Кнопка регистрации */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          <UserPlus size={20} className="mr-2" />
          Зарегистрироваться
        </Button>
      </form>

      {/* Ссылка на вход */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Войти
        </button>
      </p>
    </div>
  );
}
