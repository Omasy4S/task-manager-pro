'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

/**
 * Карточка статистики для Dashboard
 * Показывает числовые метрики с иконкой и процентным изменением
 */

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number; // Процент изменения
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export function StatsCard({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
  // Цвета для разных типов карточек
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          {/* Левая часть: иконка и текст */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            
            {/* Тренд (изменение в процентах) */}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span className={`text-sm font-medium ${
                  trend.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  за неделю
                </span>
              </div>
            )}
          </div>

          {/* Правая часть: иконка */}
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
