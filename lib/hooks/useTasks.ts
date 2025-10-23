import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { useAppStore } from '../store';
import { logger } from '../logger';
import { trackDatabaseQuery, measureExecutionTime } from '../metrics';
import { DatabaseError, ErrorHandler } from '../errors';

/**
 * Custom Hook для работы с задачами
 * Использует React Query для кэширования и автоматического обновления данных
 */

/**
 * Получение всех задач текущего пользователя
 */
export function useTasks() {
  const user = useAppStore((state) => state.user);
  const setTasks = useAppStore((state) => state.setTasks);

  return useQuery({
    // Уникальный ключ для кэша
    queryKey: ['tasks', user?.id],
    // Функция для получения данных
    queryFn: async () => {
      if (!user) return [];

      return measureExecutionTime('fetch_tasks', async () => {
        const startTime = performance.now();

        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('order', { ascending: true });

          const duration = Math.round(performance.now() - startTime);

          if (error) {
            trackDatabaseQuery('SELECT', 'tasks', duration, false);
            logger.error('Failed to fetch tasks', error, { userId: user.id });
            throw new DatabaseError('Failed to load tasks');
          }

          trackDatabaseQuery('SELECT', 'tasks', duration, true);

          // Преобразуем snake_case из БД в camelCase для TypeScript
          const tasks: Task[] = (data || []).map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            userId: task.user_id,
            assignedTo: task.assigned_to,
            tags: task.tags,
            order: task.order,
          }));

          // Обновляем store
          setTasks(tasks);
          
          logger.debug('Tasks fetched successfully', {
            userId: user.id,
            count: tasks.length,
            duration,
          });

          return tasks;
        } catch (error) {
          throw ErrorHandler.handle(error, { operation: 'fetchTasks', userId: user.id });
        }
      }, { userId: user.id });
    },
    // Включаем запрос только если пользователь авторизован
    enabled: !!user,
    // Обновлять данные каждые 30 секунд
    refetchInterval: 30000,
    // Retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Создание новой задачи
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const addTask = useAppStore((state) => state.addTask);

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error('Пользователь не авторизован');

      // Преобразуем camelCase в snake_case для БД
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          due_date: input.dueDate,
          user_id: user.id,
          assigned_to: input.assignedTo,
          tags: input.tags,
          order: input.order,
        })
        .select()
        .single();

      if (error) throw error;

      // Преобразуем обратно в camelCase
      const task: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.due_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        assignedTo: data.assigned_to,
        tags: data.tags,
        order: data.order,
      };

      return task;
    },
    // После успешного создания
    onSuccess: (task) => {
      // Добавляем в store
      addTask(task);
      // Инвалидируем кэш для обновления списка
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Обновление существующей задачи
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const updateTaskInStore = useAppStore((state) => state.updateTask);

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput) => {
      // Преобразуем camelCase в snake_case
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Преобразуем обратно в camelCase
      const task: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.due_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        assignedTo: data.assigned_to,
        tags: data.tags,
        order: data.order,
      };

      return task;
    },
    // Оптимистичное обновление (обновляем UI сразу, не дожидаясь ответа сервера)
    onMutate: async (updates) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Обновляем store сразу
      updateTaskInStore(updates.id, updates);
    },
    onSuccess: () => {
      // Инвалидируем кэш для синхронизации
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Удаление задачи
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const deleteTaskFromStore = useAppStore((state) => state.deleteTask);

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: (_, taskId) => {
      // Удаляем из store
      deleteTaskFromStore(taskId);
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
