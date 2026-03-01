'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BarConfig {
  key: string;
  color: string;
  name: string;
}

interface SimpleBarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: BarConfig[];
  height?: number;
}

export function SimpleBarChart({ data, xKey, bars, height = 300 }: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
        <Tooltip
          formatter={(value: number | undefined) => [
            value != null
              ? `KES ${(value / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
              : 'KES 0.00',
          ]}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={bar.color}
            name={bar.name}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
