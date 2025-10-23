/**
 * Metrics Collection System
 * 
 * Собирает метрики производительности и использования приложения.
 * В production можно интегрировать с Prometheus, Datadog, или другими системами.
 */

import { logger } from './logger';

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface Counter {
  count: number;
  lastIncrement: number;
}

interface Histogram {
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

class MetricsCollector {
  private counters: Map<string, Counter> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private gauges: Map<string, number> = new Map();

  /**
   * Увеличивает счетчик на заданное значение
   */
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    const counter = this.counters.get(key) || { count: 0, lastIncrement: Date.now() };
    
    counter.count += value;
    counter.lastIncrement = Date.now();
    
    this.counters.set(key, counter);

    logger.debug(`Counter incremented: ${name}`, {
      name,
      value: counter.count,
      tags,
    });
  }

  /**
   * Записывает значение в гистограмму (для измерения latency, размеров, etc.)
   */
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    const histogram = this.histograms.get(key) || {
      values: [],
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
    };

    histogram.values.push(value);
    histogram.count++;
    histogram.sum += value;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);

    // Ограничиваем размер массива (храним последние 1000 значений)
    if (histogram.values.length > 1000) {
      histogram.values.shift();
    }

    this.histograms.set(key, histogram);

    logger.debug(`Histogram recorded: ${name}`, {
      name,
      value,
      tags,
    });
  }

  /**
   * Устанавливает значение gauge (текущее значение метрики)
   */
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    this.gauges.set(key, value);

    logger.debug(`Gauge set: ${name}`, {
      name,
      value,
      tags,
    });
  }

  /**
   * Получает текущее значение счетчика
   */
  getCounter(name: string, tags?: Record<string, string>): number {
    const key = this.getKey(name, tags);
    return this.counters.get(key)?.count || 0;
  }

  /**
   * Получает статистику по гистограмме
   */
  getHistogramStats(name: string, tags?: Record<string, string>): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.getKey(name, tags);
    const histogram = this.histograms.get(key);

    if (!histogram || histogram.count === 0) {
      return null;
    }

    const sorted = [...histogram.values].sort((a, b) => a - b);
    const avg = histogram.sum / histogram.count;

    return {
      count: histogram.count,
      sum: histogram.sum,
      min: histogram.min,
      max: histogram.max,
      avg: Math.round(avg * 100) / 100,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };
  }

  /**
   * Получает значение gauge
   */
  getGauge(name: string, tags?: Record<string, string>): number | null {
    const key = this.getKey(name, tags);
    return this.gauges.get(key) ?? null;
  }

  /**
   * Вычисляет перцентиль
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Создает уникальный ключ для метрики с тегами
   */
  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    return `${name}{${tagString}}`;
  }

  /**
   * Получает все метрики в формате для экспорта
   */
  getAllMetrics(): {
    counters: Array<{ name: string; value: number }>;
    histograms: Array<{ name: string; stats: any }>;
    gauges: Array<{ name: string; value: number }>;
  } {
    const counters = Array.from(this.counters.entries()).map(([name, counter]) => ({
      name,
      value: counter.count,
    }));

    const histograms = Array.from(this.histograms.keys()).map((name) => ({
      name,
      stats: this.getHistogramStats(name, undefined),
    }));

    const gauges = Array.from(this.gauges.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return { counters, histograms, gauges };
  }

  /**
   * Сбрасывает все метрики
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    logger.info('Metrics reset');
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

/**
 * Предопределенные метрики приложения
 */
export const MetricNames = {
  // HTTP метрики
  HTTP_REQUESTS_TOTAL: 'http_requests_total',
  HTTP_REQUEST_DURATION: 'http_request_duration_ms',
  HTTP_ERRORS_TOTAL: 'http_errors_total',

  // Database метрики
  DB_QUERIES_TOTAL: 'db_queries_total',
  DB_QUERY_DURATION: 'db_query_duration_ms',
  DB_ERRORS_TOTAL: 'db_errors_total',
  DB_CONNECTION_POOL_SIZE: 'db_connection_pool_size',

  // Task метрики
  TASKS_CREATED_TOTAL: 'tasks_created_total',
  TASKS_UPDATED_TOTAL: 'tasks_updated_total',
  TASKS_DELETED_TOTAL: 'tasks_deleted_total',
  TASKS_COMPLETED_TOTAL: 'tasks_completed_total',

  // Auth метрики
  AUTH_LOGIN_TOTAL: 'auth_login_total',
  AUTH_LOGIN_FAILURES: 'auth_login_failures',
  AUTH_SIGNUP_TOTAL: 'auth_signup_total',

  // Performance метрики
  PAGE_LOAD_TIME: 'page_load_time_ms',
  API_RESPONSE_TIME: 'api_response_time_ms',
  RENDER_TIME: 'render_time_ms',

  // Business метрики
  ACTIVE_USERS: 'active_users',
  TOTAL_TASKS: 'total_tasks',
  COMPLETION_RATE: 'completion_rate_percent',
} as const;

/**
 * Wrapper для измерения времени выполнения функции
 */
export async function measureExecutionTime<T>(
  metricName: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = Math.round(performance.now() - startTime);

    metrics.recordHistogram(metricName, duration, tags);

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    metrics.recordHistogram(metricName, duration, { ...tags, status: 'error' });
    throw error;
  }
}

/**
 * Middleware для трекинга HTTP запросов
 */
export function trackHttpRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number
): void {
  const tags = {
    method,
    path,
    status: String(statusCode),
  };

  metrics.incrementCounter(MetricNames.HTTP_REQUESTS_TOTAL, 1, tags);
  metrics.recordHistogram(MetricNames.HTTP_REQUEST_DURATION, duration, tags);

  if (statusCode >= 400) {
    metrics.incrementCounter(MetricNames.HTTP_ERRORS_TOTAL, 1, tags);
  }
}

/**
 * Трекинг операций с базой данных
 */
export function trackDatabaseQuery(
  operation: string,
  table: string,
  duration: number,
  success: boolean
): void {
  const tags = {
    operation,
    table,
    status: success ? 'success' : 'error',
  };

  metrics.incrementCounter(MetricNames.DB_QUERIES_TOTAL, 1, tags);
  metrics.recordHistogram(MetricNames.DB_QUERY_DURATION, duration, tags);

  if (!success) {
    metrics.incrementCounter(MetricNames.DB_ERRORS_TOTAL, 1, tags);
  }
}

/**
 * Трекинг бизнес-событий
 */
export const trackEvent = {
  taskCreated: () => metrics.incrementCounter(MetricNames.TASKS_CREATED_TOTAL),
  taskUpdated: () => metrics.incrementCounter(MetricNames.TASKS_UPDATED_TOTAL),
  taskDeleted: () => metrics.incrementCounter(MetricNames.TASKS_DELETED_TOTAL),
  taskCompleted: () => metrics.incrementCounter(MetricNames.TASKS_COMPLETED_TOTAL),
  
  userLogin: (success: boolean) => {
    if (success) {
      metrics.incrementCounter(MetricNames.AUTH_LOGIN_TOTAL);
    } else {
      metrics.incrementCounter(MetricNames.AUTH_LOGIN_FAILURES);
    }
  },
  
  userSignup: () => metrics.incrementCounter(MetricNames.AUTH_SIGNUP_TOTAL),
};

/**
 * Периодическая отправка метрик (для интеграции с внешними системами)
 */
export function startMetricsReporting(intervalMs: number = 60000): NodeJS.Timeout | null {
  // Только в Node.js окружении
  if (typeof setInterval === 'undefined') {
    return null;
  }

  return setInterval(() => {
    const allMetrics = metrics.getAllMetrics();
    
    logger.info('Metrics report', {
      counters: allMetrics.counters.length,
      histograms: allMetrics.histograms.length,
      gauges: allMetrics.gauges.length,
    });

    // TODO: Отправка в Prometheus, Datadog, CloudWatch, etc.
    // sendToPrometheus(allMetrics);
  }, intervalMs);
}
