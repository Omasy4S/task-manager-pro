# 📁 Структура проекта

Подробное описание организации кода и архитектуры проекта.

---

## 🗂️ Общая структура

```
task-manager-pro/
├── 📁 .github/              # GitHub конфигурация
│   └── workflows/           # GitHub Actions для автодеплоя
├── 📁 app/                  # Next.js App Router
│   ├── layout.tsx          # Корневой layout
│   ├── page.tsx            # Главная страница
│   ├── providers.tsx       # React Query провайдер
│   └── globals.css         # Глобальные стили
├── 📁 components/          # React компоненты
│   ├── auth/              # Аутентификация
│   ├── dashboard/         # Dashboard компоненты
│   ├── layout/            # Layout компоненты
│   ├── tasks/             # Компоненты задач
│   └── ui/                # UI компоненты
├── 📁 lib/                 # Утилиты и логика
│   ├── constants/         # Константы приложения
│   ├── helpers/           # Вспомогательные функции
│   ├── hooks/             # Custom React hooks
│   ├── store.ts           # Zustand store
│   ├── supabase.ts        # Supabase клиент
│   ├── types.ts           # TypeScript типы
│   └── utils.ts           # Утилиты
├── 📁 public/              # Статические файлы
├── 📄 next.config.mjs      # Next.js конфигурация
├── 📄 package.json         # Зависимости
├── 📄 tailwind.config.ts   # Tailwind конфигурация
└── 📄 tsconfig.json        # TypeScript конфигурация
```

---

## 📂 Детальное описание папок

### `/app` - Next.js App Router

Основные файлы приложения на базе App Router (Next.js 14).

#### `layout.tsx`
- Корневой layout для всего приложения
- Подключает глобальные стили
- Настраивает метаданные

#### `page.tsx`
- Главная страница приложения
- Показывает форму входа/регистрации или основное приложение
- Управляет состоянием аутентификации

#### `providers.tsx`
- Настройка React Query для управления серверным состоянием
- Обертка для всех провайдеров

#### `globals.css`
- Глобальные стили Tailwind CSS
- Кастомные CSS переменные
- Стили для темной темы

---

### `/components` - React компоненты

Все UI компоненты организованы по функциональности.

#### `/auth` - Аутентификация
```
auth/
├── LoginForm.tsx      # Форма входа
└── SignUpForm.tsx     # Форма регистрации
```

**Функции:**
- Email/пароль аутентификация
- OAuth через Google
- Валидация форм
- Обработка ошибок

#### `/dashboard` - Dashboard
```
dashboard/
├── Dashboard.tsx      # Главная панель аналитики
├── StatsCard.tsx      # Карточка статистики
└── TaskChart.tsx      # График задач
```

**Функции:**
- Статистика по задачам
- Графики (статусы, приоритеты)
- Метрики продуктивности

#### `/layout` - Layout компоненты
```
layout/
├── AppLayout.tsx      # Основной layout приложения
├── Header.tsx         # Шапка с навигацией
└── Sidebar.tsx        # Боковая панель
```

**Функции:**
- Навигация между разделами
- Переключение темы
- Профиль пользователя
- Адаптивное меню

#### `/tasks` - Компоненты задач
```
tasks/
├── KanbanBoard.tsx        # Kanban доска
├── TaskCard.tsx           # Карточка задачи
├── SortableTaskCard.tsx   # Перетаскиваемая карточка
└── CreateTaskModal.tsx    # Модалка создания задачи
```

**Функции:**
- Drag-and-drop задач
- CRUD операции
- Фильтрация и сортировка
- Детальный просмотр

#### `/ui` - UI компоненты
```
ui/
├── Button.tsx         # Кнопка
├── Card.tsx           # Карточка
├── Input.tsx          # Поле ввода
├── Modal.tsx          # Модальное окно
└── Badge.tsx          # Бейдж
```

**Особенности:**
- Переиспользуемые компоненты
- Поддержка темной темы
- TypeScript типизация
- Tailwind CSS стили

---

### `/lib` - Логика и утилиты

Вся бизнес-логика и вспомогательные функции.

#### `/constants` - Константы
```
constants/
├── app.ts             # Константы приложения
└── index.ts           # Экспорт констант
```

**Содержит:**
- Статусы задач и их метки
- Приоритеты задач
- Цвета для UI
- Конфигурация приложения
- Сообщения

**Пример использования:**
```typescript
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/constants';

const status = TASK_STATUSES.IN_PROGRESS; // 'in-progress'
const label = TASK_STATUS_LABELS[status]; // 'В работе'
```

#### `/helpers` - Вспомогательные функции
```
helpers/
├── calculations.ts    # Функции для вычислений
└── index.ts           # Экспорт функций
```

**Содержит:**
- `calculateTaskStats()` - вычисление статистики
- `groupTasksByStatus()` - группировка по статусу
- `groupTasksByPriority()` - группировка по приоритету
- `filterTasksBySearch()` - поиск задач
- `sortTasksByDate()` - сортировка

**Пример использования:**
```typescript
import { calculateTaskStats } from '@/lib/helpers';

const stats = calculateTaskStats(tasks);
// { totalTasks, completedTasks, completionRate, ... }
```

#### `/hooks` - Custom React hooks
```
hooks/
├── useAuth.ts         # Хук аутентификации
└── useTasks.ts        # Хук работы с задачами
```

**`useAuth.ts`:**
```typescript
const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();
```

**`useTasks.ts`:**
```typescript
const { data: tasks } = useTasks();
const createTask = useCreateTask();
const updateTask = useUpdateTask();
const deleteTask = useDeleteTask();
```

#### `store.ts` - Zustand Store

Глобальное состояние приложения.

**Структура:**
```typescript
interface AppState {
  // Пользователь
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Задачи
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Тема
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // UI состояние
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Модальные окна
  isCreateTaskModalOpen: boolean;
  setCreateTaskModalOpen: (isOpen: boolean) => void;
  
  // Выбранная задача
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}
```

**Использование:**
```typescript
const tasks = useAppStore((state) => state.tasks);
const setTheme = useAppStore((state) => state.setTheme);
```

#### `supabase.ts` - Supabase клиент

Конфигурация и SQL скрипты для Supabase.

**Содержит:**
- Клиент Supabase
- SQL скрипт для создания таблиц
- Настройки аутентификации

#### `types.ts` - TypeScript типы

Все типы данных приложения.

**Основные типы:**
```typescript
type Priority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "todo" | "in-progress" | "review" | "done";
type Theme = "light" | "dark" | "system";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
  tags?: string[];
  order: number;
}

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksThisWeek: number;
  tasksThisMonth: number;
}
```

#### `utils.ts` - Утилиты

Общие вспомогательные функции.

**Функции:**
- `cn()` - объединение Tailwind классов
- `formatDate()` - форматирование даты
- `getRelativeTime()` - относительное время
- `generateId()` - генерация ID
- `getInitials()` - получение инициалов

---

## 🎨 Принципы организации кода

### 1. Разделение по функциональности
Каждая папка содержит связанные компоненты и логику.

### 2. Централизация констант
Все константы в одном месте для легкого изменения.

### 3. Переиспользуемость
UI компоненты максимально универсальны.

### 4. Типобезопасность
Все данные типизированы с TypeScript.

### 5. Комментарии-разделители
Код разделен на логические блоки с заголовками:
```typescript
// ============================================
// НАЗВАНИЕ БЛОКА
// ============================================
```

---

## 📝 Соглашения по коду

### Именование файлов
- Компоненты: `PascalCase.tsx`
- Утилиты: `camelCase.ts`
- Константы: `camelCase.ts`
- Типы: `camelCase.ts`

### Именование переменных
- Компоненты: `PascalCase`
- Функции: `camelCase`
- Константы: `UPPER_SNAKE_CASE`
- Типы: `PascalCase`

### Структура компонента
```typescript
// Импорты
import React from 'react';

// Типы
interface Props {
  // ...
}

// Компонент
export function ComponentName({ props }: Props) {
  // Состояние
  const [state, setState] = useState();
  
  // Эффекты
  useEffect(() => {
    // ...
  }, []);
  
  // Обработчики
  const handleClick = () => {
    // ...
  };
  
  // Вычисления
  const computed = useMemo(() => {
    // ...
  }, []);
  
  // Рендер
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 🔄 Поток данных

```
User Action
    ↓
Component
    ↓
Hook (useAuth, useTasks)
    ↓
Supabase Client
    ↓
Database
    ↓
React Query Cache
    ↓
Zustand Store
    ↓
Component Re-render
```

---

## 🚀 Оптимизации

### 1. Code Splitting
- Автоматическое разделение кода Next.js
- Lazy loading компонентов

### 2. Мемоизация
- `useMemo` для вычислений
- `useCallback` для функций
- React.memo для компонентов

### 3. Кэширование
- React Query для серверных данных
- LocalStorage для темы

### 4. Оптимизация изображений
- Next.js Image компонент
- Unoptimized для статического экспорта

---

## 📚 Дополнительные файлы

### `.github/workflows/deploy.yml`
GitHub Actions workflow для автоматического деплоя на GitHub Pages.

### `GITHUB_PAGES_DEPLOY.md`
Подробная инструкция по деплою проекта.

### `PROJECT_SUMMARY.md`
Краткое описание проекта и технологий.

### `QUICK_START.md`
Быстрый старт для разработчиков.

---

## 💡 Советы по разработке

1. **Используйте константы** вместо хардкода
2. **Выносите логику** в helpers и hooks
3. **Типизируйте все** с TypeScript
4. **Комментируйте сложные участки** кода
5. **Следуйте структуре** проекта при добавлении новых файлов

---

**Структура проекта оптимизирована для:**
- ✅ Легкого понимания
- ✅ Быстрой разработки
- ✅ Простого масштабирования
- ✅ Удобного тестирования
- ✅ Эффективного деплоя
