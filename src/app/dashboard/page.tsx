'use client';
import { Suspense } from 'react';
import { useRole } from "@/hooks/use-role";
import { AiEstimator } from "@/components/dashboard/ai-estimator";
import { CustomerView } from "@/components/dashboard/customer-view";
import { InvoiceView } from "@/components/dashboard/invoice-view";
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { Timeclock } from "@/components/dashboard/timeclock";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { capitalize } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const AdminDashboard = () => (
  <div className="grid gap-6">
    <ScheduleView />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CustomerView />
      <InvoiceView />
    </div>
    <AiEstimator />
  </div>
);

const DispatcherDashboard = () => (
  <div className="grid gap-6">
    <ScheduleView />
    <CustomerView />
    <AiEstimator />
  </div>
);

const TechnicianDashboard = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <ScheduleView />
    </div>
    <div className="space-y-6">
      <Timeclock />
      <Card>
        <CardHeader>
          <CardTitle>My Stats</CardTitle>
          <CardDescription>Your performance this week.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="flex justify-between"><span>Jobs Completed</span><span className="font-bold">12</span></div>
            <div className="flex justify-between"><span>Hours Logged</span><span className="font-bold">38.5</span></div>
            <div className="flex justify-between"><span>Customer Rating</span><span className="font-bold">4.9/5</span></div>
        </CardContent>
      </Card>
    </div>
  </div>
);

function DashboardPageContent() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }
  
  if (!role) {
     return (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Role Found!</AlertTitle>
          <AlertDescription>
            Redirecting to login...
          </AlertDescription>
        </Alert>
     )
  }

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'dispatcher':
        return <DispatcherDashboard />;
      case 'technician':
        return <TechnicianDashboard />;
      default:
        return <p>Invalid role selected.</p>;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold font-headline">
        {capitalize(role)} Dashboard
      </h1>
      {renderDashboard()}
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardPageContent />
        </Suspense>
    )
}
