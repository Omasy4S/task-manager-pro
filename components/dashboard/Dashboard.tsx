'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { TaskChart } from './TaskChart';
import { useAppStore } from '@/lib/store';
import { calculateTaskStats } from '@/lib/helpers';
import { 
  TASK_STATUS_LABELS, 
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS 
} from '@/lib/constants';

/**
 * ============================================
 * DASHBOARD - ГЛАВНАЯ ПАНЕЛЬ АНАЛИТИКИ
 * ============================================
 * Показывает статистику, графики и метрики
 */

export function Dashboard() {
  const tasks = useAppStore((state) => state.tasks);

  // ============================================
  // ВЫЧИСЛЕНИЕ СТАТИСТИКИ
  // ============================================
  
  const stats = React.useMemo(() => calculateTaskStats(tasks), [tasks]);

  // ============================================
  // ДАННЫЕ ДЛЯ ГРАФИКОВ
  // ============================================
  
  /**
   * График по статусам задач
   */
  const statusChartData = React.useMemo(() => {
    return [
      { 
        name: TASK_STATUS_LABELS.todo, 
        value: tasks.filter(t => t.status === 'todo').length,
        color: TASK_STATUS_COLORS.todo
      },
      { 
        name: TASK_STATUS_LABELS['in-progress'], 
        value: tasks.filter(t => t.status === 'in-progress').length,
        color: TASK_STATUS_COLORS['in-progress']
      },
      { 
        name: TASK_STATUS_LABELS.review, 
        value: tasks.filter(t => t.status === 'review').length,
        color: TASK_STATUS_COLORS.review
      },
      { 
        name: TASK_STATUS_LABELS.done, 
        value: tasks.filter(t => t.status === 'done').length,
        color: TASK_STATUS_COLORS.done
      },
    ];
  }, [tasks]);

  /**
   * График по приоритетам задач
   */
  const priorityChartData = React.useMemo(() => {
    return [
      { 
        name: TASK_PRIORITY_LABELS.low, 
        value: tasks.filter(t => t.priority === 'low').length,
        color: TASK_PRIORITY_COLORS.low
      },
      { 
        name: TASK_PRIORITY_LABELS.medium, 
        value: tasks.filter(t => t.priority === 'medium').length,
        color: TASK_PRIORITY_COLORS.medium
      },
      { 
        name: TASK_PRIORITY_LABELS.high, 
        value: tasks.filter(t => t.priority === 'high').length,
        color: TASK_PRIORITY_COLORS.high
      },
      { 
        name: TASK_PRIORITY_LABELS.urgent, 
        value: tasks.filter(t => t.priority === 'urgent').length,
        color: TASK_PRIORITY_COLORS.urgent
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
