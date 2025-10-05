'use client';

import React from 'react';
import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';

/**
 * Верхняя панель приложения
 * Содержит кнопку меню, поиск и действия
 */

export function Header() {
  const { toggleSidebar, setCreateTaskModalOpen, theme, setTheme } = useAppStore();

  /**
   * Переключение темы
   */
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Левая часть: кнопка меню */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Логотип для мобильных */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 lg:hidden">
            TaskMaster
          </h1>
        </div>

        {/* Правая часть: действия */}
        <div className="flex items-center gap-3">
          {/* Переключатель темы */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={theme === 'light' ? 'Темная тема' : 'Светлая тема'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Кнопка создания задачи */}
          <Button
            onClick={() => setCreateTaskModalOpen(true)}
            variant="primary"
            size="md"
          >
            <Plus size={20} className="mr-2" />
            <span className="hidden sm:inline">Создать задачу</span>
            <span className="sm:hidden">Создать</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
