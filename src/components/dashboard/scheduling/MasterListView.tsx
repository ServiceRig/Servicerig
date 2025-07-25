
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn, getJobStatusStyles, getEstimateStatusStyles, getServiceAgreementStatusStyles } from '@/lib/utils';
import type { Job, Estimate, ServiceAgreement, Customer, Technician } from '@/lib/types';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

interface MasterListViewProps {
    jobs: Job[];
    estimates: Estimate[];
    serviceAgreements: ServiceAgreement[];
    customers: Customer[];
    technicians: Technician[];
}

export function MasterListView({ jobs, estimates, serviceAgreements, customers, technicians }: MasterListViewProps) {
    const { role } = useRole();
    const [searchTerm, setSearchTerm] = useState('');

    const getHref = (path: string) => {
        return role ? `${path}?role=${role}` : path;
    };
    
    const enrichedJobs = jobs.map(job => ({
        ...job,
        customerName: customers.find(c => c.id === job.customerId)?.primaryContact.name || 'N/A',
        technicianName: technicians.find(t => t.id === job.technicianId)?.name || 'Unassigned',
    }));

    const enrichedEstimates = estimates.map(est => ({
        ...est,
        customerName: customers.find(c => c.id === est.customerId)?.primaryContact.name || 'N/A',
    }));

    const enrichedAgreements = serviceAgreements.map(sa => ({
        ...sa,
        customerName: customers.find(c => c.id === sa.customerId)?.primaryContact.name || 'N/A',
    }));
    
    const filteredJobs = enrichedJobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredEstimates = enrichedEstimates.filter(est => est.title.toLowerCase().includes(searchTerm.toLowerCase()) || est.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAgreements = enrichedAgreements.filter(sa => sa.title.toLowerCase().includes(searchTerm.toLowerCase()) || sa.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Master Lists</CardTitle>
                <CardDescription>Search and view all jobs, estimates, and service agreements.</CardDescription>
                <div className="mt-4">
                    <Input 
                        placeholder="Search across all lists..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="jobs">
                    <TabsList>
                        <TabsTrigger value="jobs">Jobs ({filteredJobs.length})</TabsTrigger>
                        <TabsTrigger value="estimates">Estimates ({filteredEstimates.length})</TabsTrigger>
                        <TabsTrigger value="agreements">Agreements ({filteredAgreements.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="jobs" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.customerName}</TableCell>
                                        <TableCell>{job.technicianName}</TableCell>
                                        <TableCell>{format(new Date(job.schedule.start), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getJobStatusStyles(job.status))}>{job.status}</Badge></TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={getHref(`/dashboard/jobs/${job.id}`)}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="estimates" className="mt-4">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEstimates.map(estimate => (
                                    <TableRow key={estimate.id}>
                                        <TableCell className="font-medium">{estimate.title}</TableCell>
                                        <TableCell>{estimate.customerName}</TableCell>
                                        <TableCell>{format(new Date(estimate.createdAt), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getEstimateStatusStyles(estimate.status))}>{estimate.status}</Badge></TableCell>
                                        <TableCell>{formatCurrency(estimate.total)}</TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={getHref(`/dashboard/estimates/${estimate.id}`)}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="agreements" className="mt-4">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Next Due</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAgreements.map(agreement => (
                                    <TableRow key={agreement.id}>
                                        <TableCell className="font-medium">{agreement.title}</TableCell>
                                        <TableCell>{agreement.customerName}</TableCell>
                                        <TableCell className="capitalize">{agreement.billingSchedule.frequency}</TableCell>
                                        <TableCell>{format(new Date(agreement.billingSchedule.nextDueDate), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getServiceAgreementStatusStyles(agreement.status))}>{agreement.status}</Badge></TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href="#">View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
