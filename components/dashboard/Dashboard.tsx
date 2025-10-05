'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { TaskChart } from './TaskChart';
import { useAppStore } from '@/lib/store';
import { DashboardStats } from '@/lib/types';

/**
 * Главный Dashboard с аналитикой и статистикой
 * Показывает обзор всех задач, графики и метрики
 */

export function Dashboard() {
  const tasks = useAppStore((state) => state.tasks);

  /**
   * Вычисляем статистику на основе задач
   */
  const stats: DashboardStats = React.useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'done'
    ).length;

    const tasksThisWeek = tasks.filter(t => 
      new Date(t.createdAt) >= weekAgo
    ).length;

    const tasksThisMonth = tasks.filter(t => 
      new Date(t.createdAt) >= monthAgo
    ).length;

    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      tasksThisWeek,
      tasksThisMonth,
    };
  }, [tasks]);

  /**
   * Данные для графика по статусам
   */
  const statusChartData = React.useMemo(() => {
    return [
      { 
        name: 'К выполнению', 
        value: tasks.filter(t => t.status === 'todo').length,
        color: '#94a3b8'
      },
      { 
        name: 'В работе', 
        value: tasks.filter(t => t.status === 'in-progress').length,
        color: '#3b82f6'
      },
      { 
        name: 'На проверке', 
        value: tasks.filter(t => t.status === 'review').length,
        color: '#f59e0b'
      },
      { 
        name: 'Выполнено', 
        value: tasks.filter(t => t.status === 'done').length,
        color: '#22c55e'
      },
    ];
  }, [tasks]);

  /**
   * Данные для графика по приоритетам
   */
  const priorityChartData = React.useMemo(() => {
    return [
      { 
        name: 'Низкий', 
        value: tasks.filter(t => t.priority === 'low').length,
        color: '#94a3b8'
      },
      { 
        name: 'Средний', 
        value: tasks.filter(t => t.priority === 'medium').length,
        color: '#3b82f6'
      },
      { 
        name: 'Высокий', 
        value: tasks.filter(t => t.priority === 'high').length,
        color: '#f59e0b'
      },
      { 
        name: 'Срочно', 
        value: tasks.filter(t => t.priority === 'urgent').length,
        color: '#ef4444'
      },
    ];
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Обзор ваших задач и продуктивности
        </p>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Всего задач"
          value={stats.totalTasks}
          icon={Calendar}
          color="blue"
          trend={{
            value: stats.tasksThisWeek,
            isPositive: stats.tasksThisWeek > 0,
          }}
        />
        
        <StatsCard
          title="Выполнено"
          value={stats.completedTasks}
          icon={CheckCircle2}
          color="green"
          trend={{
            value: stats.completionRate,
            isPositive: stats.completionRate >= 50,
          }}
        />
        
        <StatsCard
          title="В работе"
          value={stats.inProgressTasks}
          icon={Clock}
          color="yellow"
        />
        
        <StatsCard
          title="Просрочено"
          value={stats.overdueTasks}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskChart
          title="Задачи по статусам"
          data={statusChartData}
        />
        
        <TaskChart
          title="Задачи по приоритетам"
          data={priorityChartData}
        />
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <TrendingUp className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Процент выполнения
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                За эту неделю
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.tasksThisWeek}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                За этот месяц
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.tasksThisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
