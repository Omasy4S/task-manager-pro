/**
 * Metrics Endpoint
 * 
 * Экспортирует метрики приложения для monitoring систем.
 * В production можно интегрировать с Prometheus, Datadog, etc.
 */

import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const allMetrics = metrics.getAllMetrics();

    logger.debug('Metrics endpoint accessed', {
      counters: allMetrics.counters.length,
      histograms: allMetrics.histograms.length,
      gauges: allMetrics.gauges.length,
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: allMetrics,
    });
  } catch (error) {
    logger.error('Failed to retrieve metrics', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

// Отключаем кэширование
export const dynamic = 'force-dynamic';
export const revalidate = 0;
