/**
 * Custom Error Classes
 * 
 * Типизированные ошибки для различных сценариев приложения.
 * Упрощают error handling и логирование.
 */

import { logger } from './logger';

/**
 * Базовый класс для всех кастомных ошибок приложения
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Сохраняем stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка аутентификации (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Ошибка авторизации (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Ошибка валидации (400)
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = [],
    context?: Record<string, any>
  ) {
    super(message, 400, true, { ...context, errors });
    this.errors = errors;
  }
}

/**
 * Ошибка "не найдено" (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, 404, true, context);
  }
}

/**
 * Ошибка конфликта (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

/**
 * Ошибка rate limiting (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', context?: Record<string, any>) {
    super(message, 429, true, context);
  }
}

/**
 * Ошибка базы данных (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', context?: Record<string, any>) {
    super(message, 500, true, context);
  }
}

/**
 * Ошибка внешнего сервиса (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, context?: Record<string, any>) {
    super(message || `${service} service unavailable`, 502, true, { ...context, service });
  }
}

/**
 * Error Handler для React компонентов
 */
export class ErrorHandler {
  /**
   * Обработка ошибок с логированием
   */
  static handle(error: unknown, context?: Record<string, any>): AppError {
    // Если это уже AppError, просто логируем
    if (error instanceof AppError) {
      logger.error(error.message, error, { ...context, ...error.context });
      return error;
    }

    // Если это стандартная Error
    if (error instanceof Error) {
      const appError = new AppError(error.message, 500, false, context);
      logger.error(error.message, error, context);
      return appError;
    }

    // Если это что-то другое
    const message = String(error);
    const appError = new AppError(message, 500, false, context);
    logger.error(message, undefined, context);
    return appError;
  }

  /**
   * Получение user-friendly сообщения об ошибке
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.errors.map((e) => e.message).join(', ');
    }

    if (error instanceof AppError) {
      return error.message;
    }

    if (error instanceof Error) {
      // В production не показываем технические детали
      if (process.env.NODE_ENV === 'production') {
        return 'An unexpected error occurred. Please try again.';
      }
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Проверка, является ли ошибка операционной (ожидаемой)
   */
  static isOperational(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}

/**
 * Wrapper для async функций с автоматическим error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw ErrorHandler.handle(error, context);
    }
  }) as T;
}

/**
 * Retry logic для операций, которые могут временно падать
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} retries`, lastError);
        throw lastError;
      }

      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
        error: lastError.message,
      });

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit Breaker для защиты от каскадных сбоев
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker: HALF_OPEN');
      } else {
        throw new ExternalServiceError(
          'Circuit Breaker',
          'Service temporarily unavailable'
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      logger.info('Circuit breaker: CLOSED');
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker: OPEN (${this.failures} failures)`);
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Graceful degradation - возвращает fallback значение при ошибке
 */
export async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.warn('Operation failed, using fallback', {
      ...context,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}
