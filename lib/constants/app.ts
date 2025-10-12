/**
 * ============================================
 * КОНСТАНТЫ ПРИЛОЖЕНИЯ
 * ============================================
 * Централизованное хранение всех констант
 */

// ============================================
// ОСНОВНАЯ ИНФОРМАЦИЯ
// ============================================
export const APP_CONFIG = {
  name: 'TaskMaster Pro',
  description: 'Профессиональное управление задачами',
  version: '1.0.0',
  author: 'Your Name',
} as const;

// ============================================
// СТАТУСЫ ЗАДАЧ
// ============================================
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
} as const;

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.TODO]: 'К выполнению',
  [TASK_STATUSES.IN_PROGRESS]: 'В работе',
  [TASK_STATUSES.REVIEW]: 'На проверке',
  [TASK_STATUSES.DONE]: 'Выполнено',
} as const;

export const TASK_STATUS_COLORS = {
  [TASK_STATUSES.TODO]: '#94a3b8',
  [TASK_STATUSES.IN_PROGRESS]: '#3b82f6',
  [TASK_STATUSES.REVIEW]: '#f59e0b',
  [TASK_STATUSES.DONE]: '#22c55e',
} as const;

// ============================================
// ПРИОРИТЕТЫ ЗАДАЧ
// ============================================
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITIES.LOW]: 'Низкий',
  [TASK_PRIORITIES.MEDIUM]: 'Средний',
  [TASK_PRIORITIES.HIGH]: 'Высокий',
  [TASK_PRIORITIES.URGENT]: 'Срочно',
} as const;

export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: '#94a3b8',
  [TASK_PRIORITIES.MEDIUM]: '#3b82f6',
  [TASK_PRIORITIES.HIGH]: '#f59e0b',
  [TASK_PRIORITIES.URGENT]: '#ef4444',
} as const;

// ============================================
// НАСТРОЙКИ UI
// ============================================
export const UI_CONFIG = {
  // Интервалы обновления (в миллисекундах)
  refetchInterval: 30000, // 30 секунд
  
  // Задержки анимаций
  loadingDelay: 500,
  
  // Размеры
  sidebarWidth: 256,
  headerHeight: 64,
} as const;

// ============================================
// ТЕМЫ
// ============================================
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// ============================================
// СООБЩЕНИЯ
// ============================================
export const MESSAGES = {
  // Успех
  taskCreated: 'Задача успешно создана',
  taskUpdated: 'Задача обновлена',
  taskDeleted: 'Задача удалена',
  
  // Ошибки
  authRequired: 'Необходима авторизация',
  networkError: 'Ошибка сети. Проверьте подключение',
  unknownError: 'Произошла неизвестная ошибка',
  
  // Загрузка
  loading: 'Загрузка...',
} as const;
