
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, MapPin, MoreHorizontal, CheckCircle, Clock } from 'lucide-react';
import { mockJobs, mockCustomers } from '@/lib/mock-data';
import type { Job, Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

type EnrichedJob = Job & {
  customer?: Customer;
};

// This would ideally come from the logged-in user's context
const LOGGED_IN_TECHNICIAN_ID = 'tech1'; 

const getStatusStyles = (status: Job['status']) => {
  switch (status) {
    case 'in_progress':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'complete':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'scheduled':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

const JobCard = ({ job }: { job: EnrichedJob }) => {
  const customerName = job.customer?.primaryContact.name || 'N/A';
  const customerInitials = customerName.split(' ').map(n => n[0]).join('');

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <Badge className={cn("mb-2", getStatusStyles(job.status))}>
            {job.status.replace('_', ' ')}
          </Badge>
          <CardTitle className="text-lg">{job.title}</CardTitle>
          <CardDescription>JOB-{job.id.toUpperCase()}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Job Details</DropdownMenuItem>
            <DropdownMenuItem>View Customer</DropdownMenuItem>
            <DropdownMenuItem>Change Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{customerInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{customerName}</p>
            <p className="text-sm text-muted-foreground">{job.customer?.primaryContact.phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 mt-1 shrink-0" />
          <p className="text-sm">{job.customer?.companyInfo.address}</p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline">
          <Phone className="mr-2 h-4 w-4" /> Call
        </Button>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" /> Text
        </Button>
      </CardFooter>
      <div className="p-4 pt-0 text-xs text-muted-foreground flex items-center">
        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        Completed: {job.schedule.end ? format(new Date(job.schedule.end), "MMM d, yyyy @ h:mm a") : 'N/A'}
      </div>
    </Card>
  );
};

const TodaysJobListItem = ({ job }: { job: EnrichedJob }) => {
    const customerName = job.customer?.primaryContact.name || 'N/A';
    const customerAddress = job.customer?.companyInfo.address || 'No address';

    return (
        <div className="flex items-center gap-4 py-3 border-b">
            <div className="flex items-center justify-center h-10 w-10 bg-muted rounded-full">
                <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-muted-foreground">{customerName}</p>
                <p className="text-xs text-muted-foreground">{customerAddress}</p>
            </div>
             <div className="text-right">
                <p className="text-sm font-medium">{format(new Date(job.schedule.start), 'h:mm a')}</p>
                <Badge variant="outline" className={cn(getStatusStyles(job.status), "mt-1")}>{job.status.replace('_', ' ')}</Badge>
            </div>
        </div>
    )
}

const JobsGrid = ({ jobs }: { jobs: EnrichedJob[] }) => {
  if (jobs.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No jobs in this category.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default function MySchedulePage() {
  const [jobs, setJobs] = useState<EnrichedJob[]>([]);

  useEffect(() => {
    // Simulate fetching and enriching data from Firestore
    const techJobs = mockJobs.filter(job => job.technicianId === LOGGED_IN_TECHNICIAN_ID);
    const enriched = techJobs.map(job => ({
      ...job,
      customer: mockCustomers.find(c => c.id === job.customerId),
    }));
    setJobs(enriched);
  }, []);

  const today = new Date();
  const isToday = (date: Date) => {
    const d = new Date(date);
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }

  const todaysJobs = jobs.filter(job => isToday(job.schedule.start)).sort((a,b) => new Date(a.schedule.start).getTime() - new Date(b.schedule.start).getTime());
  const upcomingJobs = jobs.filter(job => new Date(job.schedule.start) > today && job.status === 'scheduled');
  const needsInvoiceJobs = jobs.filter(job => job.status === 'complete' && !job.invoiceId);
  const allCompletedJobs = jobs.filter(job => job.status === 'complete');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Technician View</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Live Map</CardTitle>
            <CardDescription>Showing your live location and assigned jobs.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <img src="https://placehold.co/600x400.png" alt="Map placeholder" data-ai-hint="map usa" className="w-full h-full object-cover rounded-lg" />
            </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Today's Jobs</CardTitle>
                <CardDescription>Your scheduled jobs for today, {format(today, 'MMMM d, yyyy')}.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    {todaysJobs.length > 0 ? (
                        todaysJobs.map(job => <TodaysJobListItem key={job.id} job={job} />)
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No jobs scheduled for today.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="needs-invoice">Needs Invoice</TabsTrigger>
          <TabsTrigger value="all-completed">All Completed</TabsTrigger>
          <TabsTrigger value="personal-metrics">Personal Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <JobsGrid jobs={upcomingJobs} />
        </TabsContent>
        <TabsContent value="needs-invoice">
          <JobsGrid jobs={needsInvoiceJobs} />
        </TabsContent>
        <TabsContent value="all-completed">
          <JobsGrid jobs={allCompletedJobs} />
        </TabsContent>
        <TabsContent value="personal-metrics">
          <p className="text-center text-muted-foreground py-8">Personal metrics coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
