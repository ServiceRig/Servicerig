
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import type { Job, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FilePlus } from 'lucide-react';

type EnrichedJob = Job & {
    customerName: string;
};

// Simulate fetching jobs that are completed and don't have an invoice yet.
const getInvoicableJobs = (): EnrichedJob[] => {
    return mockData.jobs
        .filter(job => job.status === 'complete' && !job.invoiceId)
        .map(job => ({
            ...job,
            customerName: mockData.customers.find(c => c.id === job.customerId)?.primaryContact.name || 'Unknown',
        }));
}

export default function BatchInvoicingPage() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<EnrichedJob[]>(getInvoicableJobs());
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    
    const customers = useMemo(() => {
        const uniqueCustomers: Customer[] = [];
        const customerIds = new Set<string>();
        jobs.forEach(job => {
            if (!customerIds.has(job.customerId)) {
                const customer = mockData.customers.find(c => c.id === job.customerId);
                if(customer) {
                    uniqueCustomers.push(customer);
                    customerIds.add(job.customerId);
                }
            }
        });
        return uniqueCustomers;
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const customerMatch = customerFilter === 'all' || job.customerId === customerFilter;
            // Add other filters here (date range, etc.)
            return customerMatch;
        });
    }, [jobs, customerFilter]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedJobIds(new Set(filteredJobs.map(job => job.id)));
        } else {
            setSelectedJobIds(new Set());
        }
    }

    const handleSelectRow = (jobId: string, checked: boolean) => {
        setSelectedJobIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(jobId);
            } else {
                newSet.delete(jobId);
            }
            return newSet;
        });
    }

    const handleGenerateInvoices = () => {
        if (selectedJobIds.size === 0) {
            toast({
                variant: 'destructive',
                title: 'No Jobs Selected',
                description: 'Please select at least one job to generate an invoice.',
            });
            return;
        }

        // In a real app, this would trigger a server action
        console.log(`Generating invoices for ${selectedJobIds.size} jobs:`, Array.from(selectedJobIds));

        toast({
            title: 'Batch Generation Started',
            description: `Generating ${selectedJobIds.size} invoices. This may take a moment...`,
        });

        // Simulate success and remove generated jobs from the list
        setTimeout(() => {
            setJobs(prevJobs => prevJobs.filter(job => !selectedJobIds.has(job.id)));
            setSelectedJobIds(new Set());
             toast({
                title: 'Invoices Generated',
                description: `${selectedJobIds.size} invoices were created successfully.`,
            });
        }, 1500);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Batch Invoice Generation</CardTitle>
                <CardDescription>
                    Select completed jobs to generate multiple invoices at once.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <DateRangePicker />
                     <Select value={customerFilter} onValueChange={setCustomerFilter}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Filter by customer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>{customer.primaryContact.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input placeholder="Filter by service type..." className="w-full md:w-[200px]" />
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedJobIds.size > 0 && selectedJobIds.size === filteredJobs.length}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Job</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Completed Date</TableHead>
                                <TableHead>Technician</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.length > 0 ? filteredJobs.map(job => (
                                <TableRow key={job.id} data-state={selectedJobIds.has(job.id) && "selected"}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedJobIds.has(job.id)}
                                            onCheckedChange={(checked) => handleSelectRow(job.id, !!checked)}
                                            aria-label={`Select job ${job.id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{job.customerName}</TableCell>
                                    <TableCell>{format(new Date(job.schedule.end), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{job.technicianName}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No invoicable jobs found for the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleGenerateInvoices} disabled={selectedJobIds.size === 0}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Generate {selectedJobIds.size > 0 ? `${selectedJobIds.size} ` : ''}Invoices
                </Button>
            </CardFooter>
        </Card>
    );
}
