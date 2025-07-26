
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "../stat-card";
import { DollarSign, Repeat, Star, TrendingUp } from "lucide-react";

export function CustomerAnalytics() {
  // This would come from props or a hook that fetches analytics data
  const analyticsData = {
    lifetimeValue: 12450.75,
    averageJobValue: 830.05,
    repeatCustomerRate: 100, // Placeholder, would be calculated
    totalJobs: 15,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics & Insights</CardTitle>
        <CardDescription>Key metrics and behavioral insights for this customer relationship.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Lifetime Value" value={formatCurrency(analyticsData.lifetimeValue)} icon={DollarSign} change="Total revenue generated" />
          <StatCard title="Average Job Value" value={formatCurrency(analyticsData.averageJobValue)} icon={TrendingUp} change={`Across ${analyticsData.totalJobs} jobs`} />
          <StatCard title="Customer Since" value="Jan 2022" icon={Star} change="2 years, 6 months" />
          <StatCard title="Service Frequency" value="Every 2 months" icon={Repeat} change="Based on job history" />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Service History Breakdown</h4>
          <div className="h-48 bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Chart placeholder</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
