import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Утилита для объединения классов Tailwind
 * Использует clsx для условных классов и twMerge для правильного слияния Tailwind классов
 * 
 * Пример использования:
 * cn("px-4 py-2", isActive && "bg-blue-500", "px-6") 
 * Результат: "py-2 bg-blue-500 px-6" (px-6 перезаписывает px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование даты в читаемый формат
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Получение относительного времени (например, "2 часа назад")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "только что";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`;
  
  return formatDate(d);
}

/**
 * Генерация случайного ID (для временных задач до сохранения в БД)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Получение инициалов из имени пользователя
 * Пример: "Иван Петров" -> "ИП"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
