import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { useAppStore } from '../store';
import { logger } from '../logger';
import { trackDatabaseQuery, measureExecutionTime } from '../metrics';
import { DatabaseError, ErrorHandler } from '../errors';
import { tasksFromDB, taskFromDB, taskToDB } from '../utils/dbTransform';

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

          // Преобразуем из формата БД (утилита для устранения дублирования кода)
          const tasks = tasksFromDB(data || []);

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

      // Преобразуем в формат БД
      const dbInput = taskToDB({ ...input, userId: user.id });
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbInput)
        .select()
        .single();

      if (error) throw error;

      // Преобразуем из формата БД
      return taskFromDB(data);
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
      // Преобразуем в формат БД
      const dbUpdates = taskToDB(updates);

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Преобразуем из формата БД
      return taskFromDB(data);
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
