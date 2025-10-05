'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { SortableTaskCard } from './SortableTaskCard';
import { Task, TaskStatus } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { useUpdateTask } from '@/lib/hooks/useTasks';

/**
 * Kanban доска с drag-and-drop функциональностью
 * Использует @dnd-kit для перетаскивания задач между колонками
 */

// Конфигурация колонок
const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'К выполнению', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in-progress', title: 'В работе', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'review', title: 'На проверке', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'done', title: 'Выполнено', color: 'bg-green-100 dark:bg-green-900/30' },
];

export function KanbanBoard() {
  const tasks = useAppStore((state) => state.tasks);
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  /**
   * Настройка сенсоров для drag-and-drop
   * PointerSensor позволяет использовать мышь и тач
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Минимальное расстояние для начала перетаскивания
      },
    })
  );

  /**
   * Обработчик начала перетаскивания
   */
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  /**
   * Обработчик окончания перетаскивания
   * Обновляет статус задачи в БД
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Находим задачу
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) {
      setActiveTask(null);
      return;
    }

    // Обновляем статус задачи
    try {
      await updateTask.mutateAsync({
        id: taskId,
        status: newStatus,
      });
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
    }

    setActiveTask(null);
  };

  /**
   * Группировка задач по статусам
   */
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': [],
    };

    tasks.forEach((task) => {
      // Проверяем, что статус задачи валидный
      if (task.status && grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Сортируем по order
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [tasks]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
          />
        ))}
      </div>

      {/* Overlay для перетаскиваемой задачи */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-80 rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Компонент колонки Kanban доски
 */
interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
}

function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  // Делаем колонку droppable зоной
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <SortableContext
      id={column.id}
      items={tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="flex flex-col h-full">
        {/* Заголовок колонки */}
        <div className={`${column.color} rounded-lg p-4 mb-4 transition-all ${
          isOver ? 'ring-2 ring-primary-500 ring-offset-2' : ''
        }`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {column.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {tasks.length} {tasks.length === 1 ? 'задача' : 'задач'}
          </p>
        </div>

        {/* Список задач */}
        <div className="flex-1 space-y-3 min-h-[200px]">
          {tasks.length === 0 ? (
            <div className={`flex items-center justify-center h-32 border-2 border-dashed rounded-lg transition-colors ${
              isOver 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isOver ? 'Отпустите здесь' : 'Нет задач'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    </SortableContext>
  );
}
