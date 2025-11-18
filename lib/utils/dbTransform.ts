/**
 * Утилиты для преобразования данных между БД (snake_case) и приложением (camelCase)
 * Устраняет дублирование кода в hooks/useTasks.ts
 */

import { Task } from '../types';

/**
 * Преобразует задачу из формата БД (snake_case) в формат приложения (camelCase)
 */
export function taskFromDB(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status,
    priority: dbTask.priority,
    dueDate: dbTask.due_date,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
    userId: dbTask.user_id,
    assignedTo: dbTask.assigned_to,
    tags: dbTask.tags,
    order: dbTask.order,
  };
}

/**
 * Преобразует задачу из формата приложения (camelCase) в формат БД (snake_case)
 */
export function taskToDB(task: Partial<Task>): any {
  const dbTask: any = {};
  
  if (task.title !== undefined) dbTask.title = task.title;
  if (task.description !== undefined) dbTask.description = task.description;
  if (task.status !== undefined) dbTask.status = task.status;
  if (task.priority !== undefined) dbTask.priority = task.priority;
  if (task.dueDate !== undefined) dbTask.due_date = task.dueDate;
  if (task.userId !== undefined) dbTask.user_id = task.userId;
  if (task.assignedTo !== undefined) dbTask.assigned_to = task.assignedTo;
  if (task.tags !== undefined) dbTask.tags = task.tags;
  if (task.order !== undefined) dbTask.order = task.order;
  
  return dbTask;
}

/**
 * Преобразует массив задач из БД
 */
export function tasksFromDB(dbTasks: any[]): Task[] {
  return dbTasks.map(taskFromDB);
}
