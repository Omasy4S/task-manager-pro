# ⚡ Быстрый старт (Оптимизированная версия)

Краткое руководство по работе с оптимизированным проектом.

---

## 🎯 Что изменилось

Проект был **оптимизирован и структурирован** для:
- ✅ Легкого понимания кода
- ✅ Быстрой разработки
- ✅ Простого деплоя на GitHub Pages

---

## 🚀 Быстрый старт за 3 шага

### 1. Установка
```bash
npm install
```

### 2. Настройка
Создайте `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Запуск
```bash
npm run dev
```

Откройте http://localhost:3000

---

## 📁 Новая структура

### Константы (`lib/constants/`)
Все константы в одном месте:
```typescript
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/constants';
```

### Helpers (`lib/helpers/`)
Вспомогательные функции:
```typescript
import { calculateTaskStats } from '@/lib/helpers';
```

### Оптимизированные компоненты
Код разделен на блоки с четкими комментариями:
```typescript
// ============================================
// НАЗВАНИЕ БЛОКА
// ============================================
```

---

## 🌐 Деплой на GitHub Pages

### Автоматический деплой
1. Загрузите на GitHub
2. Настройте секреты
3. Включите GitHub Pages
4. Готово!

📖 **Подробно:** [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)

---

## 📚 Документация

- **README.md** - общее описание
- **PROJECT_STRUCTURE.md** - детальная структура
- **GITHUB_PAGES_DEPLOY.md** - инструкция по деплою
- **OPTIMIZATION_SUMMARY.md** - что было изменено

---

## 💡 Примеры использования

### Работа с константами
```typescript
// Вместо хардкода
const status = 'in-progress';
const label = 'В работе';

// Используйте константы
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/constants';
const status = TASK_STATUSES.IN_PROGRESS;
const label = TASK_STATUS_LABELS[status];
```

### Вычисление статистики
```typescript
// Вместо длинного кода
const stats = useMemo(() => {
  // 50+ строк вычислений
}, [tasks]);

// Используйте helper
import { calculateTaskStats } from '@/lib/helpers';
const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);
```

---

## 🎨 Разработка

### Добавление новой константы
1. Откройте `lib/constants/app.ts`
2. Добавьте константу
3. Экспортируйте через `lib/constants/index.ts`

### Добавление новой функции
1. Откройте `lib/helpers/calculations.ts`
2. Добавьте функцию
3. Экспортируйте через `lib/helpers/index.ts`

### Создание нового компонента
1. Создайте файл в соответствующей папке
2. Используйте константы и helpers
3. Добавьте комментарии-разделители

---

## ✅ Готово!

Проект готов к разработке и деплою!

**Удачи! 🚀**
