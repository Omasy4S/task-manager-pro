/**
 * ============================================
 * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ВЫЧИСЛЕНИЙ
 * ============================================
 * Функции для расчета статистики и аналитики
 */

import { Task, DashboardStats } from '../types';

// ============================================
// СТАТИСТИКА ЗАДАЧ
// ============================================

/**
 * Вычисляет статистику по задачам для Dashboard
 */
export function calculateTaskStats(tasks: Task[]): DashboardStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Основные метрики
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  
  // Просроченные задачи
  const overdueTasks = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < now && 
    t.status !== 'done'
  ).length;

  // Задачи за период
  const tasksThisWeek = tasks.filter(t => 
    new Date(t.createdAt) >= weekAgo
  ).length;

  const tasksThisMonth = tasks.filter(t => 
    new Date(t.createdAt) >= monthAgo
  ).length;

  // Процент выполнения
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
}

// ============================================
// ГРУППИРОВКА ЗАДАЧ
// ============================================

/**
 * Группирует задачи по статусу
 */
export function groupTasksByStatus(tasks: Task[]) {
  return {
    todo: tasks.filter(t => t.status === 'todo'),
    inProgress: tasks.filter(t => t.status === 'in-progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };
}

/**
 * Группирует задачи по приоритету
 */
export function groupTasksByPriority(tasks: Task[]) {
  return {
    low: tasks.filter(t => t.priority === 'low'),
    medium: tasks.filter(t => t.priority === 'medium'),
    high: tasks.filter(t => t.priority === 'high'),
    urgent: tasks.filter(t => t.priority === 'urgent'),
  };
}

// ============================================
// ФИЛЬТРАЦИЯ ЗАДАЧ
// ============================================

/**
 * Фильтрует задачи по поисковому запросу
 */
export function filterTasksBySearch(tasks: Task[], searchQuery: string): Task[] {
  if (!searchQuery.trim()) return tasks;
  
  const query = searchQuery.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(query) ||
    task.description?.toLowerCase().includes(query)
  );
}

/**
 * Сортирует задачи по дате создания
 */
export function sortTasksByDate(tasks: Task[], ascending = false): Task[] {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
