'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ChartData } from '@/lib/types';

/**
 * Компонент круговой диаграммы для визуализации данных
 * Использует библиотеку Recharts
 */

interface TaskChartProps {
  title: string;
  data: ChartData[];
}

export function TaskChart({ title, data }: TaskChartProps) {
  // Фильтруем данные с нулевыми значениями
  const filteredData = data.filter(item => item.value > 0);

  // Если нет данных, показываем заглушку
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 dark:text-gray-500">
              Нет данных для отображения
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            {/* Круговая диаграмма */}
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {/* Цвета для каждого сегмента */}
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            
            {/* Всплывающая подсказка */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            
            {/* Легенда */}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
