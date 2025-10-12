/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // ОСНОВНЫЕ НАСТРОЙКИ
  // ============================================
  
  // Включаем строгий режим React
  reactStrictMode: true,
  
  // ============================================
  // НАСТРОЙКИ ДЛЯ GITHUB PAGES
  // ============================================
  
  // Статический экспорт для GitHub Pages
  output: 'export',
  
  // Базовый путь (замените на имя вашего репозитория)
  // Например: basePath: '/task-manager-pro'
  // Оставьте пустым если используете custom domain
  basePath: '/task-manager-pro',
  
  // Отключаем оптимизацию изображений для статического экспорта
  images: {
    unoptimized: true,
  },
  
  // ============================================
  // ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
  // ============================================
  
  env: {
    NEXT_PUBLIC_APP_NAME: 'TaskMaster Pro',
    // Supabase credentials - берем только из переменных окружения
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
