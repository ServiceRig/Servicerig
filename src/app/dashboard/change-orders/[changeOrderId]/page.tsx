
'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, Calendar, Tag, HardHat, FileDiff, Edit, Send, Printer } from 'lucide-react';
import { cn, getChangeOrderStatusStyles } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import type { ChangeOrder, Customer, Job } from '@/lib/types';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const InfoCard = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium text-sm">{children}</div>
        </div>
    </div>
);

function ChangeOrderDetailsPageContent({ changeOrderId }: { changeOrderId: string }) {
  const { role } = useRole();
  const [order, setOrder] = useState<ChangeOrder | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = mockData.changeOrders.find((co: any) => co.id === changeOrderId);
    if (data) {
        setOrder(data);
        setCustomer(mockData.customers.find((c: any) => c.id === data.customerId) || null);
        setJob(mockData.jobs.find((j: any) => j.id === data.jobId) || null);
    }
    setIsLoading(false);
  }, [changeOrderId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!order || !customer || !job) {
    return notFound();
  }
  
  const getHref = (path: string) => `/dashboard${path}?role=${role || 'admin'}`;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{order.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Change Order #{order.id}</p>
            <Badge className={cn("capitalize", getChangeOrderStatusStyles(order.status))}>
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print / PDF</Button>
            <Button><Send className="mr-2 h-4 w-4" /> Send to Customer</Button>
        </div>
      </div>
      
      <Separator />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Change Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{order.description}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.lineItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <Separator className="my-4" />
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2 text-right">
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total Change:</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <InfoCard icon={User} label="Customer">
                    <Link href={getHref(`/customers/${customer.id}`)} className="text-primary hover:underline">{customer.primaryContact.name}</Link>
                </InfoCard>
                <InfoCard icon={Tag} label="Original Job">
                    <Link href={getHref(`/jobs/${job.id}`)} className="text-primary hover:underline">{job.title}</Link>
                </InfoCard>
                <InfoCard icon={Calendar} label="Created Date">
                    {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                </InfoCard>
                 <InfoCard icon={HardHat} label="Technician">
                    {mockData.technicians.find((t: any) => t.id === job.technicianId)?.name || 'N/A'}
                </InfoCard>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ChangeOrderDetailsPage({ params }: { params: Promise<{ changeOrderId: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div>Loading Change Order...</div>}>
            <ChangeOrderDetailsPageContent changeOrderId={resolvedParams.changeOrderId} />
        </Suspense>
    )
}
