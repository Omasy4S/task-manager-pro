'use client';

import React from 'react';
import { LayoutDashboard, KanbanSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Боковая панель навигации
 * Содержит меню и информацию о пользователе
 */

interface SidebarProps {
  currentPage: 'dashboard' | 'kanban' | 'settings';
  onPageChange: (page: 'dashboard' | 'kanban' | 'settings') => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  // Пункты меню
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban' as const, label: 'Kanban доска', icon: KanbanSquare },
    // { id: 'settings' as const, label: 'Настройки', icon: Settings }, // Скрыто для демо
  ];

  /**
   * Обработчик выхода
   */
  const handleSignOut = async () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      await signOut();
    }
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
          'lg:translate-x-0 lg:static',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              TaskMaster Pro
            </h1>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    // Закрываем sidebar на мобильных после выбора
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Профиль пользователя */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              {/* Аватар */}
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {user?.fullName?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
                </span>
              </div>
              
              {/* Информация */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.fullName || 'Пользователь'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Кнопка выхода */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
