'use client';

import React from 'react';
import { Calendar, Clock, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { PriorityBadge, Badge } from '@/components/ui/Badge';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useDeleteTask } from '@/lib/hooks/useTasks';

/**
 * Карточка задачи для Kanban доски
 * Показывает информацию о задаче и позволяет редактировать/удалять
 */

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const setSelectedTask = useAppStore((state) => state.setSelectedTask);
  const deleteTask = useDeleteTask();
  const [showMenu, setShowMenu] = React.useState(false);

  /**
   * Открыть задачу для редактирования
   */
  const handleEdit = () => {
    setSelectedTask(task);
    setShowMenu(false);
  };

  /**
   * Удалить задачу
   */
  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await deleteTask.mutateAsync(task.id);
    }
    setShowMenu(false);
  };

  /**
   * Проверка, просрочена ли задача
   */
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card hover className="relative group">
      <div className="p-4 space-y-3">
        {/* Заголовок с меню */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {task.title}
          </h3>
          
          {/* Меню действий */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>

            {/* Dropdown меню */}
            {showMenu && (
              <>
                {/* Overlay для закрытия меню */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Меню */}
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 focus:outline-none"
                  >
                    <Edit size={16} />
                    Редактировать
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex items-center gap-2 focus:outline-none"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Описание */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Приоритет */}
        <div>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Теги */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} size="sm" variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Дата выполнения */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-sm ${
            isOverdue 
              ? 'text-danger-600 dark:text-danger-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            <Calendar size={14} />
            <span>{formatDate(task.dueDate)}</span>
            {isOverdue && (
              <span className="ml-1 text-xs font-medium">(Просрочено)</span>
            )}
          </div>
        )}

        {/* Время создания */}
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} />
          <span>{getRelativeTime(task.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
