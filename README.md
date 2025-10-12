# 🚀 TaskMaster Pro

Профессиональное веб-приложение для управления задачами с современным стеком технологий.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)

## ✨ Основные возможности

- 📊 **Dashboard с аналитикой** - визуализация статистики и прогресса
- 🎯 **Kanban доска** - drag-and-drop управление задачами
- 🔐 **Аутентификация** - безопасный вход через email или Google
- 🌓 **Темная/светлая тема** - адаптивный дизайн
- 📱 **Responsive дизайн** - работает на всех устройствах
- ⚡ **Real-time обновления** - синхронизация через Supabase
- 🎨 **Современный UI** - красивый интерфейс с анимациями

## 🛠️ Технологический стек

### Core
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизация для надежного кода

### Frontend
- **TailwindCSS** - utility-first CSS фреймворк
- **Framer Motion** - плавные анимации
- **Recharts** - графики и визуализация данных
- **@dnd-kit** - drag-and-drop функциональность

### Backend & Database
- **Supabase** - PostgreSQL база данных + Auth + Real-time
- **React Query** - управление серверным состоянием
- **Zustand** - легкий state management

### UI Components
- Кастомные компоненты: Button, Card, Input, Modal, Badge
- Lucide React - современные иконки
- Адаптивный дизайн с поддержкой темной темы

## 📦 Установка и запуск

### Предварительные требования

- Node.js 18+ (у вас установлена v22.19.0 ✅)
- npm или yarn
- Аккаунт на [Supabase](https://supabase.com)

### Шаг 1: Установка зависимостей

```bash
npm install
```

### Шаг 2: Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в **Settings → API**
3. Скопируйте `Project URL` и `anon public` ключ

### Шаг 3: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```bash
cp .env.local.example .env.local
```

Заполните переменные:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Шаг 4: Создание таблиц в Supabase

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте SQL скрипт из файла `lib/supabase.ts` (переменная `SUPABASE_SETUP_SQL`)
3. Выполните скрипт

Это создаст:
- Таблицу `profiles` для пользователей
- Таблицу `tasks` для задач
- Row Level Security политики
- Триггеры для автоматического обновления

### Шаг 5: Запуск приложения

#### Режим разработки:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

#### Production сборка:
```bash
npm run build
npm start
```

## 📁 Структура проекта

```
task-manager-pro/
├── app/                     # Next.js App Router
├── components/             # React компоненты
│   ├── auth/              # Аутентификация
│   ├── dashboard/         # Dashboard компоненты
│   ├── layout/            # Layout компоненты
│   ├── tasks/             # Компоненты задач
│   └── ui/                # UI компоненты
├── lib/                    # Утилиты и логика
│   ├── constants/         # Константы приложения
│   ├── helpers/           # Вспомогательные функции
│   ├── hooks/             # Custom React hooks
│   ├── supabase.ts        # Supabase клиент
│   ├── store.ts           # Zustand store
│   ├── types.ts           # TypeScript типы
│   └── utils.ts           # Утилиты
└── public/                 # Статические файлы
```

## 🎯 Основные компоненты

### Аутентификация (`lib/hooks/useAuth.ts`)
- Регистрация и вход через email/пароль
- OAuth через Google
- Управление сессией
- Автоматическое создание профиля

### Управление задачами (`lib/hooks/useTasks.ts`)
- CRUD операции с задачами
- Оптимистичные обновления
- Автоматическая синхронизация
- Кэширование через React Query

### State Management (`lib/store.ts`)
- Глобальное состояние через Zustand
- Управление темой
- UI состояние (модалки, sidebar)
- Локальное хранение задач

### Kanban Board (`components/tasks/KanbanBoard.tsx`)
- Drag-and-drop между колонками
- Автоматическое обновление статуса
- Плавные анимации
- Группировка по статусам

## 🎨 Особенности UI/UX

- **Адаптивный дизайн** - от мобильных до десктопов
- **Темная тема** - автоматическое определение системных настроек
- **Анимации** - плавные переходы с Framer Motion
- **Accessibility** - поддержка клавиатуры и screen readers
- **Loading states** - индикаторы загрузки для всех операций
- **Error handling** - понятные сообщения об ошибках

## 🔒 Безопасность

- Row Level Security (RLS) в Supabase
- Защита API ключей через переменные окружения
- Валидация на клиенте и сервере
- Безопасное хранение паролей (bcrypt через Supabase)

## 📈 Производительность

- Server Components для быстрой загрузки
- Code splitting и lazy loading
- Оптимизация изображений через Next.js Image
- Кэширование запросов через React Query
- Минимальный bundle size

## 🚀 Деплой

Приложение можно развернуть на:
- **Vercel** (рекомендуется для Next.js)
- **Netlify**
- **Railway**
- Любой хостинг с поддержкой Node.js

### Деплой на Vercel:
1. Подключите GitHub репозиторий
2. Добавьте переменные окружения
3. Vercel автоматически соберет и задеплоит приложение

## 📝 Лицензия

MIT License - используйте свободно для личных и коммерческих проектов.

---
