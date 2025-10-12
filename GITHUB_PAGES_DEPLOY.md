# 🚀 Деплой на GitHub Pages

Подробная инструкция по развертыванию проекта на GitHub Pages.

---

## 📋 Содержание

1. [Подготовка проекта](#подготовка-проекта)
2. [Настройка репозитория](#настройка-репозитория)
3. [Настройка переменных окружения](#настройка-переменных-окружения)
4. [Деплой](#деплой)
5. [Проверка работы](#проверка-работы)
6. [Решение проблем](#решение-проблем)

---

## 🔧 Подготовка проекта

### Шаг 1: Проверьте конфигурацию

Проект уже настроен для GitHub Pages. Проверьте файл `next.config.mjs`:

```javascript
output: 'export',  // Статический экспорт
basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
images: { unoptimized: true }
```

### Шаг 2: Установите зависимости

```bash
npm install
```

### Шаг 3: Проверьте локальную сборку

```bash
npm run build
```

Это создаст папку `out` со статическими файлами.

---

## 📦 Настройка репозитория

### Шаг 1: Создайте репозиторий на GitHub

1. Перейдите на [github.com](https://github.com)
2. Нажмите **New repository**
3. Введите имя (например: `task-manager-pro`)
4. Выберите **Public** (для бесплатного GitHub Pages)
5. Нажмите **Create repository**

### Шаг 2: Загрузите код

```bash
# Инициализируйте git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте коммит
git commit -m "Initial commit: Task Manager Pro"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/ВАШ_USERNAME/task-manager-pro.git

# Загрузите код
git branch -M main
git push -u origin main
```

### Шаг 3: Включите GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Pages**
3. В разделе **Source** выберите:
   - Source: **GitHub Actions**
4. Сохраните настройки

---

## 🔐 Настройка переменных окружения

### Обязательные секреты

Добавьте секреты в репозиторий:

1. Откройте **Settings** → **Secrets and variables** → **Actions**
2. Нажмите **New repository secret**
3. Добавьте следующие секреты:

#### `NEXT_PUBLIC_SUPABASE_URL`
```
Ваш Supabase Project URL
Пример: https://xxxxxxxxxxxxx.supabase.co
```

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
```
Ваш Supabase Anon/Public Key
```

### Опциональные переменные

Если ваш репозиторий называется НЕ `username.github.io`:

1. Перейдите в **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Нажмите **New repository variable**
3. Добавьте:

**Имя:** `NEXT_PUBLIC_BASE_PATH`  
**Значение:** `/имя-вашего-репозитория`  
Например: `/task-manager-pro`

> ⚠️ **Важно:** Если используете custom domain, НЕ добавляйте `NEXT_PUBLIC_BASE_PATH`

---

## 🚀 Деплой

### Автоматический деплой

После настройки, деплой происходит автоматически:

1. Сделайте изменения в коде
2. Закоммитьте и запушьте в `main`:
   ```bash
   git add .
   git commit -m "Update: описание изменений"
   git push
   ```
3. GitHub Actions автоматически соберет и задеплоит проект

### Ручной деплой

Запустите workflow вручную:

1. Откройте **Actions** в репозитории
2. Выберите **Deploy to GitHub Pages**
3. Нажмите **Run workflow**
4. Выберите ветку `main`
5. Нажмите **Run workflow**

### Отслеживание процесса

1. Перейдите во вкладку **Actions**
2. Откройте последний workflow
3. Следите за процессом сборки и деплоя

---

## ✅ Проверка работы

### Получите URL сайта

Ваш сайт будет доступен по адресу:

**Без custom domain:**
```
https://ВАШ_USERNAME.github.io/имя-репозитория/
```

**С custom domain:**
```
https://ваш-домен.com
```

### Проверьте функциональность

1. ✅ Открывается главная страница
2. ✅ Работает форма входа/регистрации
3. ✅ Подключение к Supabase
4. ✅ Темная/светлая тема
5. ✅ Адаптивный дизайн

---

## 🐛 Решение проблем

### Проблема: 404 ошибка при переходе

**Причина:** GitHub Pages не поддерживает client-side routing.

**Решение:** Используйте hash routing или добавьте `404.html`:

```bash
# В папке public создайте 404.html
cp public/index.html public/404.html
```

### Проблема: Стили не загружаются

**Причина:** Неправильный `basePath`.

**Решение:** 
1. Проверьте переменную `NEXT_PUBLIC_BASE_PATH`
2. Убедитесь, что она начинается с `/`
3. Пересоберите проект

### Проблема: Supabase не подключается

**Причина:** Неправильные секреты.

**Решение:**
1. Проверьте секреты в **Settings** → **Secrets**
2. Убедитесь, что URL и ключ правильные
3. Перезапустите workflow

### Проблема: Workflow падает с ошибкой

**Причина:** Ошибка сборки или отсутствие прав.

**Решение:**
1. Проверьте логи в **Actions**
2. Убедитесь, что GitHub Pages включен
3. Проверьте права workflow в **Settings** → **Actions** → **General**

### Проблема: Изображения не отображаются

**Причина:** Next.js Image optimization не работает в статическом экспорте.

**Решение:** Уже настроено в `next.config.mjs`:
```javascript
images: { unoptimized: true }
```

---

## 🎨 Custom Domain (опционально)

### Настройка собственного домена

1. Купите домен (например, на Namecheap, GoDaddy)
2. В настройках DNS добавьте записи:
   ```
   Type: A
   Host: @
   Value: 185.199.108.153
   
   Type: A
   Host: @
   Value: 185.199.109.153
   
   Type: A
   Host: @
   Value: 185.199.110.153
   
   Type: A
   Host: @
   Value: 185.199.111.153
   
   Type: CNAME
   Host: www
   Value: ВАШ_USERNAME.github.io
   ```
3. В репозитории: **Settings** → **Pages** → **Custom domain**
4. Введите ваш домен и сохраните
5. Включите **Enforce HTTPS**

---

## 📝 Дополнительные команды

### Локальная проверка сборки

```bash
# Соберите проект
npm run build

# Запустите локальный сервер для папки out
npx serve out
```

### Очистка кэша

```bash
# Удалите папки сборки
rm -rf .next out

# Пересоберите
npm run build
```

---

## 🔄 Обновление проекта

### Обновление кода

```bash
# Внесите изменения
# ...

# Закоммитьте
git add .
git commit -m "Update: описание"
git push

# Деплой произойдет автоматически
```

### Обновление зависимостей

```bash
# Обновите package.json
npm update

# Проверьте работу
npm run dev

# Закоммитьте и запушьте
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 📚 Полезные ссылки

- [GitHub Pages документация](https://docs.github.com/pages)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions документация](https://docs.github.com/actions)
- [Supabase документация](https://supabase.com/docs)

---

## 💡 Советы

1. **Используйте environment branches** для тестирования перед деплоем в production
2. **Настройте branch protection** для ветки `main`
3. **Добавьте status badge** в README для отображения статуса деплоя
4. **Мониторьте использование** GitHub Actions минут (2000 минут/месяц бесплатно)
5. **Включите Dependabot** для автоматического обновления зависимостей

---

## 🎉 Готово!

Ваш проект теперь доступен онлайн! 

Если возникли вопросы или проблемы, проверьте раздел [Решение проблем](#решение-проблем) или откройте issue в репозитории.

**Удачи с вашим Task Manager Pro! 🚀**
