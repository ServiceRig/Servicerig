

import { getJobData } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, Calendar, User, Building, Phone, MapPin, Wrench, FileText, ChevronRight, Navigation, FileDiff, ArrowLeft } from 'lucide-react';
import { cn, getEstimateStatusStyles, getJobStatusStyles } from '@/lib/utils';
import type { Job, ChangeOrder } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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

const getChangeOrderStatusStyles = (status: ChangeOrder['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'invoiced':
      case 'completed': return 'bg-blue-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending_approval': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
}

const InfoRow = ({ icon: Icon, label, children, actionButton }: { icon: React.ElementType, label: string, children: React.ReactNode, actionButton?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium flex items-center gap-2">{children} {actionButton}</div>
        </div>
    </div>
);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default async function JobDetailsPage({ params, searchParams }: { params: { jobId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const jobId = params.jobId;
  const role = searchParams.role || 'admin';
  const data = await getJobData(jobId);

  if (!data) {
    notFound();
  }

  const { job, customer, technician, estimates, changeOrders } = data;
  const duration = (new Date(job.schedule.end).getTime() - new Date(job.schedule.start).getTime()) / (1000 * 60);
  const getHref = (path: string) => `${path}?role=${role}`;
  const fullAddress = `${customer.companyInfo.address.street}, ${customer.companyInfo.address.city}, ${customer.companyInfo.address.state} ${customer.companyInfo.address.zipCode}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* The back button will be rendered on the client */}
        <ClientBackButton />
        <div className="flex-grow">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">JOB-{job.id.toUpperCase()}</p>
            <Badge className={cn("capitalize", getStatusStyles(job.status))}>
              {job.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Edit Job</Button>
            <Button asChild>
              <Link href={`/dashboard/invoices/new?jobId=${job.id}&customerId=${customer.id}&role=${role}`}>
                Create Invoice
              </Link>
            </Button>
        </div>
      </div>
      
      <Separator />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoRow icon={Wrench} label="Service Type">
                    {job.details.serviceType}
                </InfoRow>
                <InfoRow icon={FileText} label="Description">
                    <div className="whitespace-pre-wrap">{job.description}</div>
                </InfoRow>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <InfoRow icon={Calendar} label="Date">
                    {format(new Date(job.schedule.start), 'eeee, MMMM d, yyyy')}
                </InfoRow>
                <InfoRow icon={Clock} label="Time">
                    {format(new Date(job.schedule.start), 'h:mm a')} - {format(new Date(job.schedule.end), 'h:mm a')} ({duration} mins)
                </InfoRow>
            </CardContent>
          </Card>

          {estimates.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Linked Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estimate #</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estimates.map((estimate) => (
                                <TableRow key={estimate.id}>
                                    <TableCell>{estimate.estimateNumber}</TableCell>
                                    <TableCell className="font-medium">{estimate.title}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize", getEstimateStatusStyles(estimate.status))}>
                                          {estimate.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(estimate.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getHref(`/dashboard/estimates/${estimate.id}`)}>View Estimate</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          )}

           {changeOrders.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Linked Change Orders</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {changeOrders.map((co) => (
                                <TableRow key={co.id}>
                                    <TableCell className="font-medium">{co.title}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize", getChangeOrderStatusStyles(co.status))}>
                                          {co.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(co.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getHref(`/dashboard/change-orders/${co.id}`)}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          )}

        </div>

        {/* Side Content - Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoRow icon={Building} label="Name">
                     <Link href={getHref(`/dashboard/customers/${customer.id}`)} className="flex items-center text-primary hover:underline">
                        {customer.primaryContact.name}
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </InfoRow>
                <InfoRow icon={Phone} label="Phone">
                    <a href={`tel:${customer.primaryContact.phone}`} className="text-primary hover:underline">{customer.primaryContact.phone}</a>
                </InfoRow>
                 <InfoRow icon={MapPin} label="Address" actionButton={
                     <Button asChild size="icon" variant="ghost">
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noopener noreferrer">
                           <Navigation className="h-4 w-4 text-primary" />
                        </a>
                    </Button>
                 }>
                    {fullAddress}
                </InfoRow>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Technician</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <InfoRow icon={User} label="Assigned To">
                    {technician ? technician.name : 'Unassigned'}
                </InfoRow>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Linked Documents</CardTitle>
            </CardHeader>
            <CardContent>
                 <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                        <span>View Invoice</span>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Client component to handle router.back()
function ClientBackButton() {
    'use client';
    const { useRouter } = require("next/navigation");
    const router = useRouter();
    return (
        <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
    )
}
