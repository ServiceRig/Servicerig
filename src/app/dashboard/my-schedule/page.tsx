
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, MapPin, MoreHorizontal, CheckCircle, Clock, Navigation } from 'lucide-react';
import { mockJobs, mockCustomers, mockData } from '@/lib/mock-data';
import type { Job, Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { FieldPurchaseDialog } from '@/components/dashboard/inventory/FieldPurchaseDialog';
import { useRole } from '@/hooks/use-role';

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

const JobCard = ({ job, role }: { job: EnrichedJob, role: string | null }) => {
  const customerName = job.customer?.primaryContact.name || 'N/A';
  const customerInitials = customerName.split(' ').map(n => n[0]).join('');
  const getHref = (path: string) => `${path}?role=${role || ''}`;
  const addressObj = job.customer?.companyInfo.address;
  const fullAddress = addressObj ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}` : 'No address available';
  
  const handleNavigate = () => {
    if (fullAddress !== 'No address available') {
      const address = encodeURIComponent(fullAddress);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

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
            <DropdownMenuItem asChild>
                <Link href={getHref(`/dashboard/jobs/${job.id}`)}>View Job Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={getHref(`/dashboard/customers/${job.customerId}`)}>View Customer</Link>
            </DropdownMenuItem>
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
          <p className="text-sm">{fullAddress}</p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
         <Button variant="outline" className="col-span-1" onClick={handleNavigate}>
          <Navigation className="mr-2 h-4 w-4" /> Nav
        </Button>
        <Button variant="outline" className="col-span-1">
          <Phone className="mr-2 h-4 w-4" /> Call
        </Button>
        <Button variant="outline" className="col-span-1">
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

const TodaysJobListItem = ({ job, role }: { job: EnrichedJob, role: string | null }) => {
    const customerName = job.customer?.primaryContact.name || 'N/A';
    const addressObj = job.customer?.companyInfo.address;
    const customerAddress = addressObj ? `${addressObj.street}, ${addressObj.city}` : 'No address';
    const getHref = (path: string) => `${path}?role=${role || ''}`;

    return (
        <Link href={getHref(`/dashboard/jobs/${job.id}`)} className="block hover:bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4 py-3 px-2 border-b">
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
        </Link>
    )
}

const JobsGrid = ({ jobs, role }: { jobs: EnrichedJob[], role: string | null }) => {
  if (jobs.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No jobs in this category.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} role={role} />
      ))}
    </div>
  );
};

export default function MySchedulePage() {
  const [jobs, setJobs] = useState<EnrichedJob[]>([]);
  const { role } = useRole();

  useEffect(() => {
    // Simulate fetching and enriching data from Firestore
    const techJobs = (mockData.jobs ?? []).filter(job => job.technicianId === LOGGED_IN_TECHNICIAN_ID);
    const enriched = techJobs.map(job => ({
      ...job,
      customer: (mockData.customers ?? []).find(c => c.id === job.customerId),
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
  
  const handleOptimizeRoute = () => {
    if (todaysJobs.length < 2) {
      alert("You need at least two jobs to optimize a route.");
      return;
    }
    
    // The Google Maps Directions API can optimize the order of waypoints.
    const waypoints = todaysJobs
        .slice(0, -1) // All but the last job are waypoints
        .map(job => {
          const addressObj = job.customer?.companyInfo.address;
          return addressObj ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}` : null;
        })
        .filter(Boolean)
        .join('|');

    const origin = (() => {
      const addressObj = todaysJobs[0].customer?.companyInfo.address;
      return addressObj ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}` : null;
    })();

    const destination = (() => {
      const addressObj = todaysJobs[todaysJobs.length - 1].customer?.companyInfo.address;
      return addressObj ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}` : null;
    })();

    if (!origin || !destination) {
        alert("Could not determine origin or destination address for all jobs.");
        return;
    }

    const googleMapsUrl = new URL('https://www.google.com/maps/dir/');
    googleMapsUrl.searchParams.append('api', '1');
    googleMapsUrl.searchParams.append('origin', origin);
    googleMapsUrl.searchParams.append('destination', destination);
    googleMapsUrl.searchParams.append('waypoints', waypoints);
    googleMapsUrl.searchParams.append('travelmode', 'driving');
    googleMapsUrl.searchParams.append('optimizeWaypoints', 'true');
    
    window.open(googleMapsUrl.toString(), '_blank');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Technician View</h1>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FieldPurchaseDialog jobs={jobs} onPurchaseLogged={() => { /* Implement data update logic */ }}/>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Live Map</CardTitle>
            <CardDescription>Showing your live location and assigned jobs.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <Image src="https://placehold.co/600x400.png" alt="Map placeholder" data-ai-hint="map usa" width={600} height={400} className="w-full h-full object-cover rounded-lg" />
            </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Today&apos;s Jobs</CardTitle>
                    <CardDescription>Your scheduled jobs for today, {format(today, 'MMMM d, yyyy')}.</CardDescription>
                </div>
                 <Button variant="outline" onClick={handleOptimizeRoute} disabled={todaysJobs.length < 2}>
                  <Navigation className="mr-2 h-4 w-4" /> Optimize Route
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    {todaysJobs.length > 0 ? (
                        todaysJobs.map(job => <TodaysJobListItem key={job.id} job={job} role={role} />)
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
          <JobsGrid jobs={upcomingJobs} role={role} />
        </TabsContent>
        <TabsContent value="needs-invoice">
          <JobsGrid jobs={needsInvoiceJobs} role={role} />
        </TabsContent>
        <TabsContent value="all-completed">
          <JobsGrid jobs={allCompletedJobs} role={role} />
        </TabsContent>
        <TabsContent value="personal-metrics">
          <p className="text-center text-muted-foreground py-8">Personal metrics coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
