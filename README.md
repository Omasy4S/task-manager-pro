# 🚀 TaskMaster Pro

Профессиональное приложение для управления задачами с современным стеком технологий.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)

[![📸 Посмотреть скриншоты](https://img.shields.io/badge/📸_Скриншоты_приложения-FF6B6B?style=for-the-badge&logo=image&logoColor=white)](https://imgur.com/a/3MY3dTp)

## ✨ Основные возможности

- 📊 **Dashboard с аналитикой** - визуализация статистики и прогресса
- 🎯 **Kanban доска** - drag-and-drop управление задачами
- 🔐 **Аутентификация** - безопасный вход через email или Google
- 🌓 **Темная/светлая тема** - адаптивный дизайн
- 📱 **Responsive дизайн** - работает на всех устройствах
- ⚡ **Real-time обновления** - синхронизация через Supabase
- 🎨 **Современный UI** - красивый интерфейс с анимациями

## 🛠️ Технологический стек

### Frontend
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизация для надежного кода
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

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
task-manager-pro/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Корневой layout
│   ├── page.tsx             # Главная страница
│   ├── providers.tsx        # React Query провайдер
│   └── globals.css          # Глобальные стили
├── components/              # React компоненты
│   ├── auth/               # Аутентификация
│   │   ├── LoginForm.tsx
│   │   └── SignUpForm.tsx
│   ├── dashboard/          # Dashboard компоненты
│   │   ├── Dashboard.tsx
│   │   ├── StatsCard.tsx
│   │   └── TaskChart.tsx
│   ├── layout/             # Layout компоненты
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── tasks/              # Компоненты задач
│   │   ├── KanbanBoard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── SortableTaskCard.tsx
│   │   └── CreateTaskModal.tsx
│   └── ui/                 # UI компоненты
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Badge.tsx
├── lib/                     # Утилиты и логика
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   ├── supabase.ts         # Supabase клиент
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript типы
│   └── utils.ts            # Утилиты
├── package.json            # Зависимости
├── tailwind.config.ts      # Конфигурация Tailwind
├── tsconfig.json           # Конфигурация TypeScript
└── next.config.mjs         # Конфигурация Next.js
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

### Vercel (рекомендуется)

1. Загрузите код на GitHub
2. Импортируйте проект в [Vercel](https://vercel.com)
3. Добавьте переменные окружения
4. Деплой автоматический!

### Другие платформы

Приложение можно задеплоить на:
- Netlify
- Railway
- Render
- AWS Amplify

## 📚 Обучающие комментарии

Весь код содержит подробные комментарии на русском языке, объясняющие:
- Назначение каждого компонента
- Как работают хуки и утилиты
- Паттерны и best practices
- TypeScript типы и интерфейсы

## 🤝 Вклад в проект

Это учебный проект для демонстрации навыков веб-разработки. Вы можете:
- Добавить новые фичи (календарь, уведомления, теги)
- Улучшить UI/UX
- Оптимизировать производительность
- Добавить тесты

## 📝 Лицензия

MIT License - используйте свободно для личных и коммерческих проектов.

## 🎓 Что вы узнаете из этого проекта

- Современный Next.js 14 с App Router
- TypeScript для типобезопасного кода
- Supabase для backend-as-a-service
- React Query для управления данными
- Zustand для state management
- TailwindCSS для быстрой стилизации
- Drag-and-drop с @dnd-kit
- Аутентификация и авторизация
- Real-time обновления
- Responsive дизайн
- Темная тема
- Best practices и паттерны

---
