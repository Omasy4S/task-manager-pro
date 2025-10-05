# ⚡ Быстрый старт

## Текущий статус: ✅ Пакеты установлены!

Все npm пакеты успешно установлены. Теперь нужно настроить Supabase и запустить приложение.

## Что делать дальше:

### 1️⃣ Настроить Supabase (5 минут)

**Зачем?** Supabase предоставляет базу данных и аутентификацию для приложения.

1. Перейдите на https://supabase.com и войдите (через GitHub)
2. Создайте новый проект:
   - Name: `task-manager-pro`
   - Password: придумайте пароль
   - Region: выберите ближайший
3. Подождите 2-3 минуты создания проекта
4. Перейдите в **Settings → API**
5. Скопируйте:
   - **Project URL**
   - **anon public** ключ

### 2️⃣ Создать файл .env.local

Создайте файл `.env.local` в корне проекта и вставьте:

```env
NEXT_PUBLIC_SUPABASE_URL=ваш_url_здесь
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ_здесь
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Создать таблицы в Supabase

1. В Supabase Dashboard откройте **SQL Editor**
2. Скопируйте весь SQL код из файла `SETUP_GUIDE.md` (раздел 3.2)
3. Вставьте в SQL Editor и нажмите **Run**

### 4️⃣ Запустить приложение

```bash
npm run dev
```

Откройте http://localhost:3000 🎉

---

## 📖 Подробная инструкция

Если нужны детали, смотрите файл `SETUP_GUIDE.md`

## 🎯 Что вы получите:

✅ Современное приложение для управления задачами
✅ Dashboard с аналитикой и графиками
✅ Kanban доску с drag-and-drop
✅ Аутентификацию (email + Google OAuth)
✅ Темную/светлую тему
✅ Полностью responsive дизайн
✅ Real-time обновления

## 🛠️ Технологии:

- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **TailwindCSS** - стили
- **Supabase** - база данных + auth
- **React Query** - управление данными
- **Zustand** - state management
- **@dnd-kit** - drag-and-drop
- **Recharts** - графики

---

**Время на настройку: ~10 минут**
**Сложность: Легко** 🟢
