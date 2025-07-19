
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { date: 'Jan 24', revenue: 4000, expenses: 2400, profit: 1600 },
  { date: 'Feb 24', revenue: 3000, expenses: 1398, profit: 1602 },
  { date: 'Mar 24', revenue: 2000, expenses: 9800, profit: -7800 },
  { date: 'Apr 24', revenue: 2780, expenses: 3908, profit: -1128 },
  { date: 'May 24', revenue: 1890, expenses: 4800, profit: -2910 },
  { date: 'Jun 24', revenue: 2390, expenses: 3800, profit: -1410 },
  { date: 'Jul 24', revenue: 3490, expenses: 4300, profit: -810 },
];

const formatCurrency = (value: number) => {
    if (value === 0) return '$0';
    return value < 0
        ? `-$${Math.abs(value / 1000).toFixed(0)}k`
        : `$${(value / 1000).toFixed(0)}k`;
};


export function ProfitabilityChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            cursor={{ fill: 'hsla(var(--muted), 0.5)' }}
            contentStyle={{ 
                background: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)'
            }}
          />
          <Legend
             iconType="circle"
             wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Expenses" />
          <Bar dataKey="profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
