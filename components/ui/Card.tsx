import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Компонент карточки для группировки контента
 * Используется для задач, статистики и других блоков информации
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean; // Эффект при наведении
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        hover && 'transition-all hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Заголовок карточки
 */
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}

/**
 * Тело карточки
 */
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

/**
 * Футер карточки
 */
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50', className)}>
      {children}
    </div>
  );
}
