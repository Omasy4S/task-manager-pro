/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем строгий режим React для выявления потенциальных проблем
  reactStrictMode: true,
  // Оптимизация изображений
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Переменные окружения, доступные на клиенте
  env: {
    NEXT_PUBLIC_APP_NAME: 'TaskMaster Pro',
  },
};

export default nextConfig;
