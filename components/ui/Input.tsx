import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Компонент текстового поля ввода
 * Поддерживает различные типы и состояния
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode; // Иконка слева
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Иконка слева */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2 rounded-lg border transition-colors',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // Стили в зависимости от состояния
              error
                ? 'border-danger-500 focus:ring-danger-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500',
              icon && 'pl-10', // Отступ для иконки
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
