/**
 * Health Check Endpoint
 * 
 * Проверяет состояние приложения и его зависимостей.
 * Используется для monitoring и load balancer health checks.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  try {
    // Проверка подключения к базе данных
    const dbStart = performance.now();
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    const dbResponseTime = Math.round(performance.now() - dbStart);

    // Проверка памяти (только в Node.js окружении)
    const memoryUsage = typeof process !== 'undefined' && process.memoryUsage
      ? process.memoryUsage()
      : { heapUsed: 0, heapTotal: 0 };

    const memoryPercentage = memoryUsage.heapTotal > 0
      ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      : 0;

    const response: HealthCheckResponse = {
      status: dbError ? 'unhealthy' : 'healthy',
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: dbError ? 'down' : 'up',
          responseTime: dbResponseTime,
          error: dbError?.message,
        },
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          percentage: memoryPercentage,
        },
      },
    };

    // Логируем health check
    logger.info('Health check performed', {
      status: response.status,
      dbResponseTime,
      memoryPercentage,
    });

    // Возвращаем 503 если unhealthy
    const statusCode = response.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        uptime,
        version: process.env.npm_package_version || '1.0.0',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

// Отключаем кэширование для health check
export const dynamic = 'force-dynamic';
export const revalidate = 0;
