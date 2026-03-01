'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LineConfig {
  key: string;
  color: string;
  name: string;
}

interface SimpleLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  lines: LineConfig[];
  height?: number;
}

export function SimpleLineChart({ data, xKey, lines, height = 300 }: SimpleLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
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
        {lines.map((line) => (
          <Line
            key={line.key}
            dataKey={line.key}
            stroke={line.color}
            name={line.name}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
