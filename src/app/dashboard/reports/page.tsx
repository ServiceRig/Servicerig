
'use client';

import React from 'react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
  Users,
  Repeat,
  FileText,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold tracking-tight text-foreground col-span-full">{children}</h2>
);

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">KPIs & Reports</h1>
          <p className="text-muted-foreground">
            Detailed insights into your business performance.
          </p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profitability KPIs</CardTitle>
            <CardDescription>How much are you really making?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Gross Profit per Job"
              value="$452.10"
              change="+5.2% vs last period"
              icon={DollarSign}
            />
            <StatCard
              title="Gross Profit per Tech Hour"
              value="$112.50"
              change="-1.8% vs last period"
              icon={DollarSign}
            />
            <StatCard
              title="Net Profit Margin"
              value="18.7%"
              change="+1.2% vs last period"
              icon={TrendingUp}
            />
             <StatCard
              title="Cost of Goods Sold (COGS) %"
              value="42.3%"
              change="Lower is better"
              icon={Percent}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time & Efficiency KPIs</CardTitle>
            <CardDescription>How are you using your most valuable asset?</CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Average Job Duration"
              value="2.1 hours"
              change="vs 2.3 hours last period"
              icon={Clock}
            />
            <StatCard
              title="Billable Utilization Rate"
              value="78.5%"
              change="Target: >85%"
              icon={Percent}
            />
            <StatCard
              title="First-Time Fix Rate"
              value="92%"
              change="+3% vs last period"
              icon={Briefcase}
            />
             <StatCard
              title="Jobs per Day per Technician"
              value="3.8"
              change="Target: 4.0"
              icon={Briefcase}
            />
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Revenue & Customer KPIs</CardTitle>
            <CardDescription>Pipeline strength and customer satisfaction.</CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Estimate-to-Close Rate"
              value="68%"
              change="Up from 65% last period"
              icon={Percent}
            />
            <StatCard
              title="Average Invoice Value"
              value="$875.22"
              change="+ $50.10 vs last period"
              icon={FileText}
            />
            <StatCard
              title="Customer Lifetime Value (CLV)"
              value="$4,580"
              change="An estimate of total revenue"
              icon={Users}
            />
             <StatCard
              title="Repeat Customer Rate"
              value="55%"
              change="Healthy retention"
              icon={Repeat}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
