# 📖 Подробная инструкция по настройке

## Шаг 1: Установка зависимостей ✅

Вы уже выполнили эту команду (или она выполняется):

```bash
npm install
```

Подождите, пока установятся все пакеты (~3-5 минут).

## Шаг 2: Настройка Supabase

### 2.1 Создание проекта

1. Перейдите на https://supabase.com
2. Нажмите **"Start your project"**
3. Войдите через GitHub (или создайте аккаунт)
4. Нажмите **"New Project"**
5. Заполните:
   - **Name**: `task-manager-pro`
   - **Database Password**: придумайте надежный пароль (сохраните его!)
   - **Region**: выберите ближайший регион
6. Нажмите **"Create new project"**
7. Подождите 2-3 минуты, пока проект создается

### 2.2 Получение API ключей

1. В левом меню выберите **Settings** (⚙️)
2. Выберите **API**
3. Найдите секцию **Project API keys**
4. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** ключ (длинная строка)

### 2.3 Создание файла .env.local

1. Скопируйте файл `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Откройте `.env.local` и вставьте ваши ключи:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_длинный_ключ_здесь
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Шаг 3: Создание таблиц в базе данных

### 3.1 Открыть SQL Editor

1. В Supabase Dashboard выберите **SQL Editor** в левом меню
2. Нажмите **"New query"**

### 3.2 Выполнить SQL скрипт

Скопируйте и вставьте этот SQL код:

```sql
-- Создаем таблицу пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу задач
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags TEXT[],
  "order" INTEGER DEFAULT 0
);

-- Включаем Row Level Security (RLS) для безопасности
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Политики доступа для profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Политики доступа для tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Создаем индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. Нажмите **"Run"** (или F5)
4. Вы должны увидеть **"Success. No rows returned"**

## Шаг 4: (Опционально) Настройка Google OAuth

Если хотите вход через Google:

1. В Supabase Dashboard: **Authentication → Providers**
2. Найдите **Google** и включите его
3. Следуйте инструкциям для получения Google Client ID и Secret
4. Добавьте redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Шаг 5: Запуск приложения

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере!

## ✅ Проверка работы

1. Откройте http://localhost:3000
2. Вы должны увидеть форму входа
3. Нажмите **"Зарегистрироваться"**
4. Создайте аккаунт
5. Проверьте email для подтверждения (если включено в Supabase)
6. Войдите в систему
7. Создайте первую задачу!

## 🐛 Возможные проблемы

### Ошибка: "Invalid API key"
- Проверьте, что скопировали правильные ключи из Supabase
- Убедитесь, что файл `.env.local` в корне проекта
- Перезапустите dev сервер (`npm run dev`)

### Ошибка: "relation does not exist"
- SQL скрипт не выполнен или выполнен с ошибками
- Проверьте в Supabase: **Table Editor** → должны быть таблицы `profiles` и `tasks`

### Ошибка: "Failed to fetch"
- Проверьте интернет соединение
- Убедитесь, что Supabase проект активен

### Email подтверждение не приходит
- Проверьте папку "Спам"
- В Supabase: **Authentication → Settings** → отключите "Enable email confirmations" для разработки

## 📞 Нужна помощь?

Если что-то не работает:
1. Проверьте консоль браузера (F12) на ошибки
2. Проверьте терминал на ошибки сервера
3. Убедитесь, что все переменные окружения правильные
4. Перезапустите dev сервер

---

**Готово! Теперь у вас есть полностью рабочее приложение для управления задачами! 🎉**
