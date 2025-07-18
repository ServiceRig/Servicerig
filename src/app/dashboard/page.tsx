
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRole } from "@/hooks/use-role";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, User, Wrench, FileText, Mic, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, BarChart } from "lucide-react";


const DispatcherDashboard = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold font-headline">
                Dispatcher Dashboard
            </h1>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Mic className="mr-2 h-4 w-4" /> Voice Command</Button>
                <Button className="bg-accent hover:bg-accent/90"><Plus className="mr-2 h-4 w-4" /> Schedule New Job</Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue" value="$0.00" change="+20.1% from last month" icon={DollarSign} />
            <StatCard title="Direct Expenses" value="$0.00" change="from completed jobs" icon={DollarSign} />
            <StatCard title="Gross Profit" value="$0.00" change="Revenue - Expenses" icon={BarChart} />
            <StatCard title="Pending Invoices" value="0" change="0 overdue" icon={FileText} />
            <StatCard title="Active Jobs" value="0" change="+2 since yesterday" icon={Wrench} />
            <StatCard title="Active Technicians" value="2" change="+1 since last week" icon={User} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Upcoming Jobs</CardTitle>
                            <CardDescription>A list of all scheduled jobs.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm"><Calendar className="mr-2 h-4 w-4" /> Go to Full Schedule</Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground text-center py-8">No upcoming jobs.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Unscheduled Jobs</CardTitle>
                    <CardDescription>Drag a job from here onto the full scheduler to assign it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">No unscheduled jobs.</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Jobs Complete, Not Invoiced</CardTitle>
                <CardDescription>These jobs are marked as completed but do not have an associated invoice yet.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Completed On</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>JOB-9611</TableCell>
                            <TableCell>john doe</TableCell>
                            <TableCell>Colton</TableCell>
                            <TableCell>July 16th, 2025</TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm">View Job</Button></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>JOB-6194</TableCell>
                            <TableCell>fsad asdf</TableCell>
                            <TableCell>Colton</TableCell>
                            <TableCell>July 16th, 2025</TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm">View Job</Button></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>JOB-2615</TableCell>
                            <TableCell>asdf asdf</TableCell>
                            <TableCell>Colton</TableCell>
                            <TableCell>July 16th, 2025</TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm">View Job</Button></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Agreement Services</CardTitle>
                <CardDescription>Recurring services that are due soon. Drag to the schedule to create a job.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming services in the next 30 days.</p>
            </CardContent>
        </Card>

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

  // For now, we only have one dashboard layout based on the screenshot.
  // We can add role-specific dashboards later.
  return <DispatcherDashboard />;
}

export default function DashboardPage() {
    return (
        <DashboardPageContent />
    )
}
