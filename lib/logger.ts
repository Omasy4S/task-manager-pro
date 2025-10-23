/**
 * Structured Logging System
 * 
 * Логирование в JSON формате для production-ready приложений.
 * Поддерживает различные уровни логирования и correlation IDs для трейсинга.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  taskId?: string;
  correlationId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: string;
  version: string;
}

class Logger {
  private environment: string;
  private version: string;
  private minLevel: LogLevel;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.version = process.env.npm_package_version || '1.0.0';
    this.minLevel = this.getMinLogLevel();
  }

  /**
   * Определяет минимальный уровень логирования на основе окружения
   */
  private getMinLogLevel(): LogLevel {
    if (this.environment === 'production') {
      return LogLevel.INFO;
    }
    if (this.environment === 'test') {
      return LogLevel.ERROR;
    }
    return LogLevel.DEBUG;
  }

  /**
   * Проверяет, нужно ли логировать сообщение данного уровня
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Создает структурированную запись лога
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.environment,
      version: this.version,
    };

    if (context) {
      // Фильтруем чувствительные данные
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.environment === 'development' ? error.stack : undefined,
      };
    }

    return entry;
  }

  /**
   * Удаляет чувствительные данные из контекста
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'authorization'];
    const sanitized = { ...context };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Выводит лог в консоль
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const output = JSON.stringify(entry);

    // В development выводим красиво
    if (this.environment === 'development') {
      const color = this.getColorForLevel(entry.level);
      console.log(color, `[${entry.level.toUpperCase()}]`, entry.message, entry.context || '');
      if (entry.error) {
        console.error(entry.error);
      }
    } else {
      // В production выводим JSON
      console.log(output);
    }

    // TODO: Отправка в внешний сервис (Sentry, Datadog, etc.)
    // this.sendToExternalService(entry);
  }

  /**
   * Возвращает цвет для консоли в зависимости от уровня
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * DEBUG level logging
   */
  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.output(entry);
  }

  /**
   * INFO level logging
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.output(entry);
  }

  /**
   * WARN level logging
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.output(entry);
  }

  /**
   * ERROR level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.output(entry);
  }

  /**
   * Логирование HTTP запросов
   */
  http(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`HTTP ${method} ${url} ${statusCode} ${duration}ms`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
    });
  }

  /**
   * Логирование операций с базой данных
   */
  database(operation: string, table: string, duration: number, context?: LogContext): void {
    this.debug(`DB ${operation} ${table} ${duration}ms`, {
      ...context,
      operation,
      table,
      duration,
    });
  }

  /**
   * Логирование бизнес-событий
   */
  event(eventName: string, context?: LogContext): void {
    this.info(`Event: ${eventName}`, {
      ...context,
      eventName,
    });
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Генерация correlation ID для трейсинга запросов
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Performance measurement wrapper
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - startTime);
    
    logger.debug(`Performance: ${operation} completed in ${duration}ms`, {
      ...context,
      operation,
      duration,
    });
    
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    logger.error(
      `Performance: ${operation} failed after ${duration}ms`,
      error instanceof Error ? error : new Error(String(error)),
      {
        ...context,
        operation,
        duration,
      }
    );
    
    throw error;
  }
}
