'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/useTasks';
import { Priority, TaskStatus } from '@/lib/types';

/**
 * Модальное окно для создания/редактирования задачи
 */

export function CreateTaskModal() {
  const { isCreateTaskModalOpen, setCreateTaskModalOpen, selectedTask, setSelectedTask } = useAppStore();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // Состояние формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Режим редактирования
  const isEditMode = !!selectedTask;

  /**
   * Заполняем форму при редактировании
   */
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setPriority(selectedTask.priority);
      setStatus(selectedTask.status);
      setDueDate(selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : '');
      setTags(selectedTask.tags?.join(', ') || '');
    }
  }, [selectedTask]);

  /**
   * Сброс формы
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setTags('');
    setError('');
  };

  /**
   * Закрытие модалки
   */
  const handleClose = () => {
    setCreateTaskModalOpen(false);
    setSelectedTask(null);
    resetForm();
  };

  /**
   * Отправка формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Парсим теги
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (isEditMode && selectedTask) {
        // Обновление существующей задачи
        await updateTask.mutateAsync({
          id: selectedTask.id,
          title,
          description,
          priority,
          status,
          dueDate: dueDate || undefined,
          tags: tagArray.length > 0 ? tagArray : undefined,
        });
      } else {
        // Создание новой задачи
        await createTask.mutateAsync({
          title,
          description,
          priority,
          status,
          dueDate: dueDate || undefined,
          tags: tagArray.length > 0 ? tagArray : undefined,
          order: 0, // Будет установлен автоматически
        });
      }

      handleClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении задачи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateTaskModalOpen || isEditMode}
      onClose={handleClose}
      title={isEditMode ? 'Редактировать задачу' : 'Создать новую задачу'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Название */}
        <Input
          label="Название задачи"
          placeholder="Например: Разработать новую фичу"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Описание
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={4}
            placeholder="Подробное описание задачи..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Приоритет и Статус */}
        <div className="grid grid-cols-2 gap-4">
          {/* Приоритет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Приоритет
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочно</option>
            </select>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Статус
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="todo">К выполнению</option>
              <option value="in-progress">В работе</option>
              <option value="review">На проверке</option>
              <option value="done">Выполнено</option>
            </select>
          </div>
        </div>

        {/* Дата выполнения */}
        <Input
          type="date"
          label="Дата выполнения"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Теги */}
        <Input
          label="Теги"
          placeholder="frontend, urgent, bug (через запятую)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          helperText="Разделяйте теги запятыми"
        />

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            {isEditMode ? 'Сохранить' : 'Создать задачу'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
