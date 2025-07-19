
'use client';

import React, { useState } from 'react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitabilityChart } from '@/components/dashboard/reports/ProfitabilityChart';
import { allKpis, defaultVisibleKpis, Kpi } from '@/lib/kpi-data';
import { CustomizeKpiSheet } from '@/components/dashboard/reports/CustomizeKpiSheet';

const kpiCategories = [
  'Profitability',
  'Revenue & Conversion',
  'Operational Efficiency',
  'Technician Performance',
];

export default function ReportsPage() {
  const [visibleKpis, setVisibleKpis] = useState<Set<string>>(new Set(defaultVisibleKpis));

  const handleKpiToggle = (kpiId: string, checked: boolean) => {
    setVisibleKpis(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(kpiId);
      } else {
        newSet.delete(kpiId);
      }
      return newSet;
    });
  };

  const getVisibleKpisForCategory = (category: string) => {
    return allKpis.filter(kpi => kpi.category === category && visibleKpis.has(kpi.id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">KPIs / Reports</h1>
          <p className="text-muted-foreground">
            Detailed insights into your business performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <CustomizeKpiSheet 
                visibleKpis={visibleKpis}
                onKpiToggle={handleKpiToggle}
            />
            <DateRangePicker />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Profitability Over Time</CardTitle>
                <CardDescription>Track revenue, expenses, and profit for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfitabilityChart />
            </CardContent>
        </Card>

        {kpiCategories.map(category => {
            const kpis = getVisibleKpisForCategory(category);
            if (kpis.length === 0) return null;

            return (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {kpis.map(kpi => (
                             <StatCard
                                key={kpi.id}
                                title={kpi.title}
                                value={kpi.value}
                                change={kpi.change}
                                icon={kpi.icon}
                            />
                        ))}
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
