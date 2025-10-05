'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

/**
 * Главный Layout приложения
 * Управляет навигацией между страницами и общей структурой
 */

export function AppLayout() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'kanban' | 'settings'>('dashboard');

  /**
   * Рендер текущей страницы
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Kanban доска
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Управляйте задачами с помощью перетаскивания
              </p>
            </div>
            <KanbanBoard />
          </div>
        );
      case 'settings':
        return (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Настройки
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Раздел в разработке...
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Контент страницы */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Модальное окно создания задачи */}
      <CreateTaskModal />
    </div>
  );
}
