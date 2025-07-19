
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
import { ProfitabilityChart } from '@/components/dashboard/reports/ProfitabilityChart';


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
            <CardTitle>Profitability Overview</CardTitle>
            <CardDescription>Key metrics for the selected period.</CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value="$125,430"
              change="+20.1% vs last period"
              icon={TrendingUp}
            />
            <StatCard
              title="Direct Expenses"
              value="$70,120"
              change="Includes labor & materials"
              icon={DollarSign}
            />
            <StatCard
              title="Gross Profit"
              value="$55,310"
              change="44.1% margin"
              icon={DollarSign}
            />
             <StatCard
              title="Net Profit"
              value="$25,890"
              change="20.6% margin"
              icon={Percent}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Profitability Over Time</CardTitle>
                <CardDescription>Track revenue, expenses, and profit for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfitabilityChart />
            </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Efficiency & Customer KPIs</CardTitle>
            <CardDescription>How your team and business are performing.</CardDescription>
          </CardHeader>
           <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Estimate-to-Close Rate"
              value="68%"
              change="Up from 65% last period"
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
