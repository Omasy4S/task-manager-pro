'use client';

import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Форма входа в систему
 * Использует Supabase Auth для аутентификации
 */

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      // После успешного входа пользователь будет перенаправлен автоматически
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Вход через Google
   */
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа через Google');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Добро пожаловать
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Войдите в свой аккаунт
        </p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          required
        />

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
          </div>
        )}

        {/* Кнопка входа */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          <LogIn size={20} className="mr-2" />
          Войти
        </Button>
      </form>

      {/* Google OAuth отключен для демо-версии */}
      {/* Для включения настройте Google OAuth в Supabase Dashboard */}

      {/* Ссылка на регистрацию */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Зарегистрироваться
        </button>
      </p>
    </div>
  );
}
