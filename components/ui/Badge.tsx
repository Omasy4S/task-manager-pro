import React from 'react';
import { cn } from '@/lib/utils';
import { Priority, TaskStatus } from '@/lib/types';

/**
 * Компонент Badge (бейдж/метка)
 * Используется для отображения статусов, приоритетов и тегов
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}

/**
 * Специальный Badge для приоритетов задач
 */
interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    low: { label: 'Низкий', variant: 'default' as const },
    medium: { label: 'Средний', variant: 'primary' as const },
    high: { label: 'Высокий', variant: 'warning' as const },
    urgent: { label: 'Срочно', variant: 'danger' as const },
  };

  const { label, variant } = config[priority];

  return <Badge variant={variant}>{label}</Badge>;
}

/**
 * Специальный Badge для статусов задач
 */
interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    'todo': { label: 'К выполнению', variant: 'default' as const },
    'in-progress': { label: 'В работе', variant: 'primary' as const },
    'review': { label: 'На проверке', variant: 'warning' as const },
    'done': { label: 'Выполнено', variant: 'success' as const },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
