import { create } from 'zustand';
import { Task, User, Theme } from './types';

/**
 * ============================================
 * ZUSTAND STORE - ГЛОБАЛЬНОЕ СОСТОЯНИЕ
 * ============================================
 * Легкий state management для React
 * Альтернатива Redux с минимальным boilerplate
 */

// ============================================
// ИНТЕРФЕЙС СОСТОЯНИЯ
// ============================================
interface AppState {
  // --- Пользователь ---
  user: User | null;
  setUser: (user: User | null) => void;
  
  // --- Задачи ---
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // --- Тема ---
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // --- UI состояние ---
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // --- Модальные окна ---
  isCreateTaskModalOpen: boolean;
  setCreateTaskModalOpen: (isOpen: boolean) => void;
  
  // --- Выбранная задача ---
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

// ============================================
// СОЗДАНИЕ STORE
// ============================================
export const useAppStore = create<AppState>((set) => ({
  // --- Начальное состояние ---
  user: null,
  tasks: [],
  theme: 'light',
  isSidebarOpen: true,
  isCreateTaskModalOpen: false,
  selectedTask: null,

  // ============================================
  // ACTIONS - ПОЛЬЗОВАТЕЛЬ
  // ============================================
  
  /**
   * Устанавливает текущего пользователя
   */
  setUser: (user) => set({ user }),

  // ============================================
  // ACTIONS - ЗАДАЧИ
  // ============================================
  
  /**
   * Устанавливает все задачи (после загрузки из БД)
   */
  setTasks: (tasks) => set({ tasks }),

  /**
   * Добавляет новую задачу
   */
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
  })),

  /**
   * Обновляет задачу по ID
   */
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),

  /**
   * Удаляет задачу по ID
   */
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  // ============================================
  // ACTIONS - ТЕМА
  // ============================================
  
  /**
   * Переключает тему приложения
   */
  setTheme: (theme) => {
    // Сохраняем тему в localStorage для персистентности
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      
      // Применяем класс 'dark' к документу
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // Для 'system' проверяем системные настройки
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
    
    set({ theme });
  },

  // ============================================
  // ACTIONS - UI
  // ============================================
  
  /**
   * Переключает видимость боковой панели
   */
  toggleSidebar: () => set((state) => ({
    isSidebarOpen: !state.isSidebarOpen,
  })),

  // ============================================
  // ACTIONS - МОДАЛЬНЫЕ ОКНА
  // ============================================
  
  /**
   * Открывает/закрывает модальное окно создания задачи
   */
  setCreateTaskModalOpen: (isOpen) => set({
    isCreateTaskModalOpen: isOpen,
  }),

  /**
   * Устанавливает выбранную задачу для редактирования
   */
  setSelectedTask: (task) => set({
    selectedTask: task,
  }),
}));
