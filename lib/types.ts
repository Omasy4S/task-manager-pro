/**
 * Типы данных для всего приложения
 * TypeScript помогает избежать ошибок и делает код более понятным
 */

// Приоритеты задач
export type Priority = "low" | "medium" | "high" | "urgent";

// Статусы задач для Kanban доски
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Основной тип задачи
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO формат даты
  createdAt: string;
  updatedAt: string;
  userId: string; // ID пользователя, который создал задачу
  assignedTo?: string; // ID пользователя, которому назначена задача
  tags?: string[]; // Теги для категоризации
  order: number; // Порядок сортировки в колонке
}

// Тип пользователя
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

// Статистика для дашборда
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number; // Процент выполненных задач
  tasksThisWeek: number;
  tasksThisMonth: number;
}

// Данные для графиков
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Настройки темы
export type Theme = "light" | "dark" | "system";

// Фильтры для задач
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Тип для создания новой задачи (без автогенерируемых полей)
export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">;

// Тип для обновления задачи (все поля опциональны кроме id)
export type UpdateTaskInput = Partial<Omit<Task, "id">> & { id: string };
