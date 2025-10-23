# Database Documentation

## Обзор

TaskMaster Pro использует **PostgreSQL** через **Supabase** как managed database service.

**Версия PostgreSQL**: 15.x  
**Encoding**: UTF-8  
**Timezone**: UTC

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────┐
│            auth.users               │
│  (Supabase встроенная таблица)      │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ email           TEXT UNIQUE         │
│ encrypted_password TEXT             │
│ created_at      TIMESTAMPTZ         │
│ ...                                 │
└──────────────┬──────────────────────┘
               │
               │ 1:1
               │
┌──────────────▼──────────────────────┐
│          public.profiles            │
│  (Расширение пользователя)          │
├─────────────────────────────────────┤
│ id              UUID PK FK          │
│ email           TEXT UNIQUE NOT NULL│
│ full_name       TEXT                │
│ avatar_url      TEXT                │
│ created_at      TIMESTAMPTZ         │
│ updated_at      TIMESTAMPTZ         │
└──────────────┬──────────────────────┘
               │
               │ 1:N
               │
┌──────────────▼──────────────────────┐
│           public.tasks              │
│  (Задачи пользователей)             │
├─────────────────────────────────────┤
│ id              UUID PK             │
│ title           TEXT NOT NULL       │
│ description     TEXT                │
│ status          TEXT NOT NULL       │
│ priority        TEXT NOT NULL       │
│ due_date        TIMESTAMPTZ         │
│ created_at      TIMESTAMPTZ         │
│ updated_at      TIMESTAMPTZ         │
│ user_id         UUID FK NOT NULL    │
│ assigned_to     UUID FK             │
│ tags            TEXT[]              │
│ order           INTEGER DEFAULT 0   │
└─────────────────────────────────────┘
```

## Схема таблиц

### 1. public.profiles

Расширение встроенной таблицы `auth.users` для хранения дополнительной информации о пользователе.

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Колонка | Тип | Constraints | Описание |
|---------|-----|-------------|----------|
| id | UUID | PRIMARY KEY, FK → auth.users | ID пользователя из auth.users |
| email | TEXT | UNIQUE, NOT NULL | Email пользователя |
| full_name | TEXT | - | Полное имя пользователя |
| avatar_url | TEXT | - | URL аватара (Google OAuth или загруженный) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Дата создания профиля |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Дата последнего обновления |

**Индексы:**
- PRIMARY KEY на `id` (автоматически создается)
- UNIQUE INDEX на `email` (автоматически создается)

**Триггеры:**
- `update_profiles_updated_at` - автоматически обновляет `updated_at` при UPDATE

### 2. public.tasks

Основная таблица для хранения задач пользователей.

```sql
CREATE TABLE public.tasks (
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
```

| Колонка | Тип | Constraints | Описание |
|---------|-----|-------------|----------|
| id | UUID | PRIMARY KEY | Уникальный ID задачи (auto-generated) |
| title | TEXT | NOT NULL | Название задачи (макс 255 символов рекомендуется) |
| description | TEXT | - | Подробное описание задачи |
| status | TEXT | NOT NULL, CHECK | Статус: todo, in-progress, review, done |
| priority | TEXT | NOT NULL, CHECK | Приоритет: low, medium, high, urgent |
| due_date | TIMESTAMPTZ | - | Срок выполнения задачи |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Дата создания задачи |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Дата последнего обновления |
| user_id | UUID | FK → profiles, NOT NULL | Владелец задачи |
| assigned_to | UUID | FK → profiles | Кому назначена задача (может быть NULL) |
| tags | TEXT[] | - | Массив тегов для категоризации |
| order | INTEGER | DEFAULT 0 | Порядок сортировки в колонке Kanban |

**Индексы:**
```sql
CREATE INDEX tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX tasks_status_idx ON public.tasks(status);
CREATE INDEX tasks_priority_idx ON public.tasks(priority);
CREATE INDEX tasks_due_date_idx ON public.tasks(due_date);
```

**Обоснование индексов:**

1. **tasks_user_id_idx** (B-tree)
   - Запрос: `SELECT * FROM tasks WHERE user_id = ?`
   - Частота: каждая загрузка dashboard (очень часто)
   - Селективность: высокая (каждый пользователь имеет свои задачи)
   - Результат: O(log n) вместо O(n)

2. **tasks_status_idx** (B-tree)
   - Запрос: `SELECT * FROM tasks WHERE status = 'in-progress'`
   - Частота: фильтрация по статусу (часто)
   - Селективность: средняя (4 статуса)
   - Результат: ускорение фильтрации в 10-20x

3. **tasks_priority_idx** (B-tree)
   - Запрос: `SELECT * FROM tasks WHERE priority = 'urgent'`
   - Частота: фильтрация по приоритету (средне)
   - Селективность: средняя (4 приоритета)

4. **tasks_due_date_idx** (B-tree)
   - Запрос: `SELECT * FROM tasks WHERE due_date < NOW()`
   - Частота: поиск просроченных задач (средне)
   - Селективность: высокая (зависит от даты)
   - Результат: быстрый поиск overdue tasks

**Composite индекс (рекомендуется при масштабировании):**
```sql
CREATE INDEX tasks_user_status_idx ON public.tasks(user_id, status);
```
- Для запроса: `SELECT * FROM tasks WHERE user_id = ? AND status = ?`
- Покрывает 90% запросов приложения

**Триггеры:**
- `update_tasks_updated_at` - автоматически обновляет `updated_at` при UPDATE

## Row Level Security (RLS)

Все таблицы защищены Row Level Security для обеспечения безопасности на уровне БД.

### Политики для profiles

```sql
-- Все могут читать профили (для assigned_to)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Политики для tasks

```sql
-- Пользователи видят только свои задачи
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать задачи
CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои задачи
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователи могут удалять свои задачи
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);
```

**Важно**: RLS невозможно обойти через API, так как проверки происходят на уровне PostgreSQL.

## Триггеры и функции

### 1. Автоматическое обновление updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Автоматическое создание профиля при регистрации

```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**SECURITY DEFINER**: функция выполняется с правами владельца (обходит RLS для создания профиля).

## Миграции

### Версионирование

Все миграции хранятся в Supabase Dashboard → SQL Editor → History.

### Стратегия миграций

1. **Backward Compatible** - новые миграции не ломают старый код
2. **Rollback Plan** - каждая миграция имеет DOWN скрипт
3. **Testing** - тестируем на staging перед production

### Пример миграции

**UP Migration** (добавление колонки):
```sql
-- Migration: add_task_completed_at
-- Date: 2025-01-23

ALTER TABLE public.tasks 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX tasks_completed_at_idx ON public.tasks(completed_at);
```

**DOWN Migration** (откат):
```sql
-- Rollback: add_task_completed_at

DROP INDEX IF EXISTS tasks_completed_at_idx;
ALTER TABLE public.tasks DROP COLUMN IF EXISTS completed_at;
```

## Производительность

### Query Performance

**Типичные запросы и их производительность:**

1. **Загрузка задач пользователя**
```sql
SELECT * FROM tasks WHERE user_id = '...' ORDER BY order;
-- Время: ~5ms (с индексом)
-- Без индекса: ~50ms на 10k записей
```

2. **Фильтрация по статусу**
```sql
SELECT * FROM tasks WHERE user_id = '...' AND status = 'in-progress';
-- Время: ~3ms (с composite индексом)
```

3. **Поиск просроченных задач**
```sql
SELECT * FROM tasks 
WHERE user_id = '...' AND due_date < NOW() AND status != 'done';
-- Время: ~8ms
```

### Connection Pooling

Supabase использует PgBouncer для connection pooling:
- **Max connections**: 20 (free tier)
- **Pool mode**: Transaction
- **Timeout**: 10 seconds

### Optimization Tips

1. **Избегать N+1 queries**
   ```typescript
   // ❌ Плохо: N+1 запросов
   tasks.forEach(task => {
     const user = await getUser(task.userId);
   });

   // ✅ Хорошо: 1 запрос с JOIN
   const tasks = await supabase
     .from('tasks')
     .select('*, profiles(*)')
     .eq('user_id', userId);
   ```

2. **Использовать pagination**
   ```typescript
   // ✅ Pagination для больших списков
   const { data } = await supabase
     .from('tasks')
     .select('*')
     .range(0, 49); // 50 items per page
   ```

3. **Кэширование на уровне приложения**
   - React Query: staleTime 30s
   - Избегает лишних запросов к БД

## Масштабирование

### Текущие лимиты (Free Tier)

- **Database size**: 500MB
- **Bandwidth**: 2GB/month
- **Concurrent connections**: 20
- **Rows per table**: unlimited (но 500MB total)

### Расчет емкости

**Средний размер записи:**
- Profile: ~200 bytes
- Task: ~500 bytes (с description)

**Емкость:**
- Profiles: ~2.5M записей (500MB / 200 bytes)
- Tasks: ~1M записей (500MB / 500 bytes)

**Реальная емкость (с индексами и overhead):**
- ~10,000 пользователей
- ~100,000 задач
- Достаточно для MVP и первых клиентов

### План масштабирования

**При достижении 80% емкости:**

1. **Upgrade Supabase Plan**
   - Pro: $25/mo → 8GB database
   - Team: $599/mo → 100GB database

2. **Партиционирование**
   ```sql
   -- Партиционирование по user_id (если > 1M tasks)
   CREATE TABLE tasks_partitioned (
     LIKE tasks INCLUDING ALL
   ) PARTITION BY HASH (user_id);
   
   CREATE TABLE tasks_p0 PARTITION OF tasks_partitioned
     FOR VALUES WITH (MODULUS 4, REMAINDER 0);
   -- ... создать p1, p2, p3
   ```

3. **Архивирование старых данных**
   ```sql
   -- Перенос completed задач старше 1 года в архив
   CREATE TABLE tasks_archive (LIKE tasks INCLUDING ALL);
   
   INSERT INTO tasks_archive
   SELECT * FROM tasks
   WHERE status = 'done' AND updated_at < NOW() - INTERVAL '1 year';
   
   DELETE FROM tasks
   WHERE status = 'done' AND updated_at < NOW() - INTERVAL '1 year';
   ```

4. **Read Replicas**
   - Для аналитики и отчетов
   - Снижает нагрузку на primary database

## Backup & Recovery

### Автоматические бэкапы (Supabase)

- **Frequency**: Daily (free tier), Hourly (paid)
- **Retention**: 7 days (free), 30 days (paid)
- **Point-in-time recovery**: Paid plans only

### Ручной backup

```bash
# Экспорт всей БД
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql

# Экспорт только данных (без схемы)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres --data-only > data.sql

# Восстановление
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: < 1 hour
2. **RPO (Recovery Point Objective)**: < 24 hours (daily backups)
3. **Процедура восстановления**:
   - Создать новый Supabase проект
   - Восстановить из backup
   - Обновить environment variables
   - Redeploy приложение

## Мониторинг

### Метрики для отслеживания

1. **Database Size**
   ```sql
   SELECT pg_size_pretty(pg_database_size('postgres'));
   ```

2. **Table Sizes**
   ```sql
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Slow Queries**
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

4. **Index Usage**
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0 AND schemaname = 'public';
   ```

### Alerts

- Database size > 400MB (80% of free tier)
- Slow queries > 100ms
- Connection pool exhaustion
- Failed queries > 1% error rate

## Безопасность

### Checklist

- ✅ Row Level Security enabled
- ✅ Prepared statements (защита от SQL injection)
- ✅ Encrypted connections (SSL/TLS)
- ✅ Password hashing (bcrypt через Supabase)
- ✅ API keys в environment variables
- ❌ Database audit logging (TODO)
- ❌ Encryption at rest (Supabase Pro feature)

### Best Practices

1. **Никогда не отключать RLS** без веской причины
2. **Использовать параметризованные запросы** (Supabase делает автоматически)
3. **Ротация API keys** каждые 90 дней
4. **Минимальные привилегии** для service role key
5. **Регулярные security audits** (раз в квартал)

---

**Версия документа**: 1.0  
**Последнее обновление**: 2025-01-23  
**Автор**: Development Team
