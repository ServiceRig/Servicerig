
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockData } from "@/lib/mock-data";

const priceHistoryData = [
  { date: 'Jan 24', 'Johnstone Supply': 12.00, 'Ferguson': 44.50, 'RE Michel': 84.00 },
  { date: 'Feb 24', 'Johnstone Supply': 12.10, 'Ferguson': 44.50, 'RE Michel': 84.50 },
  { date: 'Mar 24', 'Johnstone Supply': 12.15, 'Ferguson': 45.00, 'RE Michel': 85.00 },
  { date: 'Apr 24', 'Johnstone Supply': 12.25, 'Ferguson': 45.10, 'RE Michel': 85.00 },
  { date: 'May 24', 'Johnstone Supply': 12.50, 'Ferguson': 45.50, 'RE Michel': 86.00 },
  { date: 'Jun 24', 'Johnstone Supply': 12.50, 'Ferguson': 45.50, 'RE Michel': 86.50 },
  { date: 'Jul 24', 'Johnstone Supply': 12.75, 'Ferguson': 46.00, 'RE Michel': 87.00 },
];

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export function VendorPriceTrends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Price Trends</CardTitle>
        <CardDescription>Track the unit cost of key parts across different vendors over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorJohnstone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFerguson" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorREMichel" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <Tooltip 
                contentStyle={{ 
                    background: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
                formatter={formatCurrency}
              />
              <Legend />
              <Area type="monotone" dataKey="Johnstone Supply" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorJohnstone)" />
              <Area type="monotone" dataKey="Ferguson" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorFerguson)" />
              <Area type="monotone" dataKey="RE Michel" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorREMichel)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
