'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface SimplePieChartProps {
  data: PieDataItem[];
  height?: number;
}

export function SimplePieChart({ data, height = 300 }: SimplePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) => [
            value != null
              ? `KES ${(value / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`
              : 'KES 0.00',
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
