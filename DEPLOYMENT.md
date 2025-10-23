# Deployment Guide

## Обзор

TaskMaster Pro может быть задеплоен на различных платформах. Документ описывает процесс деплоя для production-ready окружения.

## Предварительные требования

- Node.js 18+ установлен
- Git репозиторий настроен
- Supabase проект создан и настроен
- Environment variables подготовлены

## Платформы для деплоя

### 1. Vercel (Рекомендуется)

**Почему Vercel:**
- Zero-config для Next.js
- Automatic HTTPS и CDN
- Preview deployments для каждого PR
- Edge Functions поддержка
- Бесплатный tier для hobby проектов

#### Шаги деплоя на Vercel

**A. Через Vercel Dashboard (GUI)**

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте Git репозиторий
4. Настройте Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
5. Нажмите "Deploy"

**B. Через Vercel CLI**

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин
vercel login

# Деплой
vercel

# Production деплой
vercel --prod
```

**C. Environment Variables через CLI**

```bash
# Добавить переменные окружения
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_APP_URL production

# Список переменных
vercel env ls
```

#### Настройка Custom Domain

```bash
# Добавить домен
vercel domains add yourdomain.com

# Настроить DNS записи (в вашем DNS провайдере)
# A Record: @ → 76.76.21.21
# CNAME: www → cname.vercel-dns.com
```

#### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### 2. Railway

**Почему Railway:**
- Docker support из коробки
- Database hosting (PostgreSQL)
- Simple pricing ($5/mo starter)
- GitHub integration

#### Шаги деплоя на Railway

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Добавьте Environment Variables
5. Railway автоматически определит Next.js и задеплоит

**Railway CLI:**

```bash
# Установка
npm install -g @railway/cli

# Логин
railway login

# Инициализация
railway init

# Деплой
railway up
```

---

### 3. Render

**Почему Render:**
- Free tier с SSL
- Auto-deploy from Git
- Managed PostgreSQL
- Simple configuration

#### Шаги деплоя на Render

1. Зарегистрируйтесь на [render.com](https://render.com)
2. Создайте "New Web Service"
3. Подключите репозиторий
4. Настройте:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Добавьте Environment Variables
6. Нажмите "Create Web Service"

---

### 4. GitHub Pages (Текущая настройка)

**Ограничения:**
- Только static export (нет Server Components)
- Нет API routes
- Нет ISR (Incremental Static Regeneration)

**Не рекомендуется для production**, но подходит для демо.

#### Настройка GitHub Pages

**next.config.mjs:**
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/task-manager-pro',
  images: {
    unoptimized: true,
  },
};
```

**GitHub Actions (.github/workflows/deploy.yml):**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## Environment Variables

### Обязательные переменные

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL (для OAuth redirects)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Опциональные переменные (для production)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
```

### Безопасность переменных

**Никогда не коммитить:**
- ❌ `.env.local` в Git
- ❌ API keys в коде
- ❌ Database credentials

**Использовать:**
- ✅ Environment variables в платформе деплоя
- ✅ Secrets management (Vercel Secrets, Railway Variables)
- ✅ `.env.example` для документации

---

## CI/CD Pipeline

### Рекомендуемый workflow

```
Code Push → Lint → Type Check → Tests → Build → Deploy to Staging → Manual Approval → Deploy to Production
```

### GitHub Actions Configuration

**.github/workflows/ci.yml:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
        env:
          CI: true

  build:
    needs: [lint, type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://yourdomain.com
    steps:
      - uses: actions/checkout@v3
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Pre-deployment Checklist

### Code Quality

- [ ] Все тесты проходят (`npm test`)
- [ ] Нет TypeScript ошибок (`npm run type-check`)
- [ ] Нет ESLint warnings (`npm run lint`)
- [ ] Code review завершен

### Performance

- [ ] Bundle size проверен (`npm run build`)
- [ ] Lighthouse score > 90
- [ ] Images оптимизированы
- [ ] Нет console.log в production коде

### Security

- [ ] Environment variables настроены
- [ ] HTTPS включен
- [ ] Security headers настроены
- [ ] Dependencies обновлены (`npm audit`)
- [ ] Supabase RLS policies проверены

### Database

- [ ] Миграции применены
- [ ] Backup создан
- [ ] Индексы проверены
- [ ] Connection pooling настроен

### Monitoring

- [ ] Error tracking настроен (Sentry)
- [ ] Analytics настроен (Google Analytics)
- [ ] Uptime monitoring настроен (UptimeRobot)
- [ ] Alerts настроены

---

## Rollback Strategy

### Vercel Rollback

```bash
# Список деплоев
vercel ls

# Rollback к предыдущему деплою
vercel rollback [deployment-url]

# Или через Dashboard: Deployments → Previous → Promote to Production
```

### Manual Rollback

```bash
# Откатить Git commit
git revert HEAD
git push origin main

# CI/CD автоматически задеплоит предыдущую версию
```

### Database Rollback

```sql
-- Откатить миграцию (если есть DOWN скрипт)
-- Выполнить в Supabase SQL Editor

-- Пример: откат добавления колонки
ALTER TABLE tasks DROP COLUMN IF EXISTS new_column;
```

---

## Monitoring & Observability

### Health Check Endpoint

**app/api/health/route.ts:**

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Проверка подключения к БД
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### Uptime Monitoring

**Рекомендуемые сервисы:**
- [UptimeRobot](https://uptimerobot.com) - бесплатный, проверка каждые 5 минут
- [Pingdom](https://www.pingdom.com) - платный, более детальная аналитика
- [Better Uptime](https://betteruptime.com) - современный UI, status page

**Настройка UptimeRobot:**
1. Добавить monitor: `https://yourdomain.com/api/health`
2. Interval: 5 minutes
3. Alert contacts: email, Slack, SMS
4. Threshold: 2 consecutive failures

### Error Tracking (Sentry)

**Установка:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**sentry.client.config.ts:**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Не отправлять в development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### Performance Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

**app/layout.tsx:**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Scaling Strategy

### Horizontal Scaling

**Vercel автоматически масштабирует:**
- Serverless functions на каждый request
- Edge network для static assets
- Нет необходимости в ручной настройке

### Database Scaling

**При достижении лимитов:**

1. **Upgrade Supabase Plan**
   - Free → Pro: $25/mo (8GB database)
   - Pro → Team: $599/mo (100GB database)

2. **Connection Pooling**
   - Supabase использует PgBouncer
   - Max connections: 20 (free) → 200 (pro)

3. **Read Replicas**
   - Для аналитики и отчетов
   - Снижает нагрузку на primary

### CDN & Caching

**Vercel Edge Network:**
- Automatic caching для static assets
- Cache-Control headers для API responses
- Edge Functions для dynamic content

**Cache Strategy:**
```typescript
// app/api/tasks/route.ts
export async function GET() {
  const data = await fetchTasks();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

---

## Security Best Practices

### HTTPS Enforcement

**next.config.mjs:**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### Security Headers

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];
```

### Rate Limiting (TODO)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await rateLimit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  return NextResponse.next();
}
```

---

## Troubleshooting

### Common Issues

**1. Build fails on Vercel**
```bash
# Проверить локально
npm run build

# Проверить TypeScript
npm run type-check

# Проверить environment variables
vercel env ls
```

**2. Database connection timeout**
```typescript
// Увеличить timeout в supabase.ts
export const supabase = createClient(url, key, {
  realtime: {
    timeout: 30000, // 30 seconds
  },
});
```

**3. OAuth redirect не работает**
```bash
# Проверить NEXT_PUBLIC_APP_URL
echo $NEXT_PUBLIC_APP_URL

# Добавить redirect URL в Supabase Dashboard
# Authentication → URL Configuration → Redirect URLs
```

**4. Images не загружаются**
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
};
```

---

## Cost Estimation

### Free Tier (Hobby Project)

- **Vercel**: Free (100GB bandwidth, unlimited requests)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Total**: $0/month

### Production (Small Business)

- **Vercel Pro**: $20/month (1TB bandwidth)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **Sentry**: $26/month (50k errors)
- **Total**: ~$71/month

### Scale (10k+ users)

- **Vercel Team**: $100/month (unlimited bandwidth)
- **Supabase Team**: $599/month (100GB database)
- **Sentry Business**: $80/month (200k errors)
- **Total**: ~$779/month

---

## Support & Maintenance

### Regular Tasks

**Daily:**
- [ ] Проверить error rate в Sentry
- [ ] Проверить uptime в UptimeRobot

**Weekly:**
- [ ] Проверить performance metrics
- [ ] Review security alerts
- [ ] Update dependencies (`npm outdated`)

**Monthly:**
- [ ] Database backup verification
- [ ] Security audit (`npm audit`)
- [ ] Cost optimization review
- [ ] Performance optimization

**Quarterly:**
- [ ] Major dependencies update
- [ ] Security penetration testing
- [ ] Disaster recovery drill
- [ ] Architecture review

---

**Версия документа**: 1.0  
**Последнее обновление**: 2025-01-23  
**Автор**: Development Team
