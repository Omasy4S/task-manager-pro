import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/**
 * Root Layout - корневой layout для всего приложения
 * Настраивает шрифты, метаданные и провайдеры
 */

// Загружаем шрифт Inter от Google Fonts
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

// Метаданные для SEO
export const metadata: Metadata = {
  title: 'TaskMaster Pro - Профессиональное управление задачами',
  description: 'Современное приложение для управления задачами с Kanban доской, аналитикой и real-time обновлениями',
  keywords: ['task manager', 'kanban', 'productivity', 'project management'],
  authors: [{ name: 'Your Name' }],
};

// Viewport конфигурация (отдельный экспорт для Next.js 14)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Провайдеры для React Query, Zustand и т.д. */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
